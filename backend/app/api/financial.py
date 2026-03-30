from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.financial import FinancialProfile
from app.schemas.financial import (
    FinancialProfileCreate, FinancialProfileResponse, FinancialSummary,
)
from app.services.auth import get_current_user, check_client_access
from app.services.financial import (
    create_financial_profile, get_current_profile,
    get_profile_history, compute_financial_summary,
)
from app.services.notifications import create_notification, create_audit_log
from app.models.notification import NotificationType

router = APIRouter(prefix="/api/financial", tags=["financial"])


@router.post("/profile/{user_id}", response_model=FinancialProfileResponse)
def create_profile(
    user_id: int,
    data: FinancialProfileCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    target_user_id = user_id
    if current_user.role == UserRole.CLIENT:
        if current_user.id != user_id:
            raise HTTPException(status_code=403, detail="Нет доступа")
        target_user_id = current_user.id
    else:
        check_client_access(current_user, user_id, db)

    profile = create_financial_profile(db, target_user_id, data, current_user.id)

    if current_user.role == UserRole.CONSULTANT:
        create_notification(
            db, target_user_id, NotificationType.PROFILE_UPDATED,
            "Профиль обновлён",
            f"Ваш консультант обновил финансовый профиль (версия {profile.version}).",
        )
    elif current_user.role == UserRole.CLIENT and current_user.consultant_id:
        create_notification(
            db, current_user.consultant_id, NotificationType.PROFILE_UPDATED,
            "Клиент обновил профиль",
            f"Клиент {current_user.full_name} обновил финансовый профиль (версия {profile.version}).",
        )

    create_audit_log(
        db, current_user.id, "create_profile",
        entity_type="financial_profile", entity_id=profile.id,
        ip_address=request.client.host if request.client else None,
    )

    return profile


@router.get("/profile/{user_id}", response_model=FinancialProfileResponse)
def get_profile(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role == UserRole.CLIENT and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Нет доступа")
    if current_user.role == UserRole.CONSULTANT:
        check_client_access(current_user, user_id, db)

    profile = get_current_profile(db, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Финансовый профиль не найден")
    return profile


@router.get("/profile/{user_id}/history", response_model=list[FinancialProfileResponse])
def get_history(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role == UserRole.CLIENT and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Нет доступа")
    if current_user.role == UserRole.CONSULTANT:
        check_client_access(current_user, user_id, db)

    return get_profile_history(db, user_id)


@router.get("/summary/{user_id}", response_model=FinancialSummary)
def get_summary(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role == UserRole.CLIENT and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Нет доступа")
    if current_user.role == UserRole.CONSULTANT:
        check_client_access(current_user, user_id, db)

    profile = get_current_profile(db, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Финансовый профиль не найден")

    return compute_financial_summary(profile)
