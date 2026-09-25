from datetime import datetime, timedelta
from fastapi import Header, HTTPException
from jose import JWTError, jwt
from pwdlib import PasswordHash
from pwdlib.hashers.bcrypt import BcryptHasher

from app.config import ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, SECRET_KEY

password_hash = PasswordHash((BcryptHasher(),))

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_hash.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_admin_token(authorization: str = Header("")) -> str:
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