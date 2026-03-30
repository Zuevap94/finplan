from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserResponse, UserLogin, Token
from app.services.auth import (
    get_password_hash, verify_password, create_access_token,
    get_current_user,
)
from app.services.notifications import create_audit_log

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=Token)
def register(data: UserCreate, request: Request, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email уже зарегистрирован")

    if data.consultant_id:
        consultant = db.query(User).filter(
            User.id == data.consultant_id,
            User.role == UserRole.CONSULTANT,
        ).first()
        if not consultant:
            raise HTTPException(status_code=400, detail="Консультант не найден")

    user = User(
        email=data.email,
        hashed_password=get_password_hash(data.password),
        full_name=data.full_name,
        phone=data.phone,
        role=data.role,
        consultant_id=data.consultant_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    create_audit_log(
        db, user.id, "register",
        entity_type="user", entity_id=user.id,
        ip_address=request.client.host if request.client else None,
    )

    token = create_access_token({"sub": user.id, "role": user.role.value})
    return Token(access_token=token, token_type="bearer", user=UserResponse.model_validate(user))


@router.post("/login", response_model=Token)
def login(data: UserLogin, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Неверный email или пароль")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Аккаунт деактивирован")

    create_audit_log(
        db, user.id, "login",
        ip_address=request.client.host if request.client else None,
    )

    token = create_access_token({"sub": user.id, "role": user.role.value})
    return Token(access_token=token, token_type="bearer", user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
