from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.financial import FinancialProfile
from app.models.report import Report
from app.schemas.user import UserCreate, UserResponse, UserUpdate, ClientListItem
from app.services.auth import (
    get_current_consultant, get_current_user, get_password_hash,
    check_client_access,
)
from app.services.notifications import create_notification, create_audit_log
from app.models.notification import NotificationType

router = APIRouter(prefix="/api/clients", tags=["clients"])


@router.get("/", response_model=list[ClientListItem])
def list_clients(
    current_user: User = Depends(get_current_consultant),
    db: Session = Depends(get_db),
):
    clients = db.query(User).filter(
        User.consultant_id == current_user.id,
        User.role == UserRole.CLIENT,
    ).all()

    result = []
    for c in clients:
        has_profile = db.query(FinancialProfile).filter(
            FinancialProfile.user_id == c.id,
            FinancialProfile.is_current == True,
        ).first() is not None

        last_report = db.query(Report).filter(
            Report.user_id == c.id,
        ).order_by(Report.created_at.desc()).first()

        result.append(ClientListItem(
            id=c.id,
            email=c.email,
            full_name=c.full_name,
            phone=c.phone,
            created_at=c.created_at,
            has_profile=has_profile,
            last_report_date=last_report.created_at if last_report else None,
        ))
    return result


@router.post("/", response_model=UserResponse)
def create_client(
    data: UserCreate,
    request: Request,
    current_user: User = Depends(get_current_consultant),
    db: Session = Depends(get_db),
):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email уже зарегистрирован")

    client = User(
        email=data.email,
        hashed_password=get_password_hash(data.password),
        full_name=data.full_name,
        phone=data.phone,
        role=UserRole.CLIENT,
        consultant_id=current_user.id,
    )
    db.add(client)
    db.commit()
    db.refresh(client)

    create_audit_log(
        db, current_user.id, "create_client",
        entity_type="user", entity_id=client.id,
        ip_address=request.client.host if request.client else None,
    )

    create_notification(
        db, client.id, NotificationType.SYSTEM,
        "Добро пожаловать!",
        f"Ваш консультант {current_user.full_name} создал для вас аккаунт.",
    )

    return client


@router.get("/{client_id}", response_model=UserResponse)
def get_client(
    client_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    client = check_client_access(current_user, client_id, db)
    return client


@router.put("/{client_id}", response_model=UserResponse)
def update_client(
    client_id: int,
    data: UserUpdate,
    current_user: User = Depends(get_current_consultant),
    db: Session = Depends(get_db),
):
    client = check_client_access(current_user, client_id, db)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(client, key, value)
    db.commit()
    db.refresh(client)
    return client
