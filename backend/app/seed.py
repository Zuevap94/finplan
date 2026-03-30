"""Seed script to populate database with demo data."""
from datetime import date, datetime
from app.database import SessionLocal, engine, Base
from app.models import (
    User, UserRole,
    FinancialProfile, Income, Expense, Asset, Liability, FinancialGoal,
    IncomeType, ExpenseCategory, AssetType, LiabilityType, GoalPriority,
)
from app.services.auth import get_password_hash

Base.metadata.create_all(bind=engine)


def seed():
    db = SessionLocal()

    existing = db.query(User).first()
    if existing:
        print("Database already seeded. Skipping.")
        db.close()
        return

    consultant = User(
        email="consultant@finplan.ru",
        hashed_password=get_password_hash("password123"),
        full_name="Иванов Алексей Петрович",
        phone="+7 (999) 123-45-67",
        role=UserRole.CONSULTANT,
    )
    db.add(consultant)
    db.flush()

    client1 = User(
        email="client1@example.ru",
        hashed_password=get_password_hash("password123"),
        full_name="Петрова Мария Сергеевна",
        phone="+7 (916) 555-12-34",
        role=UserRole.CLIENT,
        consultant_id=consultant.id,
    )
    client2 = User(
        email="client2@example.ru",
        hashed_password=get_password_hash("password123"),
        full_name="Сидоров Дмитрий Андреевич",
        phone="+7 (903) 777-88-99",
        role=UserRole.CLIENT,
        consultant_id=consultant.id,
    )
    db.add_all([client1, client2])
    db.flush()

    profile1 = FinancialProfile(
        user_id=client1.id, version=1, is_current=True,
        notes="Начальный профиль", created_by=consultant.id,
    )
    db.add(profile1)
    db.flush()

    db.add_all([
        Income(profile_id=profile1.id, type=IncomeType.SALARY,
               name="Зарплата в IT-компании", amount_monthly=250000, is_gross=True),
        Income(profile_id=profile1.id, type=IncomeType.RENTAL,
               name="Сдача квартиры", amount_monthly=45000, is_gross=True),
        Income(profile_id=profile1.id, type=IncomeType.DIVIDENDS,
               name="Дивиденды", amount_monthly=15000, is_gross=True),
    ])

    db.add_all([
        Expense(profile_id=profile1.id, category=ExpenseCategory.HOUSING,
                name="Ипотека", amount_monthly=65000),
        Expense(profile_id=profile1.id, category=ExpenseCategory.FOOD,
                name="Продукты и рестораны", amount_monthly=40000),
        Expense(profile_id=profile1.id, category=ExpenseCategory.TRANSPORT,
                name="Авто и транспорт", amount_monthly=25000),
        Expense(profile_id=profile1.id, category=ExpenseCategory.HEALTHCARE,
                name="Медицина и ДМС", amount_monthly=10000),
        Expense(profile_id=profile1.id, category=ExpenseCategory.ENTERTAINMENT,
                name="Развлечения", amount_monthly=20000),
        Expense(profile_id=profile1.id, category=ExpenseCategory.EDUCATION,
                name="Обучение", amount_monthly=15000),
        Expense(profile_id=profile1.id, category=ExpenseCategory.CLOTHING,
                name="Одежда", amount_monthly=12000),
        Expense(profile_id=profile1.id, category=ExpenseCategory.INSURANCE,
                name="Страхование", amount_monthly=8000),
    ])

    db.add_all([
        Asset(profile_id=profile1.id, type=AssetType.DEPOSIT,
              name="Вклад Сбербанк", current_value=1500000,
              annual_return_rate=16.0, currency="RUB"),
        Asset(profile_id=profile1.id, type=AssetType.STOCKS_RU,
              name="Портфель акций МосБиржа", current_value=2800000,
              purchase_value=2200000, purchase_date=date(2023, 3, 15),
              annual_return_rate=18.0, currency="RUB"),
        Asset(profile_id=profile1.id, type=AssetType.BONDS_RU,
              name="ОФЗ", current_value=1200000,
              purchase_value=1150000, purchase_date=date(2024, 1, 10),
              annual_return_rate=12.5, currency="RUB"),
        Asset(profile_id=profile1.id, type=AssetType.IIS,
              name="ИИС Тинькофф", current_value=900000,
              purchase_value=800000, purchase_date=date(2023, 6, 1),
              annual_return_rate=15.0, currency="RUB"),
        Asset(profile_id=profile1.id, type=AssetType.REAL_ESTATE,
              name="Квартира (инвестиционная)", current_value=8500000,
              purchase_value=6000000, purchase_date=date(2020, 9, 1),
              currency="RUB"),
        Asset(profile_id=profile1.id, type=AssetType.MUTUAL_FUNDS,
              name="ПИФ Альфа-Капитал", current_value=600000,
              purchase_value=500000, purchase_date=date(2024, 3, 1),
              annual_return_rate=14.0, currency="RUB"),
        Asset(profile_id=profile1.id, type=AssetType.CASH,
              name="Наличные", current_value=300000, currency="RUB"),
    ])

    db.add_all([
        Liability(profile_id=profile1.id, type=LiabilityType.MORTGAGE,
                  name="Ипотека ВТБ", total_amount=5000000,
                  remaining_amount=3200000, interest_rate=7.9,
                  monthly_payment=65000, end_date=date(2032, 6, 1)),
    ])

    db.add_all([
        FinancialGoal(profile_id=profile1.id, name="Финансовая подушка",
                      target_amount=1500000, current_amount=800000,
                      target_date=date(2026, 12, 31), priority=GoalPriority.HIGH,
                      monthly_contribution=50000),
        FinancialGoal(profile_id=profile1.id, name="Образование ребёнка",
                      target_amount=3000000, current_amount=400000,
                      target_date=date(2030, 9, 1), priority=GoalPriority.MEDIUM,
                      monthly_contribution=30000),
        FinancialGoal(profile_id=profile1.id, name="Ранний выход на пенсию",
                      target_amount=30000000, current_amount=5800000,
                      target_date=date(2040, 1, 1), priority=GoalPriority.MEDIUM,
                      monthly_contribution=80000),
    ])

    profile2 = FinancialProfile(
        user_id=client2.id, version=1, is_current=True,
        notes="Начальный профиль", created_by=consultant.id,
    )
    db.add(profile2)
    db.flush()

    db.add_all([
        Income(profile_id=profile2.id, type=IncomeType.SALARY,
               name="Зарплата", amount_monthly=150000, is_gross=True),
        Income(profile_id=profile2.id, type=IncomeType.BUSINESS,
               name="Фриланс", amount_monthly=80000, is_gross=True),
    ])

    db.add_all([
        Expense(profile_id=profile2.id, category=ExpenseCategory.HOUSING,
                name="Аренда квартиры", amount_monthly=50000),
        Expense(profile_id=profile2.id, category=ExpenseCategory.FOOD,
                name="Питание", amount_monthly=30000),
        Expense(profile_id=profile2.id, category=ExpenseCategory.TRANSPORT,
                name="Транспорт", amount_monthly=15000),
        Expense(profile_id=profile2.id, category=ExpenseCategory.ENTERTAINMENT,
                name="Хобби", amount_monthly=10000),
    ])

    db.add_all([
        Asset(profile_id=profile2.id, type=AssetType.DEPOSIT,
              name="Накопительный счёт", current_value=500000,
              annual_return_rate=14.0, currency="RUB"),
        Asset(profile_id=profile2.id, type=AssetType.STOCKS_RU,
              name="Акции", current_value=800000,
              purchase_value=650000, purchase_date=date(2024, 1, 1),
              annual_return_rate=20.0, currency="RUB"),
    ])

    db.add_all([
        FinancialGoal(profile_id=profile2.id, name="Первоначальный взнос на квартиру",
                      target_amount=4000000, current_amount=1200000,
                      target_date=date(2028, 6, 1), priority=GoalPriority.HIGH,
                      monthly_contribution=70000),
    ])

    db.commit()
    db.close()
    print("Database seeded successfully!")


if __name__ == "__main__":
    seed()
