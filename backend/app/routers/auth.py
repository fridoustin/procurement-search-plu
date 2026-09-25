from fastapi import APIRouter, HTTPException
from psycopg.rows import dict_row

from app.database import get_db
from app.models import LoginRequest, TokenResponse
from app.auth import verify_password, create_access_token

router = APIRouter(prefix="/api", tags=["Auth"])

@router.post("/login", response_model=TokenResponse)
def login(credentials: LoginRequest):
    with get_db(row_factory=dict_row) as c:
        admin = c.execute(
            "SELECT id, username, hashed_password FROM admins WHERE username = %s",
            (credentials.username,)
        ).fetchone()

    if not admin or not verify_password(credentials.password, admin["hashed_password"]):
        raise HTTPException(401, "Username atau password salah")

    token = create_access_token(data={"sub": admin["username"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "username": admin["username"],
    }