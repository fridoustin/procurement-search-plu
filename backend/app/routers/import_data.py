import io
from fastapi import APIRouter, Depends, HTTPException, UploadFile
from app.auth import verify_admin_token
from app.config import MAX_XLSX_SIZE
from app.database import get_db
from importer import load, upsert

router = APIRouter(prefix="/api", tags=["Import"])

@router.post("/import")
def import_excel(
    file: UploadFile,
    current_user: str = Depends(verify_admin_token),
):
    data = file.file.read(MAX_XLSX_SIZE + 1)
    if len(data) > MAX_XLSX_SIZE:
        raise HTTPException(413, "File terlalu besar (maks 10 MB)")
    try:
        rows, errors = load(io.BytesIO(data))
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception:
        raise HTTPException(400, "File bukan .xlsx yang valid")

    with get_db() as c:
        return {**upsert(c, rows), "errors": errors}