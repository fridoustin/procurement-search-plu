import openpyxl

def load(file_stream):
    """Membaca file Excel Master_Item_.xlsx dan mengembalikan baris data bersumber dari Sheet2/Sheet1."""
    wb = openpyxl.load_workbook(file_stream, data_only=True)
    sheet = wb.active  # Mengambil sheet pertama/aktif
    
    rows = []
    errors = []

    for row_idx, row in enumerate(sheet.iter_rows(values_only=True), start=1):
        # Lewati header (baris 1) dan baris kosong
        if row_idx == 1 or not any(row):
            continue
        
        try:
            # Ambil data berdasarkan urutan kolom di Excel:
            # PLU | NAMA BARANG | SUPPLIER | GROUP DEPT | STATUS | KUU
            raw_plu = str(row[0]).strip() if row[0] is not None else ""
            raw_name = str(row[1]).strip() if row[1] is not None else ""
            raw_supplier = str(row[2]).strip() if row[2] is not None else ""
            raw_dept = str(row[3]).strip() if row[3] is not None else ""
            raw_status = str(row[4]).strip().upper() if row[4] is not None else ""
            raw_kuu = str(row[5]).strip() if len(row) > 5 and row[5] is not None else ""

            if not raw_plu or not raw_supplier:
                errors.append(f"Baris {row_idx}: PLU atau Supplier kosong, dilewati.")
                continue

            # Konversi status ke boolean
            is_active = (raw_status == "AKTIF")

            rows.append({
                "plu": raw_plu,
                "name": raw_name,
                "supplier": raw_supplier,
                "dept": raw_dept,
                "active": is_active,
                "kuu": raw_kuu
            })
        except Exception as e:
            errors.append(f"Baris {row_idx}: Gagal diproses ({str(e)})")

    return rows, errors


def upsert(conn, rows):
    """
    Melakukan INSERT jika (plu, supplier) belum ada,
    atau UPDATE jika (plu, supplier) sudah ada di database.
    """
    inserted = 0
    updated = 0

    query = """
        INSERT INTO items (plu, name, supplier, dept, active, kuu, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (plu, supplier) 
        DO UPDATE SET
            name = EXCLUDED.name,
            dept = EXCLUDED.dept,
            active = EXCLUDED.active,
            kuu = EXCLUDED.kuu,
            updated_at = CURRENT_TIMESTAMP
        RETURNING (xmin = 0) AS is_inserted;
    """

    with conn.cursor() as cursor:
        for item in rows:
            cursor.execute(query, (
                item["plu"],
                item["name"],
                item["supplier"],
                item["dept"],
                item["active"],
                item["kuu"]
            ))
            res = cursor.fetchone()
            if res and res[0]:
                inserted += 1
            else:
                updated += 1

    return {"inserted": inserted, "updated": updated}