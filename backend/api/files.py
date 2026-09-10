from datetime import datetime, timezone
from pathlib import PurePath

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from auth.auth import get_current_user
from db.connection import get_db
from db.models import Node, User
from db.schemas import CreateFolderRequest, NodeOut, UpdateNodeRequest
from services.storage import storage

router = APIRouter(prefix="/files", tags=["Files"])


def validate_name(name: str) -> str:
    if name in {".", ".."} or PurePath(name).name != name or "\x00" in name:
        raise HTTPException(status_code=422, detail="Invalid file or folder name")
    return name


def owned_node(db: Session, user: User, node_id: str, *, include_deleted: bool = False) -> Node:
    query = db.query(Node).filter(Node.id == node_id, Node.owner_id == user.id)
    if not include_deleted:
        query = query.filter(Node.deleted_at.is_(None))
    node = query.first()
    if node is None:
        raise HTTPException(status_code=404, detail="File or folder not found")
    return node


def validate_parent(db: Session, user: User, parent_id: str | None) -> None:
    if parent_id is not None:
        parent = owned_node(db, user, parent_id)
        if parent.kind != "folder":
            raise HTTPException(status_code=422, detail="Parent must be a folder")


def parent_is_descendant(db: Session, node: Node, parent_id: str | None) -> bool:
    current_id = parent_id
    while current_id is not None:
        if current_id == node.id:
            return True
        parent = db.get(Node, current_id)
        current_id = parent.parent_id if parent else None
    return False


def subtree(db: Session, root: Node, include_deleted: bool = False) -> list[Node]:
    result, pending = [], [root.id]
    while pending:
        current_id = pending.pop()
        current = db.get(Node, current_id)
        if current is None:
            continue
        result.append(current)
        query = db.query(Node.id).filter(Node.parent_id == current_id)
        if not include_deleted:
            query = query.filter(Node.deleted_at.is_(None))
        pending.extend(child.id for child in query)
    return result


def name_taken(db: Session, user: User, parent_id: str | None, name: str, except_id: str | None = None) -> bool:
    query = db.query(Node).filter(Node.owner_id == user.id, Node.parent_id == parent_id, Node.name == name, Node.deleted_at.is_(None))
    if except_id:
        query = query.filter(Node.id != except_id)
    return query.first() is not None


@router.get("", response_model=list[NodeOut])
def list_files(parent_id: str | None = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    validate_parent(db, user, parent_id)
    return db.query(Node).filter(Node.owner_id == user.id, Node.parent_id == parent_id, Node.deleted_at.is_(None)).order_by(Node.kind.desc(), Node.name).all()


@router.post("/folders", response_model=NodeOut, status_code=status.HTTP_201_CREATED)
def create_folder(request: CreateFolderRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    name = validate_name(request.name)
    validate_parent(db, user, request.parent_id)
    if name_taken(db, user, request.parent_id, name):
        raise HTTPException(status_code=409, detail="An item with this name already exists")
    node = Node(owner_id=user.id, parent_id=request.parent_id, name=name, kind="folder")
    db.add(node)
    db.commit()
    db.refresh(node)
    return node


@router.post("/upload", response_model=list[NodeOut], status_code=status.HTTP_201_CREATED)
async def upload_files(parent_id: str | None = Form(default=None), files: list[UploadFile] = File(...), db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    validate_parent(db, user, parent_id)
    uploaded: list[Node] = []
    names: set[str] = set()
    used = db.query(func.coalesce(func.sum(Node.size), 0)).filter(Node.owner_id == user.id, Node.deleted_at.is_(None)).scalar() or 0
    for upload in files:
        name = validate_name(upload.filename or "unnamed")
        if name in names or name_taken(db, user, parent_id, name):
            raise HTTPException(status_code=409, detail=f"An item named '{name}' already exists")
        names.add(name)
        storage_key, size, checksum = await storage.save_upload(upload)
        if used + size > user.quota_bytes:
            storage.delete(storage_key)
            raise HTTPException(status_code=413, detail="Storage quota exceeded")
        node = Node(owner_id=user.id, parent_id=parent_id, name=name, kind="file", storage_key=storage_key, size=size, mime_type=upload.content_type, checksum=checksum)
        db.add(node)
        uploaded.append(node)
        used += size
    db.commit()
    for node in uploaded:
        db.refresh(node)
    return uploaded


@router.get("/{node_id}/download")
def download_file(node_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    node = owned_node(db, user, node_id)
    if node.kind != "file":
        raise HTTPException(status_code=422, detail="Folders cannot be downloaded")
    return FileResponse(storage.path_for(node.storage_key), media_type=node.mime_type, filename=node.name)


@router.patch("/{node_id}", response_model=NodeOut)
def update_node(node_id: str, request: UpdateNodeRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    node = owned_node(db, user, node_id)
    name = validate_name(request.name) if request.name is not None else node.name
    parent_id = request.parent_id if "parent_id" in request.model_fields_set else node.parent_id
    validate_parent(db, user, parent_id)
    if node.kind == "folder" and parent_is_descendant(db, node, parent_id):
        raise HTTPException(status_code=422, detail="A folder cannot be moved into itself or a descendant")
    if name_taken(db, user, parent_id, name, node.id):
        raise HTTPException(status_code=409, detail="An item with this name already exists")
    node.name, node.parent_id = name, parent_id
    db.commit()
    db.refresh(node)
    return node


@router.delete("/{node_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_node(node_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    node = owned_node(db, user, node_id)
    deleted_at = datetime.now(timezone.utc)
    for item in subtree(db, node):
        item.deleted_at = deleted_at
    db.commit()


@router.delete("/{node_id}/permanent", status_code=status.HTTP_204_NO_CONTENT)
def permanent_delete_node(node_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    node = owned_node(db, user, node_id, include_deleted=True)
    if node.deleted_at is None:
        raise HTTPException(status_code=422, detail="Item must be in trash to be permanently deleted")
    for item in subtree(db, node, include_deleted=True):
        if item.storage_key:
            storage.delete(item.storage_key)
        db.delete(item)
    db.commit()


@router.get("/trash/items", response_model=list[NodeOut])
def list_trash(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Node).filter(Node.owner_id == user.id, Node.deleted_at.is_not(None)).order_by(Node.deleted_at.desc()).all()


@router.post("/{node_id}/restore", response_model=NodeOut)
def restore_node(node_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    node = owned_node(db, user, node_id, include_deleted=True)
    if node.deleted_at is None:
        raise HTTPException(status_code=409, detail="Item is not in trash")
    if node.parent_id and owned_node(db, user, node.parent_id, include_deleted=True).deleted_at is not None:
        node.parent_id = None
    if name_taken(db, user, node.parent_id, node.name, node.id):
        node.parent_id = None

    # Restore node and all its children that were deleted at the same time
    deleted_time = node.deleted_at
    for item in subtree(db, node, include_deleted=True):
        if item.deleted_at == deleted_time:
            item.deleted_at = None

    db.commit()
    db.refresh(node)
    return node
