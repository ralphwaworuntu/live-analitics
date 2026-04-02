"""
SENTINEL API — IP Whitelist Middleware
"""

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class IPWhitelistMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        
        # If IP whitelist is active, check the IP
        if settings.IP_WHITELIST and len(settings.IP_WHITELIST) > 0:
            if client_ip not in settings.IP_WHITELIST:
                logger.warning(f"BLOCKED ACCESS: Unauthorized IP {client_ip} attempted to access {request.url.path}")
                return JSONResponse(
                    status_code=403,
                    content={"detail": "Forbidden: IP Address not authorized. This incident has been logged for security audit."}
                )

        response = await call_next(request)
        return response
