import io
import re
from datetime import date

import openpyxl
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response
from openpyxl.styles import Font, PatternFill
from psycopg.rows import dict_row
from app.database import get_db

router = APIRouter(prefix="/api", tags=["Items"])

COLS = "plu, name, supplier, dept, active, kuu, harga_sebelum, harga_update"
ORDER = "ORDER BY name, plu, supplier"
EXPORT_MAX = 50_000


def _where(q: str, kuu: str, active: bool | None, bulan: str = ""):
    """Filter yang sama dipakai tabel dan export, supaya hasilnya selalu identik.
    bulan ("YYYY-MM", opsional, khusus export): hanya baris yang terakhir diubah di bulan itu."""
    where, args = [], []
    if words := q.split():
        where.append("(plu = %s OR name ILIKE ALL (%s))")
        args += [q.strip(), [f"%{w}%" for w in words]]
    if kuu:
        where.append("kuu = %s")
        args.append(kuu)
    if active is not None:
        where.append("active = %s")
        args.append(active)
    if bulan:
        if not re.fullmatch(r"\d{4}-(0[1-9]|1[0-2])", bulan):
            raise HTTPException(400, "Format bulan harus YYYY-MM")
        y, m = int(bulan[:4]), int(bulan[5:])
        where.append("updated_at >= %s AND updated_at < %s")
        args += [date(y, m, 1), date(y + (m == 12), m % 12 + 1, 1)]
    return ("WHERE " + " AND ".join(where) if where else ""), args


@router.get("/items")
def get_items(
    q: str = "",
    kuu: str = "",
    active: bool | None = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    w, args = _where(q, kuu, active)
    with get_db(row_factory=dict_row) as c:
        total = c.execute(f"SELECT count(*) AS n FROM items {w}", args).fetchone()["n"]
        rows = c.execute(
            f"SELECT {COLS} FROM items {w} {ORDER} LIMIT %s OFFSET %s",
            [*args, limit, offset],
        ).fetchall()
    return {"total": total, "items": rows}


def _to_xlsx(rows) -> bytes:
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "PLU"
    ws.append(["PLU", "NAMA BARANG", "SUPPLIER", "GROUP DEPT", "STATUS", "KUU",
               "HARGA SEBELUM", "HARGA UPDATE", "TERAKHIR DIUBAH"])
    for c in ws[1]:
        c.font = Font(bold=True, color="FFFFFF")
        c.fill = PatternFill("solid", fgColor="C0312D")
    for r in rows:
        ws.append([r["plu"], r["name"], r["supplier"], r["dept"],
                   "AKTIF" if r["active"] else "TIDAK AKTIF", r["kuu"],
                   r["harga_sebelum"], r["harga_update"],
                   r["updated_at"].replace(tzinfo=None) if r["updated_at"] else None])
        ws.cell(ws.max_row, 1).number_format = "@"  # PLU tetap teks: 01001 tidak jadi 1001
        for col in (7, 8):
            ws.cell(ws.max_row, col).number_format = "#,##0"
        ws.cell(ws.max_row, 9).number_format = "yyyy-mm-dd hh:mm"
    for col, w in zip("ABCDEFGHI", [14, 45, 38, 14, 14, 9, 16, 16, 18]):
        ws.column_dimensions[col].width = w
    ws.freeze_panes = "A2"
    ws.auto_filter.ref = ws.dimensions
    buf = io.BytesIO()
    wb.save(buf)
    return buf.getvalue()


@router.get("/items/export")
def export_items(q: str = "", kuu: str = "", active: bool | None = None, bulan: str = ""):
    """Export SEMUA baris yang cocok dengan filter (bukan hanya halaman yang tampil)."""
    w, args = _where(q, kuu, active, bulan)
    with get_db(row_factory=dict_row) as c:
        rows = c.execute(
            f"SELECT {COLS}, updated_at FROM items {w} {ORDER} LIMIT %s", [*args, EXPORT_MAX]
        ).fetchall()
    return Response(
        _to_xlsx(rows),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="plu_{bulan or date.today()}.xlsx"'},
    )


@router.get("/stats")
def get_stats():
    with get_db(row_factory=dict_row) as c:
        out = c.execute("""
            SELECT count(*) AS total, count(DISTINCT plu) AS plu, count(DISTINCT supplier) AS suppliers,
                   count(*) FILTER (WHERE active) AS active,
                   count(*) FILTER (WHERE NOT active) AS inactive,
                   count(*) FILTER (WHERE created_at::date = current_date) AS new_today,
                   count(*) FILTER (WHERE updated_at > created_at AND updated_at::date = current_date) AS changed_today,
                   max(updated_at) AS last_update
            FROM items""").fetchone()
        out["per_dept"] = c.execute(
            "SELECT dept AS name, count(*) AS n FROM items GROUP BY dept ORDER BY n DESC"
        ).fetchall()
        out["per_kuu"] = c.execute(
            "SELECT kuu AS name, count(*) AS n, count(*) FILTER (WHERE active) AS active "
            "FROM items GROUP BY kuu ORDER BY kuu"
        ).fetchall()
    return out