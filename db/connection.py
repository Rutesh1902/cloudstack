from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from typing import Annotated
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from fastapi import Depends
load_dotenv()


DATABASE_URL =  os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session, Depends(get_db)]