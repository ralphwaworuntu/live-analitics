"""
SENTINEL API — Map & GIS Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.models import Polres, Incident, Personnel
from app.config import settings

router = APIRouter(prefix="/api/map", tags=["Map"])

@router.get("/heatmap")
async def get_heatmap_data(
    db: AsyncSession = Depends(get_db),
    time_range_hours: int = Query(24, description="Historical range in hours")
):
    """
    Returns incident data formatted for Heatmap mapping.
    Uses PostGIS spatial functionality to extract ST_AsGeoJSON theoretically,
    but we will extract float point coords directly for the frontend layer.
    """
    
    # Query incidents with their Geo Point representation
    # Using ST_X and ST_Y on the geometry column
    stmt = select(
        Incident.id, 
        Incident.title,
        Incident.severity,
        func.ST_Y(func.ST_AsText(Incident.location)).label("lat"),
        func.ST_X(func.ST_AsText(Incident.location)).label("lng")
    ).where(Incident.location.is_not(None))
    
    # In a full app, we would also filter by `created_at` using `time_range_hours`
    
    result = await db.execute(stmt)
    records = result.fetchall()
    
    heatmap_points = [
        {
            "id": r.id,
            "title": r.title,
            "severity": r.severity,
            "lat": r.lat,
            "lng": r.lng,
            "weight": 3 if r.severity == "kritis" else 2 if r.severity == "tinggi" else 1
        }
        for r in records
    ]

    return {"status": "success", "heat_points": heatmap_points}

@router.get("/polres")
async def get_all_polres(db: AsyncSession = Depends(get_db)):
    """
    Returns spatial coordinate and status for all 21 Polres
    """
    stmt = select(
        Polres.id,
        Polres.name,
        Polres.code,
        Polres.island,
        func.ST_Y(func.ST_AsText(Polres.location)).label("lat"),
        func.ST_X(func.ST_AsText(Polres.location)).label("lng")
    )
    result = await db.execute(stmt)
    records = result.fetchall()
    
    locations = [
        {
            "id": r.code,
            "name": r.name,
            "island": r.island,
            "lat": r.lat,
            "lng": r.lng,
            "status": "kondusif" # In reality this would aggregate incidents
        }
        for r in records
    ]
    
    return {"status": "success", "data": locations}
