import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()


class Settings:
    database_url = os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres:postgres@db:5432/cloudstack")
    secret_key = os.getenv("SECRET_KEY", "change-me-before-production")
    access_token_expire_minutes = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
    refresh_token_expire_days = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "30"))
    storage_root = Path(os.getenv("STORAGE_ROOT", "./storage"))
    max_upload_bytes = int(os.getenv("MAX_UPLOAD_BYTES", str(5 * 1024**3)))
    cors_origins = [item.strip() for item in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",") if item.strip()]


settings = Settings()
