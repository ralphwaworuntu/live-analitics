"""
SENTINEL API — Auth Router 
"""

import json
from datetime import datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Personnel
from app.services.auth_service import verify_password, create_access_token
from app.services.audit_service import log_action
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login", status_code=status.HTTP_200_OK)
async def login(
    request: Request,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: AsyncSession = Depends(get_db)
):
    ip_address = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")

    # The form_data.username will be the NRP
    stmt = select(Personnel).where(Personnel.nrp == form_data.username)
    result = await db.execute(stmt)
    personnel = result.scalars().first()

    if not personnel:
        # Avoid user enumeration by giving a generic error
        await log_action(
            db=db,
            action="login_failed",
            resource="personnel",
            ip_address=ip_address,
            user_agent=user_agent,
            details=json.dumps({"reason": "invalid_credentials", "nrp": form_data.username})
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="NRP atau Password salah.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check lock status
    if personnel.locked_until and personnel.locked_until > datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Akun terkunci sementara karena terlalu banyak percobaan login yang gagal.",
        )

    # Verify password
    if not verify_password(form_data.password, personnel.password_hash):
        personnel.login_attempts += 1
        
        # If attempts exceed max, lock account
        if personnel.login_attempts >= settings.MAX_LOGIN_ATTEMPTS:
            personnel.locked_until = datetime.utcnow() + timedelta(minutes=settings.LOCKOUT_DURATION_MINUTES)
            personnel.login_attempts = 0
            await log_action(
                db=db,
                action="account_locked",
                resource="personnel",
                resource_id=personnel.id,
                ip_address=ip_address,
                user_agent=user_agent,
                details=json.dumps({"reason": "max_attempts", "attempts": settings.MAX_LOGIN_ATTEMPTS})
            )
            await db.commit()
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Akun terkunci sementara karena terlalu banyak percobaan login yang gagal.",
            )
            
        await db.commit()
        await log_action(
            db=db,
            action="login_failed",
            resource="personnel",
            resource_id=personnel.id,
            ip_address=ip_address,
            user_agent=user_agent,
            details=json.dumps({"reason": "invalid_credentials", "attempts": personnel.login_attempts})
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="NRP atau Password salah.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Login successful
    personnel.login_attempts = 0
    personnel.locked_until = None
    
    # Generate JWT Token payload
    access_token_expires = timedelta(hours=settings.JWT_EXPIRATION_HOURS)
    access_token = create_access_token(
        data={"sub": personnel.nrp, "role": personnel.role, "polres_id": personnel.polres_id},
        expires_delta=access_token_expires
    )

    await log_action(
        db=db,
        action="login_success",
        resource="personnel",
        resource_id=personnel.id,
        ip_address=ip_address,
        user_agent=user_agent
    )
    
    await db.commit()

    return {"access_token": access_token, "token_type": "bearer"}
