from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

from app.models.report import ReportType


class ReportCreate(BaseModel):
    type: ReportType
    user_id: int


class ReportResponse(BaseModel):
    id: int
    user_id: int
    type: ReportType
    title: str
    data: Optional[dict[str, Any]] = None
    pdf_path: Optional[str] = None
    created_at: datetime
    created_by: Optional[int] = None

    model_config = {"from_attributes": True}
