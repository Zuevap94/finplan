import io
import os
from datetime import datetime

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker

from sqlalchemy.orm import Session

from app.models.report import Report, ReportType
from app.models.financial import FinancialProfile
from app.services.financial import compute_financial_summary, get_current_profile
from app.schemas.financial import FinancialSummary

REPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)

LABEL_MAP = {
    "salary": "Зарплата",
    "business": "Бизнес",
    "rental": "Аренда",
    "dividends": "Дивиденды",
    "interest": "Проценты",
    "pension": "Пенсия",
    "other": "Прочее",
    "housing": "Жильё",
    "food": "Питание",
    "transport": "Транспорт",
    "healthcare": "Здоровье",
    "education": "Образование",
    "entertainment": "Развлечения",
    "clothing": "Одежда",
    "insurance": "Страхование",
    "debt_payments": "Платежи по долгам",
    "savings": "Накопления",
    "deposit": "Депозиты",
    "stocks_ru": "Акции РФ",
    "bonds_ru": "Облигации РФ",
    "mutual_funds": "ПИФы",
    "stocks_foreign": "Иностр. акции",
    "bonds_foreign": "Иностр. облигации",
    "real_estate": "Недвижимость",
    "cash": "Наличные",
    "iis": "ИИС",
    "pension_fund": "НПФ",
    "crypto": "Криптовалюта",
    "business_asset": "Бизнес-активы",
}

COLORS_PALETTE = [
    "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
    "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1",
    "#14B8A6", "#E11D48",
]


def _fmt_rub(value: float) -> str:
    if abs(value) >= 1_000_000:
        return f"{value/1_000_000:,.1f} млн ₽".replace(",", " ")
    if abs(value) >= 1_000:
        return f"{value:,.0f} ₽".replace(",", " ")
    return f"{value:,.2f} ₽".replace(",", " ")


def _label(key: str) -> str:
    return LABEL_MAP.get(key, key.replace("_", " ").title())


def _create_pie_chart(data: dict[str, float], title: str) -> io.BytesIO:
    fig, ax = plt.subplots(figsize=(5, 4))
    labels = [_label(k) for k in data.keys()]
    values = list(data.values())
    colors = COLORS_PALETTE[:len(values)]

    wedges, texts, autotexts = ax.pie(
        values, labels=None, autopct="%1.1f%%",
        colors=colors, startangle=90, pctdistance=0.8,
    )
    for t in autotexts:
        t.set_fontsize(8)
    ax.legend(labels, loc="center left", bbox_to_anchor=(1, 0.5), fontsize=8)
    ax.set_title(title, fontsize=11, fontweight="bold", pad=15)
    plt.tight_layout()

    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=150, bbox_inches="tight")
    plt.close(fig)
    buf.seek(0)
    return buf


def _create_bar_chart(data: dict[str, float], title: str, color: str = "#3B82F6") -> io.BytesIO:
    fig, ax = plt.subplots(figsize=(6, 3.5))
    labels = [_label(k) for k in data.keys()]
    values = list(data.values())

    bars = ax.barh(labels, values, color=color, height=0.6)
    ax.set_title(title, fontsize=11, fontweight="bold")
    ax.xaxis.set_major_formatter(ticker.FuncFormatter(lambda x, _: _fmt_rub(x)))
    ax.tick_params(axis="both", labelsize=8)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    plt.tight_layout()

    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=150, bbox_inches="tight")
    plt.close(fig)
    buf.seek(0)
    return buf


def _create_goal_chart(goals: list[dict]) -> io.BytesIO:
    fig, ax = plt.subplots(figsize=(6, max(2, len(goals) * 0.8)))
    names = [g["name"] for g in goals]
    progress = [g["progress_pct"] for g in goals]
    colors = ["#10B981" if g["on_track"] else "#EF4444" for g in goals]

    y_pos = range(len(names))
    ax.barh(y_pos, progress, color=colors, height=0.5)
    ax.set_yticks(y_pos)
    ax.set_yticklabels(names, fontsize=9)
    ax.set_xlim(0, 100)
    ax.set_xlabel("Прогресс (%)")
    ax.set_title("Прогресс достижения целей", fontsize=11, fontweight="bold")
    ax.axvline(x=100, color="#CBD5E1", linestyle="--", linewidth=0.8)

    for i, v in enumerate(progress):
        ax.text(min(v + 2, 95), i, f"{v:.0f}%", va="center", fontsize=8)

    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    plt.tight_layout()

    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=150, bbox_inches="tight")
    plt.close(fig)
    buf.seek(0)
    return buf


def generate_pdf_report(
    summary: FinancialSummary,
    client_name: str,
    report_type: ReportType,
) -> str:
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"report_{report_type.value}_{timestamp}.pdf"
    filepath = os.path.join(REPORTS_DIR, filename)

    doc = SimpleDocTemplate(
        filepath, pagesize=A4,
        rightMargin=20*mm, leftMargin=20*mm,
        topMargin=15*mm, bottomMargin=15*mm,
    )

    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        "ReportTitle", parent=styles["Title"],
        fontSize=18, textColor=HexColor("#1E40AF"),
        spaceAfter=6*mm, alignment=TA_CENTER,
    ))
    styles.add(ParagraphStyle(
        "SectionTitle", parent=styles["Heading2"],
        fontSize=13, textColor=HexColor("#1E3A5F"),
        spaceBefore=8*mm, spaceAfter=4*mm,
    ))
    styles.add(ParagraphStyle(
        "BodyRu", parent=styles["Normal"],
        fontSize=10, leading=14,
    ))

    elements = []

    type_titles = {
        ReportType.NET_WORTH: "Обзор чистого капитала",
        ReportType.PORTFOLIO: "Структура портфеля",
        ReportType.INCOME_EXPENSE: "Анализ доходов и расходов",
        ReportType.GOAL_PROGRESS: "Прогресс достижения целей",
        ReportType.TAX_SUMMARY: "Налоговый обзор",
        ReportType.FULL_PLAN: "Полный финансовый план",
    }

    elements.append(Paragraph(type_titles.get(report_type, "Финансовый отчёт"), styles["ReportTitle"]))
    elements.append(Paragraph(f"Клиент: {client_name}", styles["BodyRu"]))
    elements.append(Paragraph(f"Дата: {datetime.now().strftime('%d.%m.%Y')}", styles["BodyRu"]))
    elements.append(Spacer(1, 6*mm))

    if report_type in (ReportType.NET_WORTH, ReportType.FULL_PLAN):
        elements.append(Paragraph("Обзор чистого капитала", styles["SectionTitle"]))
        nw_data = [
            ["Показатель", "Значение"],
            ["Общие активы", _fmt_rub(summary.total_assets)],
            ["Общие обязательства", _fmt_rub(summary.total_liabilities)],
            ["Чистый капитал (Net Worth)", _fmt_rub(summary.net_worth)],
        ]
        t = Table(nw_data, colWidths=[100*mm, 60*mm])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), HexColor("#1E40AF")),
            ("TEXTCOLOR", (0, 0), (-1, 0), HexColor("#FFFFFF")),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#CBD5E1")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [HexColor("#F8FAFC"), HexColor("#FFFFFF")]),
            ("ALIGN", (1, 0), (1, -1), "RIGHT"),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 4*mm))

    if report_type in (ReportType.PORTFOLIO, ReportType.FULL_PLAN):
        if summary.asset_allocation:
            elements.append(Paragraph("Структура портфеля", styles["SectionTitle"]))
            chart_buf = _create_pie_chart(summary.asset_allocation, "Распределение активов")
            elements.append(Image(chart_buf, width=150*mm, height=120*mm))
            elements.append(Spacer(1, 4*mm))

    if report_type in (ReportType.INCOME_EXPENSE, ReportType.FULL_PLAN):
        elements.append(Paragraph("Доходы и расходы", styles["SectionTitle"]))
        ie_data = [
            ["Показатель", "Значение"],
            ["Общий доход (до налогов)", _fmt_rub(summary.total_monthly_income)],
            ["НДФЛ (ежемесячный)", _fmt_rub(summary.tax_summary["monthly_ndfl"])],
            ["Чистый доход", _fmt_rub(summary.total_monthly_income_net)],
            ["Общие расходы", _fmt_rub(summary.total_monthly_expenses)],
            ["Ежемесячные накопления", _fmt_rub(summary.monthly_savings)],
            ["Норма накоплений", f"{summary.savings_rate}%"],
        ]
        t = Table(ie_data, colWidths=[100*mm, 60*mm])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), HexColor("#059669")),
            ("TEXTCOLOR", (0, 0), (-1, 0), HexColor("#FFFFFF")),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#CBD5E1")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [HexColor("#F0FDF4"), HexColor("#FFFFFF")]),
            ("ALIGN", (1, 0), (1, -1), "RIGHT"),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 4*mm))

        if summary.income_breakdown:
            chart_buf = _create_pie_chart(summary.income_breakdown, "Структура доходов")
            elements.append(Image(chart_buf, width=150*mm, height=120*mm))
        if summary.expense_breakdown:
            chart_buf = _create_bar_chart(summary.expense_breakdown, "Расходы по категориям", "#EF4444")
            elements.append(Image(chart_buf, width=150*mm, height=100*mm))

    if report_type in (ReportType.GOAL_PROGRESS, ReportType.FULL_PLAN):
        if summary.goal_progress:
            elements.append(Paragraph("Прогресс достижения целей", styles["SectionTitle"]))
            goal_data = [["Цель", "Текущая", "Целевая", "Прогресс", "Статус"]]
            for g in summary.goal_progress:
                status = "✓ В графике" if g["on_track"] else "⚠ Отставание"
                goal_data.append([
                    g["name"],
                    _fmt_rub(g["current_amount"]),
                    _fmt_rub(g["target_amount"]),
                    f'{g["progress_pct"]}%',
                    status,
                ])
            t = Table(goal_data, colWidths=[40*mm, 30*mm, 30*mm, 25*mm, 30*mm])
            t.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), HexColor("#7C3AED")),
                ("TEXTCOLOR", (0, 0), (-1, 0), HexColor("#FFFFFF")),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#CBD5E1")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [HexColor("#FAF5FF"), HexColor("#FFFFFF")]),
                ("ALIGN", (1, 0), (-1, -1), "CENTER"),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]))
            elements.append(t)
            elements.append(Spacer(1, 4*mm))
            chart_buf = _create_goal_chart(summary.goal_progress)
            elements.append(Image(chart_buf, width=150*mm, height=max(50, len(summary.goal_progress)*25)*mm))

    if report_type in (ReportType.TAX_SUMMARY, ReportType.FULL_PLAN):
        elements.append(Paragraph("Налоговый обзор", styles["SectionTitle"]))
        tax_data = [
            ["Налог", "Сумма (годовая)"],
            ["НДФЛ", _fmt_rub(summary.tax_summary["annual_ndfl"])],
            ["Налог на дивиденды", _fmt_rub(summary.tax_summary["annual_dividend_tax"])],
            ["Потенциальный налог на инвестиции", _fmt_rub(summary.tax_summary["potential_investment_tax"])],
            ["Итого налогов", _fmt_rub(summary.tax_summary["total_annual_tax"])],
        ]
        t = Table(tax_data, colWidths=[100*mm, 60*mm])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), HexColor("#DC2626")),
            ("TEXTCOLOR", (0, 0), (-1, 0), HexColor("#FFFFFF")),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#CBD5E1")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [HexColor("#FEF2F2"), HexColor("#FFFFFF")]),
            ("ALIGN", (1, 0), (1, -1), "RIGHT"),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        elements.append(t)

    elements.append(Spacer(1, 10*mm))
    elements.append(Paragraph(
        f"Отчёт сгенерирован: {datetime.now().strftime('%d.%m.%Y %H:%M')} | ФинПлан Pro",
        ParagraphStyle("Footer", parent=styles["Normal"], fontSize=8,
                       textColor=HexColor("#94A3B8"), alignment=TA_CENTER),
    ))

    doc.build(elements)
    return filepath


def create_report(
    db: Session,
    user_id: int,
    report_type: ReportType,
    created_by: int,
) -> Report:
    profile = get_current_profile(db, user_id)
    if not profile:
        raise ValueError("Финансовый профиль не найден")

    summary = compute_financial_summary(profile)

    from app.models.user import User
    client = db.query(User).filter(User.id == user_id).first()
    client_name = client.full_name if client else "Неизвестный"

    pdf_path = generate_pdf_report(summary, client_name, report_type)

    type_titles = {
        ReportType.NET_WORTH: "Обзор чистого капитала",
        ReportType.PORTFOLIO: "Структура портфеля",
        ReportType.INCOME_EXPENSE: "Анализ доходов и расходов",
        ReportType.GOAL_PROGRESS: "Прогресс достижения целей",
        ReportType.TAX_SUMMARY: "Налоговый обзор",
        ReportType.FULL_PLAN: "Полный финансовый план",
    }

    report = Report(
        user_id=user_id,
        type=report_type,
        title=type_titles.get(report_type, "Финансовый отчёт"),
        data=summary.model_dump(),
        pdf_path=pdf_path,
        created_by=created_by,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report
