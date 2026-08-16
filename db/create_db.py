import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine

# Allow both `python db/create_db.py` and `python -m db.create_db`.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from db.models import Base

load_dotenv()
DATABASE_URL =  os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)


Base.metadata.create_all(bind=engine)
