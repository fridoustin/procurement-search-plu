import hmac
import io
import os
from datetime import datetime, timedelta

from fastapi import Depends, FastAPI, Header, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from jose import JWTError, jwt
from psycopg.rows import dict_row
from pydantic import BaseModel
from pwdlib import PasswordHash
from pwdlib.hashers.bcrypt import BcryptHasher

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

MAX_XLSX = 10 * 1024 * 1024

# --- KONFIGURASI AUTHENTICATION ADMIN ---
SECRET_KEY = os.environ.get("JWT_SECRET", "SUPER_SECRET_KEY_CHANGE_IN_PRODUCTION")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # Token berlaku 1 hari

# Inisialisasi password hasher (Bcrypt via pwdlib)
password_hash = PasswordHash((BcryptHasher(),))

# Credential Admin (Atur via env atau fallback ke default ini)
ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD_HASH = os.environ.get(
    "ADMIN_PASSWORD_HASH", password_hash.hash("adminpassword123")
)


class LoginRequest(BaseModel):
    username: str
    password: str


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_admin_token(authorization: str = Header("")):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Akses ditolak: Membutuhkan login admin")

    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(401, "Token tidak valid")
        return username
    except JWTError:
        raise HTTPException(401, "Sesi login telah berakhir, silakan login kembali")


# --- ENDPOINTS PUBLIK (Bisa diakses siapapun tanpa login) ---

@app.get("/api/items")
def items(
    q: str = "",
    kuu: str = "",
    active: bool | None = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
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
            "ORDER BY name, plu, supplier LIMIT %s OFFSET %s",
            [*args, limit, offset],
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
            "SELECT dept AS name, count(*) AS n FROM items GROUP BY dept ORDER BY n DESC"
        ).fetchall()
        out["per_kuu"] = c.execute(
            "SELECT kuu AS name, count(*) AS n, count(*) FILTER (WHERE active) AS active "
            "FROM items GROUP BY kuu ORDER BY kuu"
        ).fetchall()
    return out


@app.post("/api/login")
def login(credentials: LoginRequest):
    if credentials.username != ADMIN_USERNAME or not password_hash.verify(
        credentials.password, ADMIN_PASSWORD_HASH
    ):
        raise HTTPException(401, "Username atau password salah")

    access_token = create_access_token(data={"sub": credentials.username})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": credentials.username,
    }


# --- ENDPOINT RESTRICTED (Khusus Admin) ---

@app.post("/api/import")
def import_excel(
    file: UploadFile,
    current_user: str = Depends(verify_admin_token),
):
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