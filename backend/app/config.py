import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL")
SECRET_KEY = os.environ.get("JWT_SECRET", "SUPER_SECRET_KEY_CHANGE_IN_PRODUCTION")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24
MAX_XLSX_SIZE = 10 * 1024 * 1024  # 10 MB