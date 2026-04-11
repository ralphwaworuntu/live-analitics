import asyncio
import json
import logging
import aioredis
from app.config import settings

logger = logging.getLogger(__name__)

class RedisManager:
    """Task 2: Global Pub/Sub Manager"""
    def __init__(self):
        self.redis_url = settings.REDIS_URL
        self.redis = None
        self.pubsub = None

    async def connect(self):
        try:
            self.redis = await aioredis.from_url(
                self.redis_url, 
                decode_responses=True,
                socket_timeout=5
            )
            logger.info(f"🟢 Redis Connected at {self.redis_url}")
        except Exception as e:
            logger.error(f"🔴 Redis Connection Failed: {e}")
            raise e

    async def publish_telemetry(self, data: dict):
        """Task 3: Decoupled Telemetry Emission"""
        if self.redis:
            try:
                await self.redis.publish("sentinel:telemetry", json.dumps(data))
            except Exception as e:
                logger.error(f"❌ Redis Publish Failed: {e}")

    async def subscribe_and_emit(self, sio_instance):
        """Background task to bridge Redis messages to Socket.IO"""
        if not self.redis:
            await self.connect()
            
        pubsub = self.redis.pubsub()
        await pubsub.subscribe("sentinel:telemetry")
        
        logger.info("📡 Redis Pub/Sub Listener Active: sentinel:telemetry")
        
        try:
            async for message in pubsub.listen():
                if message['type'] == 'message':
                    data = json.loads(message['data'])
                    # Task 4: Successful horizontal broadcast
                    event_type = data.get('type', 'map_update')
                    
                    # Emit to all connected clients on this instance
                    await sio_instance.emit(event_type, data, room='global_command')
        except Exception as e:
            logger.error(f"🛰️ Pub/Sub Listener Error: {e}")
        finally:
            await pubsub.unsubscribe("sentinel:telemetry")

redis_manager = RedisManager()
