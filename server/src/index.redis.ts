/**
 * SENTINEL Socket.IO Server with Redis Persistence
 * For production use with multiple dashboard instances
 */

import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';

interface TelemetryPayload {
  id: string; nrp: string; name: string;
  lat: number; lng: number; speed: number;
  batteryLevel: number; isCharging: boolean;
  connectionType?: string; signalStatus?: string;
  heading?: number; timestamp?: string; hash?: string;
}

interface EnrichedTelemetry extends TelemetryPayload {
  serverTimestamp: string; receivedAt: number; assetId: string;
}

interface RegisteredUnit {
  nrp: string; name: string; unitId: string; isActive: boolean; lastSeen: number;
}

const PORT = Number(process.env.PORT) || 8000;
const JWT_SECRET = process.env.JWT_SECRET || 'SENTINEL-SECRET-KEY-2026';
const REDIS_URL = process.env.REDIS_URL || null;

let redis: Redis | null = null;

// Initialize Redis if URL provided
if (REDIS_URL) {
  redis = new Redis(REDIS_URL);
  redis.on('connect', () => console.log('[REDIS] Connected'));
  redis.on('error', (e) => console.error('[REDIS] Error:', e));
}

const registeredUnits = new Map<string, RegisteredUnit>();
const lastPositions = new Map<string, EnrichedTelemetry>();
const connectedClients = new Set<{ socketId: string; role: string }>();

function initializeUnits() {
  [
    { nrp: '88050912', name: 'Bripda Andi', unitId: 'UNIT-001' },
    { nrp: '91180501', name: 'Bp. Terawan', unitId: 'UNIT-002' },
    { nrp: '91070877', name: 'Bripka Yohanis', unitId: 'UNIT-003' },
  ].forEach(u => registeredUnits.set(u.nrp, { ...u, isActive: true, lastSeen: Date.now() }));
}
initializeUnits();

const app = express();
app.use(cors());
app.use(express.json());
const httpServer = createServer(app);

app.get('/health', async (req, res) => {
  let redisStatus = 'not configured';
  if (redis) {
    try { await redis.ping(); redisStatus = 'connected'; } 
    catch { redisStatus = 'error'; }
  }
  res.json({ status: 'healthy', uptime: process.uptime(), clients: connectedClients.size, redis: redisStatus });
});

app.get('/api/units', async (req, res) => {
  const units = Array.from(registeredUnits.values());
  res.json({ units, count: units.length });
});

app.get('/api/positions', async (req, res) => {
  const positions: Record<string, EnrichedTelemetry> = {};
  
  if (redis) {
    const keys = await redis.keys('position:*');
    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        const unitId = key.replace('position:', '');
        positions[unitId] = JSON.parse(data);
      }
    }
  } else {
    lastPositions.forEach((pos, id) => { positions[id] = pos; });
  }
  res.json({ positions, count: Object.keys(positions).length });
});

const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  transports: ['websocket', 'polling']
});

function validateNrp(nrp: string) {
  const unit = registeredUnits.get(nrp);
  return unit && unit.isActive ? { valid: true, unit } : { valid: false };
}

async function storePosition(unitId: string, telemetry: EnrichedTelemetry) {
  lastPositions.set(unitId, telemetry);
  
  if (redis) {
    await redis.setex(`position:${unitId}`, 3600, JSON.stringify(telemetry));
    await redis.setex(`unit:${unitId}:lastseen`, 86400, String(Date.now()));
  }
}

function handleTelemetry(socket: Socket, payload: TelemetryPayload) {
  const validation = validateNrp(payload.nrp);
  if (!validation.valid) {
    socket.emit('ERROR', { code: 'INVALID_NRP' });
    return;
  }

  const unit = validation.unit!;
  const enriched: EnrichedTelemetry = {
    ...payload,
    serverTimestamp: new Date().toISOString(),
    receivedAt: Date.now(),
    assetId: unit.unitId
  };

  storePosition(unit.unitId, enriched);
  unit.lastSeen = Date.now();
  
  io.emit('personnel_update', enriched);
  socket.emit('TELEMETRY_ACK', { received: true, serverTimestamp: enriched.serverTimestamp });
}

io.on('connection', (socket: Socket) => {
  const role = socket.handshake.auth?.role || 'dashboard';
  connectedClients.add({ socketId: socket.id, role });
  console.log(`[CONNECT] ${socket.id} (${role})`);

  if (role === 'dashboard') {
    const positions: Record<string, EnrichedTelemetry> = {};
    if (redis) {
      // Load from Redis
    }
    lastPositions.forEach((pos, id) => { positions[id] = pos; });
    socket.emit('INITIAL_POSITIONS', positions);
  }

  socket.on('PERSONNEL_TELEMETRY', (p) => handleTelemetry(socket, p));
  socket.on('UNIT_SOS', (p) => io.emit('SOS_ALERT', { ...p, serverTimestamp: new Date().toISOString() }));
  socket.on('disconnect', () => {
    connectedClients.delete({ socketId: socket.id, role });
  });
});

httpServer.listen(PORT, () => {
  console.log(`SENTINEL Socket.IO Server (with Redis) running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
});
