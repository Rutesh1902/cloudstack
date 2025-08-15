from fastapi import APIRouter, UploadFile, File, Depends, Body, Query
from services import file_ops
from services.file_ops import BASE_DIR
from fastapi import APIRouter, Query, HTTPException
from services import file_ops
from fastapi.responses import FileResponse
from fastapi import Body
from db.schemas import FileDeleteRequest
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

@router.delete("/")
def delete_files(request: FileDeleteRequest):
    print(FileDeleteRequest)
    deleted = []
    not_found = []
    for file_name in request.files:
        target = BASE_DIR / file_name
        if target.exists():
            target.unlink()
            deleted.append(file_name)
        else:
            not_found.append(file_name)
    return {"deleted": deleted, "not_found": not_found}

@router.post("/create-folder")
def create_folder(name: str = Body(...), path: str = Body(default="")):
    return file_ops.create_folder(name, path)

@router.post("/rename")
def rename(old_name: str = Body(...), new_name: str = Body(...), path: str = Body(default="")):
    return file_ops.rename_file(old_name, new_name, path)


