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
    DATABASE_URL: str

    # Auth
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Cron Jobs
    CRON_SECRET_KEY: str = "default-cron-secret-change-me"  # Change this in production!

    # Tilopay
    TILOPAY_API_KEY: Optional[str] = None
    TILOPAY_API_USER: Optional[str] = None
    TILOPAY_API_PASSWORD: Optional[str] = None
    TILOPAY_MERCHANT_KEY: Optional[str] = None
    TILOPAY_WEBHOOK_SECRET: Optional[str] = None
    TILOPAY_BASE_URL: str = "https://app.tilopay.com/api/v1"
    TILOPAY_REDIRECT_URL: str = "http://localhost:3000/payment/success"
    TILOPAY_CANCEL_URL: str = "http://localhost:3000/payment/cancel"
    TILOPAY_WEBHOOK_URL: str = "http://localhost:8000/api/payments/webhook"

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

    # Cloudflare Stream & Images
    CLOUDFLARE_ACCOUNT_ID: Optional[str] = None
    CLOUDFLARE_ACCOUNT_HASH: Optional[str] = None  # For Cloudflare Images
    CLOUDFLARE_API_TOKEN: Optional[str] = None  # For Cloudflare Stream
    CLOUDFLARE_IMAGES_TOKEN: Optional[str] = None  # For Cloudflare Images

    # Cloudflare R2 Storage
    CLOUDFLARE_R2_ACCESS_KEY_ID: Optional[str] = None
    CLOUDFLARE_R2_SECRET_ACCESS_KEY: Optional[str] = None
    CLOUDFLARE_R2_BUCKET: Optional[str] = None
    R2_BUCKET_NAME: Optional[str] = None
    R2_ENDPOINT_URL: Optional[str] = None
    R2_PUBLIC_URL: Optional[str] = None

    # YouTube
    YOUTUBE_API_KEY: Optional[str] = None

    # Frontend
    FRONTEND_URL: str = "http://localhost:3000"

    # CORS
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
    ]
    CORS_ORIGINS: Optional[str] = None

    def get_allowed_origins(self) -> list[str]:
        """
        Get list of allowed CORS origins, combining default and environment-specific origins.
        Supports comma-separated CORS_ORIGINS environment variable.
        """
        origins = self.ALLOWED_ORIGINS.copy()

        # Add origins from CORS_ORIGINS environment variable
        if self.CORS_ORIGINS:
            additional_origins = [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
            origins.extend(additional_origins)

        # Add frontend URL if specified
        if self.FRONTEND_URL and self.FRONTEND_URL not in origins:
            origins.append(self.FRONTEND_URL)

        return list(set(origins))  # Remove duplicates

    # API
    API_V1_PREFIX: str = "/api"
    PROJECT_NAME: str = "Sat Yoga Platform"

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra fields from .env


settings = Settings()
