import os
from fastapi import UploadFile
from pathlib import Path

BASE_DIR = Path("C:/cloudtstack")  # update later via config

def list_all_files():
    return [{"name": f.name, "path": str(f)} for f in BASE_DIR.iterdir() if f.is_file()]

async def upload_files(files: list[UploadFile]):
    saved = []
    for file in files:
        dest = BASE_DIR / file.filename
        with open(dest, "wb") as buffer:
            buffer.write(await file.read())
        saved.append(file.filename)
    return {"uploaded": saved}

def delete_file(file_name: str):
    target = BASE_DIR / file_name
    if target.exists():
        target.unlink()
        return {"status": "deleted", "file": file_name}
    return {"error": "file not found"}
