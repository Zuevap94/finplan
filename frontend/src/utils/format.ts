export function formatRub(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ru-RU').format(value);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const LABEL_MAP: Record<string, string> = {
  salary: 'Зарплата',
  business: 'Бизнес',
  rental: 'Аренда',
  dividends: 'Дивиденды',
  interest: 'Проценты',
  pension: 'Пенсия',
  other: 'Прочее',
  housing: 'Жильё',
  food: 'Питание',
  transport: 'Транспорт',
  healthcare: 'Здоровье',
  education: 'Образование',
  entertainment: 'Развлечения',
  clothing: 'Одежда',
  insurance: 'Страхование',
  debt_payments: 'Платежи по долгам',
  savings: 'Накопления',
  deposit: 'Депозиты',
  stocks_ru: 'Акции РФ',
  bonds_ru: 'Облигации РФ',
  mutual_funds: 'ПИФы',
  stocks_foreign: 'Иностр. акции',
  bonds_foreign: 'Иностр. облигации',
  real_estate: 'Недвижимость',
  cash: 'Наличные',
  iis: 'ИИС',
  pension_fund: 'НПФ',
  crypto: 'Криптовалюта',
  business_asset: 'Бизнес-активы',
  mortgage: 'Ипотека',
  car_loan: 'Автокредит',
  consumer_loan: 'Потребительский',
  credit_card: 'Кредитная карта',
  business_loan: 'Бизнес-кредит',
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий',
  net_worth: 'Чистый капитал',
  portfolio: 'Портфель',
  income_expense: 'Доходы/Расходы',
  goal_progress: 'Цели',
  tax_summary: 'Налоги',
  full_plan: 'Полный план',
};

export function label(key: string): string {
  return LABEL_MAP[key] || key.replace(/_/g, ' ');
}
