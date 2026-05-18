from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # API Keys
    anthropic_api_key: str = ""
    newsapi_key: str = ""
    openweathermap_key: str = ""
    slack_webhook_url: str = ""
    sendgrid_api_key: str = ""

    # Database
    database_url: str = "postgresql+asyncpg://ciro:ciro@localhost:5432/ciro"
    redis_url: str = "redis://localhost:6379"

    # App
    app_name: str = "CIRO"
    debug: bool = True
    pipeline_interval_seconds: int = 30
    detection_threshold: float = 0.72
    keyword_prefilter_threshold: float = 0.2

    # JWT (dashboard auth)
    secret_key: str = "changeme-in-production"

    class Config:
        env_file = ".env"


settings = Settings()
