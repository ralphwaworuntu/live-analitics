"""
SENTINEL API — Audit Log Service (Immutable)
"""

from sqlalchemy.ext.asyncio import AsyncSession
from app.models import AuditLog
from datetime import datetime

async def log_action(
    db: AsyncSession,
    action: str,
    ip_address: str,
    user_agent: str,
    user_id: int = None,
    resource: str = None,
    resource_id: int = None,
    details: str = None
):
    """
    Creates an immutable audit log entry.
    """
    audit = AuditLog(
        user_id=user_id,
        action=action,
        resource=resource,
        resource_id=resource_id,
        ip_address=ip_address,
        user_agent=user_agent,
        details=details,
        timestamp=datetime.utcnow()
    )
    db.add(audit)
    await db.commit()
