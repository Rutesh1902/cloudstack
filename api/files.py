from fastapi import APIRouter, UploadFile, File, Depends
from services import file_ops

router = APIRouter(prefix="/files", tags=["Files"])

@router.get("/")
def list_files():
    return file_ops.list_all_files()

@router.post("/upload")
async def upload_files(files: list[UploadFile] = File(...)):
    return await file_ops.upload_files(files)

@router.delete("/{file_name}")
def delete_file(file_name: str):
    return file_ops.delete_file(file_name)
