from fastapi import APIRouter, UploadFile, File, Depends, Body
from services import file_ops

router = APIRouter(prefix="/files", tags=["Files"])

@router.get("/")
def list_files():
    return file_ops.list_all_files()

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


