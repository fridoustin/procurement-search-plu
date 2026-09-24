import os

import psycopg
from dotenv import load_dotenv

load_dotenv()  # baca backend/.env
DATABASE_URL = os.environ["DATABASE_URL"]


def db(**kw):  # ponytail: koneksi baru per request; pakai pool kalau lambat
    return psycopg.connect(DATABASE_URL, options="-c timezone=Asia/Jakarta", **kw)