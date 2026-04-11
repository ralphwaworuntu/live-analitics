from fastapi import APIRouter, Depends
from app.services.heatmap_service import heatmap_service

router = APIRouter(prefix="/api/intel", tags=["Intelligence"])

@router.get("/heatmap")
async def get_risk_heatmap():
    """Task 3: Heatmap API Endpoint with Redis Caching"""
    data = await heatmap_service.get_cached_heatmap()
    return {
        "status": "success",
        "data": data,
        "type": "RiskDensityMap"
    }

@router.post("/recalculate")
async def trigger_heatmap_recalculation():
    data = await heatmap_service.generate_heatmap()
    return {"message": "Recalculation complete", "grid_points": len(data)}
