"""
SENTINEL API — Emergency & Tactical WebSockets Handler
Standard: Life360 Forensic-Grade Tracking + Proactive Tactical Intelligence
"""

import socketio
import logging
import json
import math
import httpx
from datetime import datetime
from typing import Dict, Any
from shapely.geometry import Point, Polygon

logger = logging.getLogger(__name__)

sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*'
)

# Mock Polres Jurisdictions
POLRES_BOUNDARIES = {
    "Kupang Kota": Polygon([(-10.150, 123.580), (-10.150, 123.620), (-10.180, 123.620), (-10.180, 123.580)]),
    "Belu": Polygon([(-9.100, 124.850), (-9.100, 124.950), (-9.200, 124.950), (-9.200, 124.850)])
}

last_known_payloads: Dict[str, Any] = {}

def get_distance(lat1, lon1, lat2, lon2):
    R = 6371e3 
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi, delta_lambda = math.radians(lat2 - lat1), math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2)**2
    return R * (2 * math.asin(math.sqrt(a)))

@sio.on('connect')
async def on_connect(sid, environ, auth):
    logger.info(f"🟢 Tactical Connection: {sid}")
    await sio.enter_room(sid, 'global_command')

@sio.on('disconnect')
async def on_disconnect(sid):
    last_payload = last_known_payloads.get(sid)
    if last_payload:
        await sio.emit('emergency_broadcast', {
            'message': f"Unit {sid} Disconnected Prematurely.",
            'location': f"{last_payload.get('lat')}, {last_payload.get('lng')}",
            'severity': 'tinggi', 'timestamp': datetime.now().isoformat()
        }, room='global_command')
        last_known_payloads.pop(sid, None)
    logger.info(f"🔴 Client offline: {sid}")

@sio.on('live_tracking')
async def on_live_tracking(sid, data):
    lat, lng = data.get('lat'), data.get('lng')
    if not lat or not lng: return
    last_known_payloads[sid] = data
    p = Point(lat, lng)
    is_oob = True
    active_sector = "Unknown"
    for name, poly in POLRES_BOUNDARIES.items():
        if poly.contains(p): is_oob, active_sector = False, name; break
    
    await sio.emit('map_update', {
        'unitId': sid, 'lat': lat, 'lng': lng, 'speed': data.get('speed', 0),
        'battery': data.get('battery'), 'signal': data.get('signal'),
        'sector': active_sector, 'is_oob': is_oob, 'timestamp': data.get('timestamp')
    }, room='global_command')

@sio.on('trigger_sos')
async def on_trigger_sos(sid, data):
    logger.warning(f"🚨 SOS SOS SOS by {sid}")
    sos_lat, sos_lng = data.get('lat'), data.get('lng')
    await sio.emit('emergency_broadcast', {
        'message': data.get('message', 'SOS DARURAT'),
        'location': f"{sos_lat}, {sos_lng}",
        'severity': 'kritis', 'timestamp': datetime.now().isoformat()
    }, room='global_command')
    
    if sos_lat and sos_lng:
        for user_sid, payload in last_known_payloads.items():
            if user_sid != sid:
                dist = get_distance(sos_lat, sos_lng, payload.get('lat'), payload.get('lng'))
                if dist < 500:
                    await sio.emit('push_notification', {
                        'title': '🚨 SUPPORT NEEDED', 'message': f'Rekan terdekat membutuhkan dukungan ({int(dist)}m).',
                        'target_lat': sos_lat, 'target_lng': sos_lng
                    }, room=user_sid)

# INTER-AGENCY WEBHOOKS: One-Click Dispatch
@sio.on('external_dispatch')
async def on_external_dispatch(sid, data):
    """One-click dispatch to Fire/Ambulance via JSON Webhooks"""
    agency_name = data.get('agency')
    incident_id = data.get('incidentId')
    webhook_url = data.get('webhookUrl', 'https://mock.agency.gov/webhook')
    
    logger.info(f"🚑 Dispatching to {agency_name} for Incident {incident_id}")
    
    payload = {
        'source': 'SENTINEL-AI Polda NTT',
        'incident_id': incident_id,
        'lat': data.get('lat'), 'lng': data.get('lng'),
        'type': data.get('type', 'Medical/Fire Emergency'),
        'severity': 'Critical',
        'timestamp': datetime.now().isoformat()
    }
    
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(webhook_url, json=payload)
            success = resp.status_code == 200
        except Exception as e:
            success = False
            logger.error(f"❌ Webhook Failed: {e}")
            
    await sio.emit('dispatch_status', {
        'agency': agency_name, 'status': 'Success' if success else 'Failed',
        'timestamp': datetime.now().isoformat()
    }, room='global_command')

# TACTICAL INTELLIGENCE: Evidence & Backfill
@sio.on('backfill_logs')
async def on_backfill_logs(sid, data): 
    logger.info(f"🔄 Processing {len(data.get('packets', []))} Backfill packets from {sid}")
    await sio.emit('audit_alert', { 'message': f"Unit {sid} sinkronisasi offline data.", 'timestamp': datetime.now().isoformat() }, room='global_command')

@sio.on('evidence_log')
async def on_evidence_log(sid, data):
    logger.info(f"🎤 Receiving Evidence Audio from {sid}")
    await sio.emit('media_alert', { 'type': 'audio', 'unitId': sid, 'timestamp': datetime.now().isoformat() }, room='global_command')
