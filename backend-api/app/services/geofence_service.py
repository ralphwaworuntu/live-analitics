import logging
from datetime import datetime
from typing import List, Dict
from shapely.geometry import Point, mapping
from shapely.ops import transform
import pyproj
from app.services.redis_service import redis_manager

logger = logging.getLogger(__name__)

# Projection for distance calculations (meters)
wgs84 = pyproj.CRS('EPSG:4326')
utm = pyproj.CRS('EPSG:3857')
project = pyproj.Transformer.from_crs(wgs84, utm, always_xy=True).transform

class GeofenceService:
    """Task 1: Geofence Definition Service"""
    def __init__(self):
        self.active_risk_geofences: List[Dict] = []

    async def update_risk_zones(self, heatmap_data: List[Dict]):
        """Create 500m geofences around points with Risk Score > 0.8"""
        new_geofences = []
        for point in heatmap_data:
            if point.get("weight", 0) > 0.8:
                p = Point(point["lng"], point["lat"])
                # Create a 500m buffer
                utm_point = transform(project, p)
                buffer = utm_point.buffer(500)
                # Transform back to WGS84 for storage/comparison
                wgs84_buffer = transform(pyproj.Transformer.from_crs(utm, wgs84, always_xy=True).transform, buffer)
                
                new_geofences.append({
                    "center": (point["lat"], point["lng"]),
                    "polygon": wgs84_buffer,
                    "score": point["weight"]
                })
        
        self.active_risk_geofences = new_geofences
        logger.info(f"🛡️ Geofence Manager: {len(self.active_risk_geofences)} High-Risk Zones activated.")

    async def check_unit_safety(self, unit_id: str, lat: float, lng: float):
        """Task 2 & 3: Spatial Intersection and Alerting"""
        unit_pos = Point(lng, lat)
        
        for zone in self.active_risk_geofences:
            if zone["polygon"].contains(unit_pos):
                logger.warning(f"🚨 UNIT {unit_id} ENTERED HIGH-RISK ZONE ({zone['center']})")
                
                # Task 3: Automated Dispatch Alert via Redis
                await redis_manager.publish_telemetry({
                    "type": "INTEL_ALERT",
                    "unitId": unit_id,
                    "level": "CRITICAL",
                    "message": "⚠️ ENTERING HIGH-RISK ZONE: Proceed with caution. Backup is being notified.",
                    "timestamp": datetime.now().isoformat()
                })
                return True
        return False

geofence_service = GeofenceService()
