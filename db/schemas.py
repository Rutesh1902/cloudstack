from pydantic import BaseModel
#FILE SCHEMAS
class FileInfo(BaseModel):
    name: str
    size: int
    modified: str

#ACCOUT SCHEMAS
class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str

    class Config:
        orm_mode = True
