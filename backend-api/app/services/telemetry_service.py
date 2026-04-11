import asyncio
import time
from typing import List, Dict
# Assuming a database connector exists in app.database
from app.database import database

class TelemetryBatcher:
    """Task 3: WebSocket Throttling & Batching logic"""
    def __init__(self, batch_window_sec: int = 2):
        self.buffer: List[Dict] = []
        self.batch_window = batch_window_sec
        self.lock = asyncio.Lock()
        self.last_flush = time.time()

    async def add_log(self, data: Dict):
        async with self.lock:
            self.buffer.append(data)
            
            # Flush if 2 seconds passed
            if time.time() - self.last_flush >= self.batch_window:
                await self.flush()

    async def flush(self):
        if not self.buffer:
            return
        
        batch_to_write = list(self.buffer)
        self.buffer.clear()
        self.last_flush = time.time()
        
        try:
            # Task 3: Bulk Insert to maximizing throughput
            # Assuming 'telemetry_logs' table mapping
            query = "INSERT INTO telemetry_logs (unit_id, latitude, longitude, current_hash, created_at) VALUES (:unit_id, :lat, :lng, :hash, :timestamp)"
            await database.execute_many(query=query, values=batch_to_write)
            print(f"[BATCHER] Successfully flushed {len(batch_to_write)} telemetry logs.")
        except Exception as e:
            print(f"[BATCHER] Flush Error: {e}")
            # Optional: push back to buffer or save to dead-letter queue

telemetry_batcher = TelemetryBatcher()
