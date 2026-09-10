from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db import schemas, models
from db.connection import get_db
from auth.auth import create_access_token, get_current_user, hash_password, hash_token, new_refresh_token, refresh_expiry, verify_password

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.username == user.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already registered")

    hashed_pwd = hash_password(user.password)
    new_user = models.User(username=user.username, hashed_password=hashed_pwd)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def issue_tokens(user: models.User, db: Session) -> schemas.TokenPair:
    refresh_token = new_refresh_token()
    db.add(models.RefreshSession(user_id=user.id, token_hash=hash_token(refresh_token), expires_at=refresh_expiry()))
    db.commit()
    return schemas.TokenPair(access_token=create_access_token(user.id), refresh_token=refresh_token)


@router.post("/login", response_model=schemas.TokenPair)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return issue_tokens(db_user, db)


@router.post("/refresh", response_model=schemas.TokenPair)
def refresh(request: schemas.RefreshRequest, db: Session = Depends(get_db)):
    session = db.query(models.RefreshSession).filter(models.RefreshSession.token_hash == hash_token(request.refresh_token)).first()
    if not session or session.revoked_at or session.expires_at <= datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    session.revoked_at = datetime.now(timezone.utc)
    user = db.get(models.User, session.user_id)
    return issue_tokens(user, db)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(request: schemas.RefreshRequest, db: Session = Depends(get_db)):
    session = db.query(models.RefreshSession).filter(models.RefreshSession.token_hash == hash_token(request.refresh_token)).first()
    if session and not session.revoked_at:
        session.revoked_at = datetime.now(timezone.utc)
        db.commit()


@router.get("/me", response_model=schemas.UserOut)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user
