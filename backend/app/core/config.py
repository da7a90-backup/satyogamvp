from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # App
    APP_NAME: str = "Sat Yoga API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "sqlite:///./satyoga.db"

    # Auth
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Tilopay
    TILOPAY_API_KEY: Optional[str] = None
    TILOPAY_MERCHANT_KEY: Optional[str] = None
    TILOPAY_WEBHOOK_SECRET: Optional[str] = None
    TILOPAY_BASE_URL: str = "https://api.tilopay.com/v1"
    TILOPAY_REDIRECT_URL: str = "http://localhost:3000/payment/success"
    TILOPAY_CANCEL_URL: str = "http://localhost:3000/payment/cancel"

    # Strapi
    STRAPI_URL: str = "http://localhost:1337"
    STRAPI_API_KEY: Optional[str] = None
    STRAPI_API_TOKEN: Optional[str] = None

    # Analytics
    MIXPANEL_TOKEN: Optional[str] = None
    GA4_MEASUREMENT_ID: Optional[str] = None
    GA4_API_SECRET: Optional[str] = None

    # Email
    SENDGRID_API_KEY: Optional[str] = None
    FROM_EMAIL: str = "noreply@satyoga.org"
    FROM_NAME: str = "Sat Yoga Institute"

    # Beefree
    BEEFREE_CLIENT_ID: Optional[str] = None
    BEEFREE_CLIENT_SECRET: Optional[str] = None

    # Frontend
    FRONTEND_URL: str = "http://localhost:3000"

    # CORS
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
    ]
    CORS_ORIGINS: Optional[str] = None

    # API
    API_V1_PREFIX: str = "/api"
    PROJECT_NAME: str = "Sat Yoga Platform"

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra fields from .env


settings = Settings()
