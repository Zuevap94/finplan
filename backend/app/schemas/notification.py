from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.models.notification import NotificationType


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    type: NotificationType
    title: str
    message: str
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class NotificationCreate(BaseModel):
    user_id: int
    type: NotificationType
    title: str
    message: str
