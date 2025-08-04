from fastapi import APIRouter, UploadFile, File, Depends, Body, Query
from services import file_ops

from fastapi import APIRouter, Query, HTTPException
from services import file_ops
from fastapi.responses import FileResponse
router = APIRouter(prefix="/files", tags=["Files"])

@router.get("/")
def list_files(path: str = ""):
    return {"files":  file_ops.list_all_files(path)}


@router.get("/serve")
def serve_file(path: str):
    safe_path = path.lstrip("/")  #
    abs_path = file_ops.BASE_DIR / safe_path  # ✅ Ensure BASE_DIR is a Path object

    if not abs_path.exists() or not abs_path.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(abs_path)

@router.post("/upload")
async def upload_files(path: str = "", files: list[UploadFile] = File(...)):
    return await file_ops.upload_files(files, path)

@router.delete("/{file_name}")
def delete_file(file_name: str):
    return file_ops.delete_file(file_name)

@router.post("/create-folder")
def create_folder(name: str = Body(...), path: str = Body(default="")):
    return file_ops.create_folder(name, path)

@router.post("/rename")
def rename(old_name: str = Body(...), new_name: str = Body(...), path: str = Body(default="")):
    return file_ops.rename_file(old_name, new_name, path)


