"""
SENTINEL API — Application Configuration
"""

import os
from dataclasses import dataclass, field


@dataclass
class Settings:
    # App
    APP_NAME: str = "SENTINEL API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"

    # Database (PostGIS)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://sentinel:sentinel_secret@db:5432/sentinel_db",
    )

    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://redis:6379/0")

    # Ollama (Llama 3 8B)
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://ollama:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3:8b")

    # Milvus (Vector DB)
    MILVUS_HOST: str = os.getenv("MILVUS_HOST", "milvus")
    MILVUS_PORT: int = int(os.getenv("MILVUS_PORT", "19530"))

    # Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "change-this-in-production")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    ALLOWED_ORIGINS: list[str] = field(
        default_factory=lambda: os.getenv(
            "ALLOWED_ORIGINS", "http://localhost:3000"
        ).split(",")
    )

    # IP Whitelist (comma separated)
    IP_WHITELIST: list[str] = field(
        default_factory=lambda: os.getenv("IP_WHITELIST", "").split(",")
        if os.getenv("IP_WHITELIST")
        else []
    )

    # Rate Limiting
    MAX_LOGIN_ATTEMPTS: int = 3
    LOCKOUT_DURATION_MINUTES: int = 30

    # Object Storage (S3-compatible)
    S3_ENDPOINT: str = os.getenv("S3_ENDPOINT", "")
    S3_BUCKET: str = os.getenv("S3_BUCKET", "sentinel-uploads")
    S3_ACCESS_KEY: str = os.getenv("S3_ACCESS_KEY", "")
    S3_SECRET_KEY: str = os.getenv("S3_SECRET_KEY", "")


settings = Settings()
