import hashlib
import os
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile

from config import settings


class LocalStorage:
    def __init__(self, root: Path) -> None:
        self.root = root.resolve()
        self.root.mkdir(parents=True, exist_ok=True)

    async def save_upload(self, upload: UploadFile) -> tuple[str, int, str]:
        storage_key = str(uuid4())
        temporary_path = self.root / f".{storage_key}.uploading"
        final_path = self.root / storage_key
        total, digest = 0, hashlib.sha256()
        try:
            with temporary_path.open("wb") as destination:
                while chunk := await upload.read(1024 * 1024):
                    total += len(chunk)
                    if total > settings.max_upload_bytes:
                        raise HTTPException(status_code=413, detail="File exceeds the configured upload limit")
                    digest.update(chunk)
                    destination.write(chunk)
            os.replace(temporary_path, final_path)
            return storage_key, total, digest.hexdigest()
        except Exception:
            temporary_path.unlink(missing_ok=True)
            raise
        finally:
            await upload.close()

    def path_for(self, storage_key: str) -> Path:
        path = (self.root / storage_key).resolve()
        if path.parent != self.root or not path.is_file():
            raise HTTPException(status_code=404, detail="Stored file not found")
        return path

    def delete(self, storage_key: str | None) -> None:
        if storage_key:
            (self.root / storage_key).unlink(missing_ok=True)


storage = LocalStorage(settings.storage_root)
