import os
from fastapi import UploadFile
from pathlib import Path

BASE_DIR = Path("C:/cloudtstack")  # update later via config
# services/file_ops.py

def list_all_files(path: str = ""):
    current_dir = BASE_DIR / path
    if not current_dir.exists():
        return {"error": "Path not found"}

    contents = []
    for f in current_dir.iterdir():
        contents.append({
            "name": f.name,
            "is_dir": f.is_dir(),
            "size": f.stat().st_size if f.is_file() else None,
            "modified": f.stat().st_mtime
        })
    return contents



async def upload_files(files: list[UploadFile], path: str = ""):
    upload_dir = BASE_DIR / path
    upload_dir.mkdir(parents=True, exist_ok=True)
    saved = []
    for file in files:
        dest = upload_dir / file.filename
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


def create_folder(name: str, path: str = ""):
    folder_path = BASE_DIR / path / name
    if folder_path.exists():
        return {"error": "Folder already exists"}
    folder_path.mkdir(parents=True, exist_ok=False)
    return {"status": "created", "folder": str(folder_path)}



def rename_file(old_name: str, new_name: str, path: str = ""):
    old_path = BASE_DIR / path / old_name
    new_path = BASE_DIR / path / new_name
    if not old_path.exists():
        return {"error": "File or folder not found"}
    old_path.rename(new_path)
    return {"status": "renamed", "from": old_name, "to": new_name}
