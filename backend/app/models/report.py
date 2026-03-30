import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship

from app.database import Base


class ReportType(str, enum.Enum):
    NET_WORTH = "net_worth"
    PORTFOLIO = "portfolio"
    INCOME_EXPENSE = "income_expense"
    GOAL_PROGRESS = "goal_progress"
    TAX_SUMMARY = "tax_summary"
    FULL_PLAN = "full_plan"


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(Enum(ReportType), nullable=False)
    title = Column(String(255), nullable=False)
    data = Column(JSON, nullable=True)
    pdf_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    user = relationship("User", back_populates="reports", foreign_keys=[user_id])
