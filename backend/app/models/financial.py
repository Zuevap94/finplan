import enum
from datetime import datetime, date
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Date, Enum, Boolean,
    ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship

from app.database import Base


class IncomeType(str, enum.Enum):
    SALARY = "salary"
    BUSINESS = "business"
    RENTAL = "rental"
    DIVIDENDS = "dividends"
    INTEREST = "interest"
    PENSION = "pension"
    OTHER = "other"


class ExpenseCategory(str, enum.Enum):
    HOUSING = "housing"
    FOOD = "food"
    TRANSPORT = "transport"
    HEALTHCARE = "healthcare"
    EDUCATION = "education"
    ENTERTAINMENT = "entertainment"
    CLOTHING = "clothing"
    INSURANCE = "insurance"
    DEBT_PAYMENTS = "debt_payments"
    SAVINGS = "savings"
    OTHER = "other"


class AssetType(str, enum.Enum):
    DEPOSIT = "deposit"
    STOCKS_RU = "stocks_ru"
    BONDS_RU = "bonds_ru"
    MUTUAL_FUNDS = "mutual_funds"  # ПИФы/УИФы
    STOCKS_FOREIGN = "stocks_foreign"
    BONDS_FOREIGN = "bonds_foreign"
    REAL_ESTATE = "real_estate"
    CASH = "cash"
    IIS = "iis"  # ИИС
    PENSION_FUND = "pension_fund"
    CRYPTO = "crypto"
    BUSINESS_ASSET = "business_asset"
    OTHER = "other"


class LiabilityType(str, enum.Enum):
    MORTGAGE = "mortgage"
    CAR_LOAN = "car_loan"
    CONSUMER_LOAN = "consumer_loan"
    CREDIT_CARD = "credit_card"
    BUSINESS_LOAN = "business_loan"
    OTHER = "other"


class GoalPriority(str, enum.Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class FinancialProfile(Base):
    __tablename__ = "financial_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    version = Column(Integer, default=1)
    is_current = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    user = relationship("User", back_populates="financial_profiles", foreign_keys=[user_id])
    incomes = relationship("Income", back_populates="profile", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="profile", cascade="all, delete-orphan")
    assets = relationship("Asset", back_populates="profile", cascade="all, delete-orphan")
    liabilities = relationship("Liability", back_populates="profile", cascade="all, delete-orphan")
    goals = relationship("FinancialGoal", back_populates="profile", cascade="all, delete-orphan")


class Income(Base):
    __tablename__ = "incomes"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("financial_profiles.id"), nullable=False)
    type = Column(Enum(IncomeType), nullable=False)
    name = Column(String(255), nullable=False)
    amount_monthly = Column(Float, nullable=False)
    is_gross = Column(Boolean, default=True)
    is_regular = Column(Boolean, default=True)

    profile = relationship("FinancialProfile", back_populates="incomes")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("financial_profiles.id"), nullable=False)
    category = Column(Enum(ExpenseCategory), nullable=False)
    name = Column(String(255), nullable=False)
    amount_monthly = Column(Float, nullable=False)
    is_fixed = Column(Boolean, default=True)

    profile = relationship("FinancialProfile", back_populates="expenses")


class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("financial_profiles.id"), nullable=False)
    type = Column(Enum(AssetType), nullable=False)
    name = Column(String(255), nullable=False)
    current_value = Column(Float, nullable=False)
    purchase_value = Column(Float, nullable=True)
    purchase_date = Column(Date, nullable=True)
    annual_return_rate = Column(Float, nullable=True)
    currency = Column(String(3), default="RUB")
    details = Column(JSON, nullable=True)

    profile = relationship("FinancialProfile", back_populates="assets")


class Liability(Base):
    __tablename__ = "liabilities"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("financial_profiles.id"), nullable=False)
    type = Column(Enum(LiabilityType), nullable=False)
    name = Column(String(255), nullable=False)
    total_amount = Column(Float, nullable=False)
    remaining_amount = Column(Float, nullable=False)
    interest_rate = Column(Float, nullable=False)
    monthly_payment = Column(Float, nullable=False)
    end_date = Column(Date, nullable=True)

    profile = relationship("FinancialProfile", back_populates="liabilities")


class FinancialGoal(Base):
    __tablename__ = "financial_goals"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("financial_profiles.id"), nullable=False)
    name = Column(String(255), nullable=False)
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0)
    target_date = Column(Date, nullable=False)
    priority = Column(Enum(GoalPriority), default=GoalPriority.MEDIUM)
    monthly_contribution = Column(Float, nullable=True)
    description = Column(Text, nullable=True)

    profile = relationship("FinancialProfile", back_populates="goals")
