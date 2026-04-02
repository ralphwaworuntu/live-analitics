"""
SENTINEL API — Emergency WebSockets Handler
"""

import socketio
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

# Configure Socket.IO server with ASGI app support
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*' # Restrict in production
)

# Keep track of active connections
active_connections: Dict[str, Any] = {}

@sio.on('connect')
async def on_connect(sid, environ, auth):
    logger.info(f"🟢 Client connected: {sid}")
    active_connections[sid] = True
    
    # In a real app, you would validate the JWT token inside `auth`
    # and assign the user to specific rooms (e.g., 'polres_kupang')
    await sio.enter_room(sid, 'global_command')

@sio.on('disconnect')
async def on_disconnect(sid):
    logger.info(f"🔴 Client disconnected: {sid}")
    active_connections.pop(sid, None)

@sio.on('trigger_sos')
async def on_trigger_sos(sid, data):
    """
    Called by mobile app or dashboard simulation to trigger an SOS.
    """
    logger.warning(f"🚨 SOS TRIGGERED by {sid}: {data}")
    
    # Broadcast Visual Hijack to all clients in 'global_command'
    await sio.emit(
        'emergency_broadcast',
        {
            'message': data.get('message', 'SOS DARURAT DARI LAPANGAN'),
            'location': data.get('location', 'Lokasi Tidak Diketahui'),
            'severity': 'kritis',
            'timestamp': data.get('timestamp')
        },
        room='global_command'
    )
