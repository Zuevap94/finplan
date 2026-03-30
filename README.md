# ФинПлан Pro — Платформа личного финансового планирования

Профессиональная платформа для финансовых консультантов и их клиентов, адаптированная под российский рынок.

## Архитектура

```
┌────────────────────┐     ┌─────────────────────┐     ┌──────────────┐
│   React Frontend   │────▶│   FastAPI Backend    │────▶│  SQLite/PG   │
│  (Vite + Tailwind) │     │   (Python 3.12+)    │     │   Database   │
│  Chart.js графики  │     │  JWT Auth, Reports   │     │              │
└────────────────────┘     └─────────────────────┘     └──────────────┘
        :3000                      :8000
```

### Стек технологий

| Компонент | Технология |
|-----------|-----------|
| **Frontend** | React 18 + TypeScript, Vite, Tailwind CSS v4, React Router v6, Chart.js + react-chartjs-2, Axios, Lucide Icons |
| **Backend** | Python 3.12, FastAPI, SQLAlchemy 2.0, Pydantic v2, python-jose (JWT), passlib (bcrypt), ReportLab + Matplotlib (PDF) |
| **Database** | SQLite (разработка) / PostgreSQL 16 (продакшн) |
| **Deploy** | Docker, Docker Compose, Nginx |

## Функциональность

### Для консультанта
- Панель управления с обзором клиентов
- Создание и управление профилями клиентов
- Ввод финансовых данных через структурированные формы
- Генерация отчётов с графиками (PDF экспорт)
- Уведомления об активности клиентов

### Для клиента
- Персональный дашборд с визуализацией
- Просмотр структуры портфеля (Doughnut/Bar charts)
- Отслеживание прогресса достижения целей
- Налоговый калькулятор НДФЛ
- Доступ к отчётам и PDF

### Финансовые расчёты (Россия)
- **НДФЛ**: 13% (до 5 млн ₽/год), 15% (свыше)
- **Налог на дивиденды**: 13%
- **Льгота долгосрочного владения**: вычет 3 млн ₽ × кол-во лет
- Поддержка: акции РФ, облигации, ПИФы, ИИС, депозиты, НПФ, недвижимость, крипто

## Схема базы данных

```
users (id, email, hashed_password, full_name, phone, role, consultant_id, ...)
  ├── financial_profiles (id, user_id, version, is_current, notes, created_by, ...)
  │     ├── incomes (id, profile_id, type, name, amount_monthly, is_gross, ...)
  │     ├── expenses (id, profile_id, category, name, amount_monthly, ...)
  │     ├── assets (id, profile_id, type, name, current_value, purchase_value, ...)
  │     ├── liabilities (id, profile_id, type, name, remaining_amount, ...)
  │     └── financial_goals (id, profile_id, name, target_amount, current_amount, ...)
  ├── reports (id, user_id, type, title, data, pdf_path, created_by, ...)
  ├── notifications (id, user_id, type, title, message, is_read, ...)
  └── audit_logs (id, user_id, action, entity_type, entity_id, details, ...)
```

## API Endpoints

### Аутентификация
| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/auth/register` | Регистрация |
| POST | `/api/auth/login` | Вход (получение JWT) |
| GET | `/api/auth/me` | Текущий пользователь |

### Клиенты (только консультант)
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/clients/` | Список клиентов |
| POST | `/api/clients/` | Создать клиента |
| GET | `/api/clients/{id}` | Профиль клиента |
| PUT | `/api/clients/{id}` | Обновить клиента |

### Финансовые данные
| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/financial/profile/{user_id}` | Создать/обновить профиль |
| GET | `/api/financial/profile/{user_id}` | Текущий профиль |
| GET | `/api/financial/profile/{user_id}/history` | История версий |
| GET | `/api/financial/summary/{user_id}` | Финансовая сводка |

### Отчёты
| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/reports/generate` | Сгенерировать отчёт |
| GET | `/api/reports/user/{user_id}` | Список отчётов |
| GET | `/api/reports/{id}` | Детали отчёта |
| GET | `/api/reports/{id}/pdf` | Скачать PDF |

### Уведомления
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/notifications/` | Список уведомлений |
| POST | `/api/notifications/{id}/read` | Прочитать |
| POST | `/api/notifications/read-all` | Прочитать все |

## Быстрый старт (локально)

### Требования
- Python 3.12+
- Node.js 20+
- npm 9+

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

pip install -r requirements.txt

cp .env.example .env
# Отредактируйте .env при необходимости

# Заполнить БД демо-данными
python -m app.seed

# Запустить сервер
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Откройте http://localhost:3000

### Демо-аккаунты
| Роль | Email | Пароль |
|------|-------|--------|
| Консультант | consultant@finplan.ru | password123 |
| Клиент 1 | client1@example.ru | password123 |
| Клиент 2 | client2@example.ru | password123 |

## Развёртывание через Docker

### Базовое (SQLite)

```bash
docker-compose up --build -d
```

Приложение доступно на http://localhost

### Production (PostgreSQL)

```bash
# Задайте переменные
export SECRET_KEY=$(openssl rand -hex 32)
export DB_PASSWORD=$(openssl rand -hex 16)

docker-compose -f docker-compose.prod.yml up --build -d
```

## Развёртывание на VPS (DigitalOcean / Timeweb / Selectel)

1. Установите Docker и Docker Compose на сервере
2. Склонируйте репозиторий: `git clone <repo-url> && cd finplan`
3. Настройте `.env` с реальными значениями
4. Запустите: `docker-compose -f docker-compose.prod.yml up --build -d`
5. Настройте Nginx / Caddy как reverse proxy с SSL (Let's Encrypt)

## Типы отчётов и визуализаций

| Тип отчёта | Содержание |
|-----------|-----------|
| **Полный план** | Все разделы: капитал, портфель, доходы/расходы, цели, налоги |
| **Чистый капитал** | Таблица активов, обязательств, net worth |
| **Структура портфеля** | Pie chart распределения активов по типам |
| **Доходы/Расходы** | Таблица, pie chart доходов, bar chart расходов |
| **Прогресс целей** | Таблица целей с прогрессом, bar chart |
| **Налоговый обзор** | НДФЛ, дивиденды, инвестиционные налоги |

### Графики (интерактивные в UI)
- **Doughnut Chart** — структура портфеля, распределение доходов
- **Horizontal Bar Chart** — расходы по категориям
- **Progress Bars** — прогресс достижения целей

## Безопасность и Compliance

### Реализовано
- Аутентификация через JWT токены
- Хеширование паролей (bcrypt)
- Ролевое разграничение доступа (консультант / клиент)
- CORS защита
- Аудит-логирование действий
- Версионирование финансовых данных

### Рекомендации для Production
- [ ] Использовать HTTPS (Let's Encrypt / Caddy)
- [ ] Сменить `SECRET_KEY` на случайное значение: `openssl rand -hex 32`
- [ ] Перейти на PostgreSQL с шифрованием at-rest
- [ ] Настроить бэкапы БД (pg_dump + cron)
- [ ] Включить rate limiting (nginx / FastAPI middleware)
- [ ] Добавить Content Security Policy заголовки
- [ ] Настроить логирование в файл / систему мониторинга
- [ ] Реализовать двухфакторную аутентификацию (TOTP)
- [ ] Проводить регулярный аудит безопасности
- [ ] Соответствие ФЗ-149 и ФЗ-152 (персональные данные)

### Чеклист соответствия российским регуляциям
- [x] Хранение данных на территории РФ (настраиваемый хостинг)
- [x] Шифрование паролей
- [ ] Согласие на обработку персональных данных (форма)
- [ ] Политика конфиденциальности
- [ ] Журнал доступа к персональным данным
- [ ] Уведомление Роскомнадзора как оператора ПД
- [ ] Регулярное тестирование на проникновение

## Масштабирование

Текущая архитектура поддерживает:
- **20 клиентов** — SQLite, один сервер
- **50-200 клиентов** — PostgreSQL, Docker
- **200+ клиентов** — Горизонтальное масштабирование: несколько backend-инстансов за балансировщиком, отдельный сервер БД, Redis для кэша/сессий

## Лицензия

Проприетарное ПО. Все права защищены.
