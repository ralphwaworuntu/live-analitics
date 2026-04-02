"""
SENTINEL API — Database Connection
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.config import settings

# Database Engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True,
    pool_pre_ping=True,
)

# Session local
async_session = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Dependency Injection
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Get async database session for FastAPI dependencies
    """
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()
