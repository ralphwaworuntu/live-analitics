# SENTINEL Socket.IO Server

Socket.IO server that bridges telemetry from SENTINEL Mobile App to Dashboard.

## Quick Start

### Local Development
```bash
cd server
npm install
npm run dev
```

### Docker
```bash
docker-compose up -d sentinel-socket
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Server health status |
| `/api/units` | GET | List registered patrol units |
| `/api/positions` | GET | Current positions of all units |

## Socket.IO Events

### Mobile → Server

**`PERSONNEL_TELEMETRY`**
```json
{
  "id": "UNIT-001",
  "nrp": "88050912",
  "name": "Bripda Andi",
  "lat": -10.158,
  "lng": 123.606,
  "speed": 45.5,
  "batteryLevel": 85,
  "isCharging": false,
  "timestamp": "2026-04-12T10:30:00Z",
  "hash": "SEC-HASH-ABC123..."
}
```

**`UNIT_SOS`**
```json
{
  "id": "UNIT-001",
  "lat": -10.158,
  "lng": 123.606,
  "message": "Emergency at sector 7",
  "timestamp": "2026-04-12T10:30:00Z"
}
```

### Server → Dashboard

**`personnel_update`** (broadcast to all)
```json
{
  "id": "UNIT-001",
  "nrp": "88050912",
  "name": "Bripda Andi",
  "lat": -10.158,
  "lng": 123.606,
  "speed": 45.5,
  "batteryLevel": 85,
  "isCharging": false,
  "serverTimestamp": "2026-04-12T10:30:00.123Z",
  "receivedAt": 1712916600123,
  "assetId": "UNIT-001"
}
```

**`INITIAL_POSITIONS`** (sent to new dashboard connections)
```json
{
  "UNIT-001": { ... },
  "UNIT-002": { ... }
}
```

**`SOS_ALERT`** (broadcast to all)
```json
{
  "id": "UNIT-001",
  "lat": -10.158,
  "lng": 123.606,
  "message": "Emergency at sector 7",
  "serverTimestamp": "2026-04-12T10:30:00.123Z"
}
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 8000 | Server port |
| `JWT_SECRET` | SENTINEL-SECRET-KEY-2026 | JWT signing secret |
| `REDIS_URL` | null | Redis connection URL (optional) |

## Registered Units (NRP)

For testing, the following NRPs are pre-registered:
- `88050912` - Bripda Andi (UNIT-001)
- `91180501` - Bp. Terawan (UNIT-002)
- `91070877` - Bripka Yohanis (UNIT-003)

## Integration with Mobile App

In `apps/mobile-expo/src/services/socketService.ts`, update the API URL:
```typescript
const API_URL = 'http://YOUR_SERVER_IP:8000';
```

## Integration with Dashboard

The dashboard connects to the same Socket.IO server at:
```
http://YOUR_SERVER_IP:8000
```

In `apps/dashboard/.env.local`:
```
NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP:8000
```
