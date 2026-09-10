import hashlib
import secrets
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from config import settings
from db.connection import get_db
from db.models import User

bearer_scheme = HTTPBearer(auto_error=False)
ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    sha256_hash = hashlib.sha256(password.encode()).hexdigest().encode("utf-8")
    hashed = bcrypt.hashpw(sha256_hash, bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    sha256_hash = hashlib.sha256(plain_password.encode()).hexdigest().encode("utf-8")
    return bcrypt.checkpw(sha256_hash, hashed_password.encode("utf-8"))


def create_access_token(user_id: int) -> str:
    expires = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    return jwt.encode({"sub": str(user_id), "type": "access", "exp": expires}, settings.secret_key, algorithm=ALGORITHM)


def new_refresh_token() -> str:
    return secrets.token_urlsafe(48)


def refresh_expiry() -> datetime:
    return datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
    access_token: str | None = None
) -> User:
    token = None
    if credentials:
        token = credentials.credentials
    elif access_token:
        token = access_token

    if token is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            raise ValueError("Wrong token type")
        user_id = int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user
