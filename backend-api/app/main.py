"""
SENTINEL API — FastAPI Backend for Polda NTT Command Center
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
from app.config import settings

from contextlib import asynccontextmanager
from app.database import engine
from app.models import Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Cleanup
    await engine.dispose()

app = FastAPI(
    title="SENTINEL API",
    description="AI-Powered Command Center API untuk Biro Operasi Polda NTT",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

from app.middleware.ip_whitelist import IPWhitelistMiddleware

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# IP Whitelist Middleware
app.add_middleware(IPWhitelistMiddleware)

# Import routes
from app.routes import auth, chat, map, vision
from app.routes.emergency import sio

# Hook routers
app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(map.router)
app.include_router(vision.router)

# Hook Socket.IO
socket_app = socketio.ASGIApp(sio, other_asgi_app=app, socketio_path='/ws/socket.io')

# To run you would pass `socket_app` to uvicorn, but since standard FastAPI is `app`, 
# we can just re-assign app or export `socket_app`
app.mount("/ws", socketio.ASGIApp(sio))


@app.get("/api/health")
async def health_check():
    return {
        "status": "operational",
        "service": "SENTINEL API",
        "version": "1.0.0",
        "components": {
            "database": "pending",
            "ollama": "pending",
            "milvus": "pending",
        },
    }


# Other route imports will be added as features are implemented
# from app.routes import chat, vision, map, emergency

