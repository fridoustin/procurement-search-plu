import hmac
import io
import os

from fastapi import FastAPI, Header, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from psycopg.rows import dict_row
from database import db
from importer import load, upsert

app = FastAPI()

# Konfigurasi CORS agar React (Vite) bisa berkomunikasi dengan FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN", "")  # kosong = upload dimatikan
MAX_XLSX = 10 * 1024 * 1024

@app.get("/api/items")
def items(q: str = "", kuu: str = "", active: bool | None = None,
          limit: int = Query(50, ge=1, le=200), offset: int = Query(0, ge=0)):
    where, args = [], []
    if words := q.split():
        # PLU harus persis (1001 != 01001); nama cukup memuat semua kata
        where.append("(plu = %s OR name ILIKE ALL (%s))")
        args += [q.strip(), [f"%{w}%" for w in words]]
    if kuu:
        where.append("kuu = %s")
        args.append(kuu)
    if active is not None:
        where.append("active = %s")
        args.append(active)
    w = "WHERE " + " AND ".join(where) if where else ""
    with db(row_factory=dict_row) as c:
        total = c.execute(f"SELECT count(*) AS n FROM items {w}", args).fetchone()["n"]
        rows = c.execute(
            f"SELECT plu, name, supplier, dept, active, kuu FROM items {w} "
            "ORDER BY name, plu, supplier LIMIT %s OFFSET %s", [*args, limit, offset]
        ).fetchall()
    return {"total": total, "items": rows}

@app.get("/api/stats")
def stats():
    with db(row_factory=dict_row) as c:
        out = c.execute("""
            SELECT count(*) AS total, count(DISTINCT plu) AS plu, count(DISTINCT supplier) AS suppliers,
                   count(*) FILTER (WHERE active) AS active,
                   count(*) FILTER (WHERE NOT active) AS inactive,
                   count(*) FILTER (WHERE created_at::date = current_date) AS new_today,
                   count(*) FILTER (WHERE updated_at > created_at AND updated_at::date = current_date) AS changed_today,
                   max(updated_at) AS last_update
            FROM items""").fetchone()
        out["per_dept"] = c.execute(
            "SELECT dept AS name, count(*) AS n FROM items GROUP BY dept ORDER BY n DESC").fetchall()
        out["per_kuu"] = c.execute(
            "SELECT kuu AS name, count(*) AS n, count(*) FILTER (WHERE active) AS active "
            "FROM items GROUP BY kuu ORDER BY kuu").fetchall()
    return out

@app.post("/api/import")
def import_excel(file: UploadFile, x_admin_token: str = Header("")):
    if not ADMIN_TOKEN or not hmac.compare_digest(x_admin_token.encode(), ADMIN_TOKEN.encode()):
        raise HTTPException(401, "Token salah")
    data = file.file.read(MAX_XLSX + 1)
    if len(data) > MAX_XLSX:
        raise HTTPException(413, "File terlalu besar (maks 10 MB)")
    try:
        rows, errors = load(io.BytesIO(data))
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception:
        raise HTTPException(400, "File bukan .xlsx yang valid")
    with db() as c:  # satu transaksi, gagal = rollback
        return {**upsert(c, rows), "errors": errors}

# Harus terakhir: hasil `npm run build` dilayani dari sini, rute /api tetap menang.
DIST = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.isdir(DIST):
    app.mount("/", StaticFiles(directory=DIST, html=True))