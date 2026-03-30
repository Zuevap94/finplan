from pydantic import BaseModel
from typing import Optional, Any
from datetime import date, datetime

from app.models.financial import (
    IncomeType, ExpenseCategory, AssetType,
    LiabilityType, GoalPriority
)


class IncomeCreate(BaseModel):
    type: IncomeType
    name: str
    amount_monthly: float
    is_gross: bool = True
    is_regular: bool = True


class IncomeResponse(IncomeCreate):
    id: int
    profile_id: int

    model_config = {"from_attributes": True}


class ExpenseCreate(BaseModel):
    category: ExpenseCategory
    name: str
    amount_monthly: float
    is_fixed: bool = True


class ExpenseResponse(ExpenseCreate):
    id: int
    profile_id: int

    model_config = {"from_attributes": True}


class AssetCreate(BaseModel):
    type: AssetType
    name: str
    current_value: float
    purchase_value: Optional[float] = None
    purchase_date: Optional[date] = None
    annual_return_rate: Optional[float] = None
    currency: str = "RUB"
    details: Optional[dict[str, Any]] = None


class AssetResponse(AssetCreate):
    id: int
    profile_id: int

    model_config = {"from_attributes": True}


class LiabilityCreate(BaseModel):
    type: LiabilityType
    name: str
    total_amount: float
    remaining_amount: float
    interest_rate: float
    monthly_payment: float
    end_date: Optional[date] = None


class LiabilityResponse(LiabilityCreate):
    id: int
    profile_id: int

    model_config = {"from_attributes": True}


class GoalCreate(BaseModel):
    name: str
    target_amount: float
    current_amount: float = 0
    target_date: date
    priority: GoalPriority = GoalPriority.MEDIUM
    monthly_contribution: Optional[float] = None
    description: Optional[str] = None


class GoalResponse(GoalCreate):
    id: int
    profile_id: int

    model_config = {"from_attributes": True}


class FinancialProfileCreate(BaseModel):
    notes: Optional[str] = None
    incomes: list[IncomeCreate] = []
    expenses: list[ExpenseCreate] = []
    assets: list[AssetCreate] = []
    liabilities: list[LiabilityCreate] = []
    goals: list[GoalCreate] = []


class FinancialProfileResponse(BaseModel):
    id: int
    user_id: int
    version: int
    is_current: bool
    notes: Optional[str] = None
    created_at: datetime
    created_by: Optional[int] = None
    incomes: list[IncomeResponse] = []
    expenses: list[ExpenseResponse] = []
    assets: list[AssetResponse] = []
    liabilities: list[LiabilityResponse] = []
    goals: list[GoalResponse] = []

    model_config = {"from_attributes": True}


class FinancialSummary(BaseModel):
    total_monthly_income: float
    total_monthly_income_net: float
    total_monthly_expenses: float
    monthly_savings: float
    savings_rate: float
    total_assets: float
    total_liabilities: float
    net_worth: float
    asset_allocation: dict[str, float]
    income_breakdown: dict[str, float]
    expense_breakdown: dict[str, float]
    goal_progress: list[dict[str, Any]]
    tax_summary: dict[str, float]
