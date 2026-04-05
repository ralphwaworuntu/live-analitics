"""
SENTINEL API — Database Models (SQLAlchemy + GeoAlchemy2)
"""

from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Index,
)
from sqlalchemy.orm import DeclarativeBase, relationship
from geoalchemy2 import Geometry


class Base(DeclarativeBase):
    pass


class Polres(Base):
    """Polres (Police Resort) - 21 in NTT"""

    __tablename__ = "polres"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False, unique=True)
    code = Column(String(20), nullable=False, unique=True)  # e.g., "kupang-kota"
    island = Column(String(50), nullable=False)  # Timor, Flores, Sumba, etc.
    location = Column(Geometry("POINT", srid=4326))
    address = Column(Text)
    phone = Column(String(20))
    created_at = Column(DateTime, default=datetime.utcnow)

    personnel = relationship("Personnel", back_populates="polres")
    incidents = relationship("Incident", back_populates="polres")


class Personnel(Base):
    """Police personnel"""

    __tablename__ = "personnel"

    id = Column(Integer, primary_key=True)
    nrp = Column(String(20), nullable=False, unique=True)  # Registration number
    name = Column(String(100), nullable=False)
    rank = Column(String(50))
    position = Column(String(100))
    polres_id = Column(Integer, ForeignKey("polres.id"), nullable=False)
    phone = Column(String(20))
    is_active = Column(Boolean, default=True)
    is_on_duty = Column(Boolean, default=False)
    last_location = Column(Geometry("POINT", srid=4326))
    last_seen = Column(DateTime)
    password_hash = Column(String(255))
    role = Column(
        String(20), default="field_officer"
    )  # superadmin, admin_polres, operator, field_officer
    login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # GAMIFICATION ENGINE (AI-Patrol & Ren-Ops Compliance)
    points = Column(Integer, default=0)
    achievements = Column(Text) # JSON list: e.g. ["Top Patrol", "Early Responder"]

    polres = relationship("Polres", back_populates="personnel")

    __table_args__ = (Index("ix_personnel_polres", "polres_id"),)


class Incident(Base):
    """Incident reports"""

    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    category = Column(String(50))  # kamtibmas, lalu_lintas, kriminal, etc.
    severity = Column(String(20), default="rendah")  # rendah, sedang, tinggi, kritis
    status = Column(String(20), default="open")  # open, in_progress, resolved, closed
    location = Column(Geometry("POINT", srid=4326))
    address = Column(Text)
    polres_id = Column(Integer, ForeignKey("polres.id"), nullable=False)
    reported_by = Column(Integer, ForeignKey("personnel.id"), nullable=True)
    photo_url = Column(String(500))
    ai_analysis = Column(Text)  # YOLOv8 / AI analysis result
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    polres = relationship("Polres", back_populates="incidents")

    __table_args__ = (
        Index("ix_incidents_polres", "polres_id"),
        Index("ix_incidents_status", "status"),
        Index("ix_incidents_created", "created_at"),
    )


class AuditLog(Base):
    """Immutable audit trail — CANNOT be deleted"""

    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("personnel.id"), nullable=True)
    action = Column(String(50), nullable=False)  # login, view, create, update, etc.
    resource = Column(String(100))  # What was accessed
    resource_id = Column(Integer)
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    details = Column(Text)  # JSON additional info
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("ix_audit_timestamp", "timestamp"),
        Index("ix_audit_user", "user_id"),
    )


class ChatMessage(Base):
    """AI Chat messages (segmented per Polres)"""

    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True)
    polres_id = Column(Integer, ForeignKey("polres.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("personnel.id"), nullable=True)
    role = Column(String(20), nullable=False)  # user, assistant
    content = Column(Text, nullable=False)
    references = Column(Text)  # JSON array of legal references
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (Index("ix_chat_polres", "polres_id"),)

class ExternalWebhook(Base):
    """External Agencies (Ambulance, Fire, etc)"""
    __tablename__ = "external_webhooks"
    id = Column(Integer, primary_key=True)
    agency_name = Column(String(100), nullable=False)
    webhook_url = Column(String(500), nullable=False)
    is_active = Column(Boolean, default=True)
