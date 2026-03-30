from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    APP_NAME: str = "ФинПлан Pro"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    DATABASE_URL: str = "sqlite:///./finplan.db"

    SECRET_KEY: str = "change-me-in-production-use-openssl-rand-hex-32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAIL_FROM: str = "noreply@finplan.ru"

    NDFL_RATE: float = 0.13
    NDFL_RATE_HIGH: float = 0.15
    NDFL_HIGH_THRESHOLD: float = 5_000_000
    DIVIDEND_TAX_RATE: float = 0.13

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
