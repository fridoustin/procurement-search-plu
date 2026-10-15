import re
from decimal import Decimal
import openpyxl

# Kolom Excel dikenali dari NAMA HEADER, bukan urutan -> kolom baru bebas diselipkan.
# HARGA opsional: kalau tidak ada di Excel, harga di DB tidak disentuh.
REQUIRED = ["PLU", "NAMA BARANG", "SUPPLIER", "GROUP DEPT", "STATUS", "KUU"]


def _price(v):
    if v is None or str(v).strip() == "":
        return None
    if isinstance(v, (int, float)):
        return Decimal(str(v))
    s = re.sub(r"[^\d,]", "", str(v)).replace(",", ".")  # "Rp 1.250.000,50" -> 1250000.50
    return Decimal(s) if s else None


def load(file_stream):
    """Baca Excel master item. Mengembalikan (rows, errors)."""
    wb = openpyxl.load_workbook(file_stream, data_only=True)
    sheet = wb.active
    it = sheet.iter_rows(values_only=True)
    header = [str(h).strip().upper() if h is not None else "" for h in next(it, [])]
    if missing := [h for h in REQUIRED if h not in header]:
        raise ValueError(f"Kolom tidak ditemukan di Excel: {', '.join(missing)}")
    col = {h: i for i, h in enumerate(header)}

    def get(row, name):
        i = col.get(name)
        return row[i] if i is not None and i < len(row) else None

    def text(row, name):
        v = get(row, name)
        return str(v).strip() if v is not None else ""

    rows, errors = [], []
    for row_idx, row in enumerate(it, start=2):
        if not any(row):
            continue
        try:
            plu, supplier = text(row, "PLU"), text(row, "SUPPLIER")
            if not plu or not supplier:
                errors.append(f"Baris {row_idx}: PLU atau Supplier kosong, dilewati.")
                continue
            rows.append({
                "plu": plu,
                "name": text(row, "NAMA BARANG"),
                "supplier": supplier,
                "dept": text(row, "GROUP DEPT"),
                "active": text(row, "STATUS").upper() == "AKTIF",
                "kuu": text(row, "KUU"),
                "harga": _price(get(row, "HARGA")),
            })
        except Exception as e:
            errors.append(f"Baris {row_idx}: Gagal diproses ({e})")
    return rows, errors


# harga_sebelum hanya terisi saat harga_update benar-benar berubah.
# Baris tanpa perubahan apa pun tidak disentuh (updated_at tetap) -> "Update Hari Ini" akurat.
UPSERT = """
    INSERT INTO items (plu, name, supplier, dept, active, kuu, harga_update, created_at, updated_at)
    VALUES (%(plu)s, %(name)s, %(supplier)s, %(dept)s, %(active)s, %(kuu)s, %(harga)s,
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (plu, supplier) DO UPDATE SET
        name = EXCLUDED.name,
        dept = EXCLUDED.dept,
        active = EXCLUDED.active,
        kuu = EXCLUDED.kuu,
        harga_sebelum = CASE
            WHEN EXCLUDED.harga_update IS NOT NULL
             AND items.harga_update IS NOT NULL
             AND EXCLUDED.harga_update <> items.harga_update
            THEN items.harga_update ELSE items.harga_sebelum END,
        harga_update = COALESCE(EXCLUDED.harga_update, items.harga_update),
        updated_at = CURRENT_TIMESTAMP
    WHERE (items.name, items.dept, items.active, items.kuu, items.harga_update)
          IS DISTINCT FROM
          (EXCLUDED.name, EXCLUDED.dept, EXCLUDED.active, EXCLUDED.kuu,
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