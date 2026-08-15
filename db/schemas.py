from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=80, pattern=r"^[A-Za-z0-9_.-]+$")
    password: str = Field(min_length=12, max_length=256)

class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    is_admin: bool
    quota_bytes: int

    model_config = {"from_attributes": True}


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class CreateFolderRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    parent_id: str | None = None


class UpdateNodeRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    parent_id: str | None = None


class NodeOut(BaseModel):
    id: str
    parent_id: str | None
    name: str
    kind: Literal["file", "folder"]
    size: int | None
    mime_type: str | None
    checksum: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
