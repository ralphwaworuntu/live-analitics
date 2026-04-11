import random
import time
import json
import hashlib
from locust import HttpUser, task, between, events

class SentinelMobileUser(HttpUser):
    wait_time = between(1, 5)
    
    def on_start(self):
        """Simulate Login and QR Binding"""
        self.user_id = f"unit-{random.randint(100, 999)}"
        self.asset_id = f"POL-R4-{random.randint(1, 50)}"
        self.current_hash = "SEC-INIT"
        
        # 1. Login
        self.client.post("/api/auth/login", json={
            "nrp": f"8805{random.randint(1000, 9999)}",
            "password": "password123"
        })
        
        # 2. QR Binding
        self.client.post("/api/assets/bind", json={
            "unitId": self.user_id,
            "assetId": self.asset_id
        })

    @task(10)
    def emit_coordinate(self):
        """Task 3: Periodic coordinate emits with SEC-HASH"""
        lat = -10.17 + (random.random() * 0.01)
        lng = 123.58 + (random.random() * 0.01)
        
        payload = {
            "unitId": self.user_id,
            "lat": lat,
            "lng": lng,
            "prevHash": self.current_hash,
            "timestamp": time.time()
        }
        
        # Simple SEC-HASH simulation
        self.current_hash = hashlib.sha256(json.dumps(payload).encode()).hexdigest()
        payload["hash"] = self.current_hash
        
        # Simulate WebSocket over HTTP (or direct API if implemented)
        self.client.post("/api/telemetry/emit", json=payload)

    @task(1)
    def trigger_sos(self):
        """Task 4: Random SOS triggers"""
        self.client.post("/api/telemetry/sos", json={
            "unitId": self.user_id,
            "type": "CRISIS_LOAD_TEST",
            "timestamp": time.time()
        })

    @task(1)
    def finalize_mission(self):
        """Task 5: Finalizing mission with PDF request"""
        self.client.post("/api/mission/finalize", json={
            "unitId": self.user_id,
            "finalHash": self.current_hash
        })
        # Simulate PDF download
        self.client.get("/api/reports/generate?unitId=" + self.user_id)
        
        # Re-bind for next loop simulation
        self.on_start()
