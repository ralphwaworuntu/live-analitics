import json
import logging
from datetime import datetime, timedelta
from app.database import database
from app.services.redis_service import redis_manager

logger = logging.getLogger(__name__)

class HeatmapService:
    """Task 1 & 2: Aggregation & Risk Scoring Service"""
    
    async def generate_heatmap(self):
        """Aggregate telemetry data and calculate risk weights"""
        one_hour_ago = datetime.utcnow() - timedelta(hours=1)
        
        # Query for unit density and SOS events in the last hour
        # Note: In a real TimescaleDB, we would use time_bucket
        query = """
            SELECT 
                ROUND(latitude::numeric, 3) as lat, 
                ROUND(longitude::numeric, 3) as lng,
                COUNT(*) as unit_count,
                SUM(CASE WHEN current_hash LIKE 'SOS%' THEN 1 ELSE 0 END) as sos_count
            FROM telemetry_logs
            WHERE created_at >= :start_time
            GROUP BY ROUND(latitude::numeric, 3), ROUND(longitude::numeric, 3)
        """
        
        try:
            rows = await database.fetch_all(query=query, values={"start_time": one_hour_ago})
            
            heatmap_data = []
            for row in rows:
                # Task 2: Risk Scoring Algorithm
                # Weight = (Unit_Density * 0.4) + (SOS_Events * 0.6)
                weight = (row['unit_count'] * 0.4) + (row['sos_count'] * 0.6)
                
                heatmap_data.append({
                    "lat": float(row['lat']),
                    "lng": float(row['lng']),
                    "weight": float(weight)
                })
            
            # Task 3: Cache in Redis
            if redis_manager.redis:
                await redis_manager.redis.set(
                    "sentinel:heatmap:cache", 
                    json.dumps(heatmap_data),
                    ex=300 # 5 minute expiry
                )
                
            logger.info(f"🔥 Heatmap generated with {len(heatmap_data)} grid points.")
            return heatmap_data
            
        except Exception as e:
            logger.error(f"❌ Heatmap generation failed: {e}")
            return []

    async def get_cached_heatmap(self):
        if redis_manager.redis:
            cached = await redis_manager.redis.get("sentinel:heatmap:cache")
            if cached:
                return json.loads(cached)
        return await self.generate_heatmap()

heatmap_service = HeatmapService()
