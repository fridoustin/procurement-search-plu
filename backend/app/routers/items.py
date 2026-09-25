from fastapi import APIRouter, Query
from psycopg.rows import dict_row
from app.database import get_db

router = APIRouter(prefix="/api", tags=["Items"])

@router.get("/items")
def get_items(
    q: str = "",
    kuu: str = "",
    active: bool | None = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
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
        
    w = "WHERE " + " AND ".join(where) if where else ""
    with get_db(row_factory=dict_row) as c:
        total = c.execute(f"SELECT count(*) AS n FROM items {w}", args).fetchone()["n"]
        rows = c.execute(
            f"SELECT plu, name, supplier, dept, active, kuu FROM items {w} "
            "ORDER BY name, plu, supplier LIMIT %s OFFSET %s",
            [*args, limit, offset],
        ).fetchall()
    return {"total": total, "items": rows}

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