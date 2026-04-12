/**
 * SENTINEL Socket.IO Server
 * Bridges telemetry from Mobile App to Dashboard
 */

import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

interface TelemetryPayload {
  id: string;
  nrp: string;
  name: string;
  lat: number;
  lng: number;
  speed: number;
  batteryLevel: number;
  isCharging: boolean;
  connectionType?: string;
  signalStatus?: string;
  heading?: number;
  timestamp?: string;
  hash?: string;
}

interface EnrichedTelemetry extends TelemetryPayload {
  serverTimestamp: string;
  receivedAt: number;
  assetId: string;
}

interface RegisteredUnit {
  nrp: string;
  name: string;
  unitId: string;
  isActive: boolean;
  lastSeen: number;
}

const PORT = Number(process.env.PORT) || 8000;
const JWT_SECRET = process.env.JWT_SECRET || 'SENTINEL-SECRET-KEY-2026';

const registeredUnits: Map<string, RegisteredUnit> = new Map();
const lastPositions: Map<string, EnrichedTelemetry> = new Map();
const connectedClients: Set<{ socketId: string; role: string }> = new Set();

function initializeUnits() {
  const units = [
    { nrp: '88050912', name: 'Bripda Andi', unitId: 'UNIT-001', isActive: true, lastSeen: Date.now() },
    { nrp: '91180501', name: 'Bp. Terawan', unitId: 'UNIT-002', isActive: true, lastSeen: Date.now() },
    { nrp: '91070877', name: 'Bripka Yohanis', unitId: 'UNIT-003', isActive: true, lastSeen: Date.now() },
  ];
  units.forEach(u => registeredUnits.set(u.nrp, u));
}
initializeUnits();

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime(), clients: connectedClients.size });
});

app.get('/api/units', (req, res) => {
  const units = Array.from(registeredUnits.values());
  res.json({ units, count: units.length });
});

app.get('/api/positions', (req, res) => {
  const positions: Record<string, EnrichedTelemetry> = {};
  lastPositions.forEach((pos, id) => { positions[id] = pos; });
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

function handleTelemetry(socket: Socket, payload: TelemetryPayload) {
  const validation = validateNrp(payload.nrp);
  if (!validation.valid) {
    socket.emit('ERROR', { code: 'INVALID_NRP', message: 'Unit not registered' });
    return;
  }

  const unit = validation.unit!;
  const enriched: EnrichedTelemetry = {
    ...payload,
    serverTimestamp: new Date().toISOString(),
    receivedAt: Date.now(),
    assetId: unit.unitId
  };

  lastPositions.set(unit.unitId, enriched);
  unit.lastSeen = Date.now();
  
  io.emit('personnel_update', enriched);
  console.log(`[TELEMETRY] ${payload.nrp}: ${payload.lat.toFixed(4)}, ${payload.lng.toFixed(4)}`);
  
  socket.emit('TELEMETRY_ACK', { received: true, serverTimestamp: enriched.serverTimestamp });
}

io.on('connection', (socket: Socket) => {
  const role = socket.handshake.auth?.role || 'dashboard';
  connectedClients.add({ socketId: socket.id, role });
  console.log(`[CONNECT] ${socket.id} (${role}) - Total: ${connectedClients.size}`);

  if (role === 'dashboard') {
    const positions: Record<string, EnrichedTelemetry> = {};
    lastPositions.forEach((pos, id) => { positions[id] = pos; });
    socket.emit('INITIAL_POSITIONS', positions);
  }

  socket.on('PERSONNEL_TELEMETRY', (payload: TelemetryPayload) => handleTelemetry(socket, payload));

  socket.on('UNIT_SOS', (payload: any) => {
    io.emit('SOS_ALERT', { ...payload, serverTimestamp: new Date().toISOString() });
    console.log(`[SOS] ${payload.id}`);
  });

  socket.on('disconnect', () => {
    connectedClients.delete({ socketId: socket.id, role });
    console.log(`[DISCONNECT] ${socket.id} - Remaining: ${connectedClients.size}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`SENTINEL Socket.IO Server running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
  console.log(`Units: http://localhost:${PORT}/api/units`);
  console.log(`Positions: http://localhost:${PORT}/api/positions`);
});
