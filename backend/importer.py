import re
from decimal import Decimal
import openpyxl

# Header Excel -> field. Beberapa nama diterima supaya format lama & baru sama-sama bisa.
ALIASES = {
    "plu": ["PLU"],
    "name": ["NAMA ITEM", "NAMA BARANG"],
    "supplier": ["NAMA SUPPLIER", "SUPPLIER"],
    "dept": ["GROUP DEPT"],
    "status": ["STATUS"],
    "kuu": ["KODE USAHA", "KUU"],
    "kategori": ["KATEGORI INV", "KATEGORI"],  # opsional
    "harga": ["HARGA"],                        # opsional
}
REQUIRED = ["plu", "name", "supplier", "dept", "status", "kuu"]
STATUS = {"T": True, "AKTIF": True, "F": False, "TIDAK AKTIF": False}


def _price(v):
    """Harga angka atau teks. Mengerti "2,325,000.00", "1.250.000,50", "Rp 1.250.000", "1.00"."""
    if v is None or str(v).strip() == "":
        return None
    if isinstance(v, (int, float)):
        return Decimal(str(v))
    s = re.sub(r"[^\d.,]", "", str(v))
    if not re.search(r"\d", s):
        return None
    if "." in s and "," in s:
        dec = max(".", ",", key=s.rfind)  # pemisah yang muncul terakhir = desimal
    else:
        sep = "." if "." in s else "," if "," in s else None
        # satu pemisah saja: desimal bila muncul sekali & bukan 3 digit di belakangnya ("1.00", "1,5");
        # selain itu ribuan ("2,325", "1.250.000")
        dec = sep if sep and s.count(sep) == 1 and len(s.split(sep)[1]) != 3 else None
    if dec:
        whole, frac = s.rsplit(dec, 1)
        return Decimal(re.sub(r"\D", "", whole) + "." + re.sub(r"\D", "", frac))
    return Decimal(re.sub(r"\D", "", s))


def load(file_stream):
    """Baca Excel master item. Mengembalikan (rows, errors)."""
    wb = openpyxl.load_workbook(file_stream, data_only=True)
    sheet = wb.active
    it = sheet.iter_rows(values_only=True)
    header = [str(h).strip().upper() if h is not None else "" for h in next(it, [])]
    col = {f: header.index(n) for f, names in ALIASES.items() for n in names[::-1] if n in header}
    if missing := [f for f in REQUIRED if f not in col]:
        raise ValueError(f"Kolom tidak ditemukan di Excel: {', '.join(ALIASES[f][0] for f in missing)}")

    def raw(row, field):
        i = col.get(field)
        return row[i] if i is not None and i < len(row) else None

    def text(row, field):
        v = raw(row, field)
        return str(v).strip() if v is not None else ""

    rows, errors = [], []
    for row_idx, row in enumerate(it, start=2):
        if not any(row):
            continue
        try:
            plu, supplier, kuu = text(row, "plu"), text(row, "supplier"), text(row, "kuu")
            if not plu or not supplier or not kuu:
                errors.append(f"Baris {row_idx}: PLU, Supplier, atau Kode Usaha kosong, dilewati.")
                continue
            status = STATUS.get(text(row, "status").upper())
            if status is None:
                errors.append(f"Baris {row_idx}: Status '{text(row, 'status')}' tidak dikenali (T/F atau AKTIF/TIDAK AKTIF), dilewati.")
                continue
            rows.append({
                "plu": plu,
                "name": text(row, "name"),
                "supplier": supplier,
                "dept": text(row, "dept"),
                "active": status,
                "kuu": kuu,
                "kategori": text(row, "kategori") if "kategori" in col else None,  # None = kolom tidak ada -> DB tidak disentuh
                "harga": _price(raw(row, "harga")),
            })
        except Exception as e:
            errors.append(f"Baris {row_idx}: Gagal diproses ({e})")
    return rows, errors


# harga_sebelum hanya terisi saat harga_update benar-benar berubah.
# Baris tanpa perubahan apa pun tidak disentuh (updated_at tetap) -> "Update Hari Ini" akurat.
UPSERT = """
    INSERT INTO items (plu, name, supplier, dept, active, kuu, kategori, harga_update, created_at, updated_at)
    VALUES (%(plu)s, %(name)s, %(supplier)s, %(dept)s, %(active)s, %(kuu)s, %(kategori)s, %(harga)s,
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (plu, supplier, kuu) DO UPDATE SET
        name = EXCLUDED.name,
        dept = EXCLUDED.dept,
        active = EXCLUDED.active,
        kategori = COALESCE(EXCLUDED.kategori, items.kategori),
        harga_sebelum = CASE
            WHEN EXCLUDED.harga_update IS NOT NULL
             AND items.harga_update IS NOT NULL
             AND EXCLUDED.harga_update <> items.harga_update
            THEN items.harga_update ELSE items.harga_sebelum END,
        harga_update = COALESCE(EXCLUDED.harga_update, items.harga_update),
        updated_at = CURRENT_TIMESTAMP
    WHERE (items.name, items.dept, items.active, items.kategori, items.harga_update)
          IS DISTINCT FROM
          (EXCLUDED.name, EXCLUDED.dept, EXCLUDED.active,
           COALESCE(EXCLUDED.kategori, items.kategori),
           COALESCE(EXCLUDED.harga_update, items.harga_update))
    RETURNING (xmax = 0) AS is_inserted;
"""


def upsert(conn, rows):
    inserted = updated = unchanged = 0
    with conn.cursor() as cur:
        for item in rows:
            cur.execute(UPSERT, item)
            res = cur.fetchone()
            if res is None:
                unchanged += 1
            elif res[0]:
                inserted += 1
            else:
                updated += 1
    return {"inserted": inserted, "updated": updated, "unchanged": unchanged}


if __name__ == "__main__":  # cek cepat parser: python importer.py
    import io
    wb = openpyxl.Workbook(); ws = wb.active
    ws.append(["PLU", "HARGA", "NAMA BARANG", "SUPPLIER", "GROUP DEPT", "STATUS", "KUU"])
    ws.append(["01001", "Rp 1.250.000,50", "A", "S", "OSA", "AKTIF", "SCZ1"])
    ws.append(["0002", 5000, "B", "S", "OSA", "TIDAK AKTIF", "SCZ1"])
    ws.append(["0003", None, "C", "S", "OSA", "AKTIF", "SCZ1"])
    b = io.BytesIO(); wb.save(b); b.seek(0)
    r, e = load(b)
    assert [x["harga"] for x in r] == [Decimal("1250000.50"), Decimal("5000"), None], r
    assert r[0]["plu"] == "01001" and r[1]["active"] is False and not e
    print("ok")