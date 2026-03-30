import os
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.report import Report, ReportType
from app.schemas.report import ReportCreate, ReportResponse
from app.services.auth import get_current_user, check_client_access
from app.services.reports import create_report
from app.services.notifications import create_notification, create_audit_log
from app.models.notification import NotificationType

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.post("/generate", response_model=ReportResponse)
def generate_report(
    data: ReportCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role == UserRole.CLIENT and current_user.id != data.user_id:
        raise HTTPException(status_code=403, detail="Нет доступа")
    if current_user.role == UserRole.CONSULTANT:
        check_client_access(current_user, data.user_id, db)

    try:
        report = create_report(db, data.user_id, data.type, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    create_notification(
        db, data.user_id, NotificationType.REPORT_GENERATED,
        "Новый отчёт",
        f"Сгенерирован отчёт: {report.title}",
    )

    create_audit_log(
        db, current_user.id, "generate_report",
        entity_type="report", entity_id=report.id,
        ip_address=request.client.host if request.client else None,
    )

    return report


@router.get("/user/{user_id}", response_model=list[ReportResponse])
def list_reports(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role == UserRole.CLIENT and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Нет доступа")
    if current_user.role == UserRole.CONSULTANT:
        check_client_access(current_user, user_id, db)

    return (
        db.query(Report)
        .filter(Report.user_id == user_id)
        .order_by(Report.created_at.desc())
        .all()
    )


@router.get("/{report_id}", response_model=ReportResponse)
def get_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Отчёт не найден")

    if current_user.role == UserRole.CLIENT and current_user.id != report.user_id:
        raise HTTPException(status_code=403, detail="Нет доступа")
    if current_user.role == UserRole.CONSULTANT:
        check_client_access(current_user, report.user_id, db)

    return report


@router.get("/{report_id}/pdf")
def download_pdf(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Отчёт не найден")

    if current_user.role == UserRole.CLIENT and current_user.id != report.user_id:
        raise HTTPException(status_code=403, detail="Нет доступа")
    if current_user.role == UserRole.CONSULTANT:
        check_client_access(current_user, report.user_id, db)

    if not report.pdf_path or not os.path.exists(report.pdf_path):
        raise HTTPException(status_code=404, detail="PDF файл не найден")

    return FileResponse(
        report.pdf_path,
        media_type="application/pdf",
        filename=f"{report.title}.pdf",
    )
