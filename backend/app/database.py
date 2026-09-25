import psycopg
from app.config import DATABASE_URL

def get_db(**kw):
    return psycopg.connect(DATABASE_URL, options="-c timezone=Asia/Jakarta", **kw)