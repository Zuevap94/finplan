from datetime import date
from typing import Any

from sqlalchemy.orm import Session

from app.config import settings
from app.models.financial import (
    FinancialProfile, Income, Expense, Asset, Liability, FinancialGoal,
    AssetType, IncomeType
)
from app.models.user import User
from app.schemas.financial import FinancialProfileCreate, FinancialSummary


def create_financial_profile(
    db: Session,
    user_id: int,
    data: FinancialProfileCreate,
    created_by: int,
) -> FinancialProfile:
    db.query(FinancialProfile).filter(
        FinancialProfile.user_id == user_id,
        FinancialProfile.is_current == True,
    ).update({"is_current": False})

    max_version = (
        db.query(FinancialProfile.version)
        .filter(FinancialProfile.user_id == user_id)
        .order_by(FinancialProfile.version.desc())
        .first()
    )
    version = (max_version[0] + 1) if max_version else 1

    profile = FinancialProfile(
        user_id=user_id,
        version=version,
        is_current=True,
        notes=data.notes,
        created_by=created_by,
    )
    db.add(profile)
    db.flush()

    for inc in data.incomes:
        db.add(Income(profile_id=profile.id, **inc.model_dump()))
    for exp in data.expenses:
        db.add(Expense(profile_id=profile.id, **exp.model_dump()))
    for asset in data.assets:
        db.add(Asset(profile_id=profile.id, **asset.model_dump()))
    for liab in data.liabilities:
        db.add(Liability(profile_id=profile.id, **liab.model_dump()))
    for goal in data.goals:
        db.add(FinancialGoal(profile_id=profile.id, **goal.model_dump()))

    db.commit()
    db.refresh(profile)
    return profile


def get_current_profile(db: Session, user_id: int) -> FinancialProfile | None:
    return (
        db.query(FinancialProfile)
        .filter(
            FinancialProfile.user_id == user_id,
            FinancialProfile.is_current == True,
        )
        .first()
    )


def get_profile_history(db: Session, user_id: int) -> list[FinancialProfile]:
    return (
        db.query(FinancialProfile)
        .filter(FinancialProfile.user_id == user_id)
        .order_by(FinancialProfile.version.desc())
        .all()
    )


def calculate_ndfl(annual_income: float) -> float:
    if annual_income <= settings.NDFL_HIGH_THRESHOLD:
        return annual_income * settings.NDFL_RATE
    base_tax = settings.NDFL_HIGH_THRESHOLD * settings.NDFL_RATE
    excess_tax = (annual_income - settings.NDFL_HIGH_THRESHOLD) * settings.NDFL_RATE_HIGH
    return base_tax + excess_tax


def calculate_investment_tax(purchase_value: float, current_value: float, holding_years: int) -> float:
    """Calculate capital gains tax with Russian 3-year exemption rule."""
    gain = current_value - purchase_value
    if gain <= 0:
        return 0
    if holding_years >= 3:
        exemption = holding_years * 3_000_000
        taxable_gain = max(0, gain - exemption)
    else:
        taxable_gain = gain
    return taxable_gain * settings.NDFL_RATE


def compute_financial_summary(profile: FinancialProfile) -> FinancialSummary:
    total_income_gross = sum(i.amount_monthly for i in profile.incomes)
    annual_income = total_income_gross * 12
    annual_ndfl = calculate_ndfl(annual_income)
    monthly_ndfl = annual_ndfl / 12
    total_income_net = total_income_gross - monthly_ndfl

    total_expenses = sum(e.amount_monthly for e in profile.expenses)
    monthly_savings = total_income_net - total_expenses
    savings_rate = (monthly_savings / total_income_net * 100) if total_income_net > 0 else 0

    total_assets = sum(a.current_value for a in profile.assets)
    total_liabilities = sum(l.remaining_amount for l in profile.liabilities)
    net_worth = total_assets - total_liabilities

    asset_allocation: dict[str, float] = {}
    for a in profile.assets:
        key = a.type.value
        asset_allocation[key] = asset_allocation.get(key, 0) + a.current_value

    income_breakdown: dict[str, float] = {}
    for i in profile.incomes:
        key = i.type.value
        income_breakdown[key] = income_breakdown.get(key, 0) + i.amount_monthly

    expense_breakdown: dict[str, float] = {}
    for e in profile.expenses:
        key = e.category.value
        expense_breakdown[key] = expense_breakdown.get(key, 0) + e.amount_monthly

    goal_progress: list[dict[str, Any]] = []
    for g in profile.goals:
        months_remaining = max(0, (g.target_date.year - date.today().year) * 12 +
                              (g.target_date.month - date.today().month))
        progress_pct = (g.current_amount / g.target_amount * 100) if g.target_amount > 0 else 0
        required_monthly = ((g.target_amount - g.current_amount) / months_remaining
                           if months_remaining > 0 else 0)
        goal_progress.append({
            "id": g.id,
            "name": g.name,
            "target_amount": g.target_amount,
            "current_amount": g.current_amount,
            "progress_pct": round(progress_pct, 1),
            "target_date": g.target_date.isoformat(),
            "months_remaining": months_remaining,
            "required_monthly": round(required_monthly, 2),
            "monthly_contribution": g.monthly_contribution or 0,
            "priority": g.priority.value,
            "on_track": (g.monthly_contribution or 0) >= required_monthly if months_remaining > 0 else progress_pct >= 100,
        })

    investment_tax = 0
    dividend_tax = 0
    for a in profile.assets:
        if a.purchase_value and a.purchase_date:
            years = max(0, (date.today() - a.purchase_date).days // 365)
            investment_tax += calculate_investment_tax(a.purchase_value, a.current_value, years)
    for i in profile.incomes:
        if i.type == IncomeType.DIVIDENDS:
            dividend_tax += i.amount_monthly * 12 * settings.DIVIDEND_TAX_RATE

    tax_summary = {
        "annual_ndfl": round(annual_ndfl, 2),
        "monthly_ndfl": round(monthly_ndfl, 2),
        "potential_investment_tax": round(investment_tax, 2),
        "annual_dividend_tax": round(dividend_tax, 2),
        "total_annual_tax": round(annual_ndfl + investment_tax + dividend_tax, 2),
    }

    return FinancialSummary(
        total_monthly_income=round(total_income_gross, 2),
        total_monthly_income_net=round(total_income_net, 2),
        total_monthly_expenses=round(total_expenses, 2),
        monthly_savings=round(monthly_savings, 2),
        savings_rate=round(savings_rate, 1),
        total_assets=round(total_assets, 2),
        total_liabilities=round(total_liabilities, 2),
        net_worth=round(net_worth, 2),
        asset_allocation=asset_allocation,
        income_breakdown=income_breakdown,
        expense_breakdown=expense_breakdown,
        goal_progress=goal_progress,
        tax_summary=tax_summary,
    )
