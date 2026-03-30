from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

from app.models.user import UserRole


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: UserRole


class UserCreate(UserBase):
    password: str
    consultant_id: Optional[int] = None


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None


class UserResponse(UserBase):
    id: int
    is_active: bool
    consultant_id: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class ClientListItem(BaseModel):
    id: int
    email: str
    full_name: str
    phone: Optional[str] = None
    created_at: datetime
    has_profile: bool = False
    last_report_date: Optional[datetime] = None

    model_config = {"from_attributes": True}
