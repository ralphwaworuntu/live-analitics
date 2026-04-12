/**
 * Socket.IO Service for SENTINEL Mobile App
 * Emits position telemetry to server which broadcasts to dashboard
 */

// @ts-ignore
import { io, Socket } from 'socket.io-client';
import { generateIntegrityHash } from '../utils/crypto';
import { PositionUpdate, TelemetryPayload } from '../types/telemetry';

declare var process: { env: { [key: string]: string | undefined } };

const QUEUE_KEY = 'sentinel_pos_queue';
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

class SocketService {
  private socket: Socket | null = null;
  private lastEmitTime: number = 0;
  private isConnected: boolean = false;

  constructor() {
    this.init();
  }

  private init() {
    try {
      this.socket = io(API_URL, {
        path: '/ws/socket.io',
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('[SOCKET] Connected to Command Center');
        this.isConnected = true;
        this.syncQueue();
      });

      this.socket.on('disconnect', () => {
        console.log('[SOCKET] Disconnected');
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error: Error) => {
        console.warn('[SOCKET] Connection error:', error.message);
        this.isConnected = false;
      });

      this.socket.on('COMMAND', (command: any) => {
        console.log('[SOCKET] Received command:', command);
      });

      this.socket.on('INTEL_ALERT', (alert: any) => {
        console.log('[INTEL] Received AI Alert:', alert);
      });

    } catch (error) {
      console.error('[SOCKET] Init error:', error);
    }
  }

  public async emitPosition(update: PositionUpdate): Promise<void> {
    try {
      const assetId = 'UNIT-001';
      const nrp = '91180501';
      
      const payload: TelemetryPayload = {
        id: assetId,
        nrp: nrp,
        name: 'Petugas Patroli',
        lat: update.lat,
        lng: update.lng,
        speed: update.speed,
        batteryLevel: update.batteryLevel,
        isCharging: update.isCharging,
        connectionType: this.getConnectionType(),
        signalStatus: this.getSignalStatus(),
        isOnline: true,
        hash: '',
        timestamp: update.timestamp
      };
      
      payload.hash = await generateIntegrityHash({
        id: payload.id,
        lat: payload.lat,
        lng: payload.lng,
        timestamp: payload.timestamp
      });

      if (this.socket?.connected) {
        this.socket.emit('PERSONNEL_TELEMETRY', payload);
        console.log('[SOCKET] Emitted telemetry:', { lat: update.lat.toFixed(4), speed: update.speed.toFixed(1) });
      } else {
        this.addToQueue(payload);
        console.warn('[SOCKET] Not connected, queued position');
      }
    } catch (error) {
      console.error('[SOCKET] Emit error:', error);
      this.addToQueue(update);
    }
  }

  public async emitSOS(position: { lat: number; lng: number }, message?: string): Promise<void> {
    const payload = {
      type: 'SOS',
      id: 'UNIT-001',
      lat: position.lat,
      lng: position.lng,
      timestamp: new Date().toISOString(),
      message: message || 'Emergency SOS triggered',
      source: 'mobile-app'
    };

    if (this.socket?.connected) {
      this.socket.emit('UNIT_SOS', payload);
      console.log('[SOCKET] SOS emitted');
    }
  }

  public emitMissionStart(data: {
    unitId: string;
    nrp: string;
    name: string;
    lat: number;
    lng: number;
    timestamp: string;
  }): void {
    const payload = {
      event: 'MISSION_START',
      ...data,
      source: 'mobile-app'
    };

    if (this.socket?.connected) {
      this.socket.emit('MISSION_START', payload);
      console.log('[SOCKET] MISSION_START emitted');
    }
  }

  public emitMissionEnd(data: {
    unitId: string;
    nrp: string;
    name: string;
    startTime: string;
    endTime: string;
    durationMs: number;
    totalDistanceKm: number;
    averageSpeedKmh: number;
    batteryLevelStart: number;
    batteryLevelEnd: number;
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
  }): void {
    const payload = {
      event: 'MISSION_END',
      ...data,
      source: 'mobile-app'
    };

    if (this.socket?.connected) {
      this.socket.emit('MISSION_END', payload);
      console.log('[SOCKET] MISSION_END emitted');
    }
  }

  private getConnectionType(): '4g' | '5g' | '3g' | 'LTE' | 'H+' | 'none' {
    return this.isConnected ? '4g' : 'none';
  }

  private getSignalStatus(): 'LTE' | '5G' | '3G' | 'H+' | 'No Signal' {
    return this.isConnected ? 'LTE' : 'No Signal';
  }

  private addToQueue(payload: any): void {
    try {
      const queue = (global as any).sentinelQueue = (global as any).sentinelQueue || [];
      queue.push(payload);
      if (queue.length > 500) queue.shift();
    } catch (e) {
      console.warn('[QUEUE] Failed to add:', e);
    }
  }

  private async syncQueue(): Promise<void> {
    if (!this.socket?.connected) return;
    
    try {
      const queue = (global as any).sentinelQueue || [];
      if (queue.length > 0) {
        for (const item of queue) {
          this.socket.emit('PERSONNEL_TELEMETRY', item);
        }
        (global as any).sentinelQueue = [];
        console.log(`[SYNC] Flushed ${queue.length} positions to server`);
      }
    } catch (e) {
      console.warn('[SYNC] Failed:', e);
    }
  }

  public async sendViaHttp(update: PositionUpdate): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/api/telemetry/position`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: update.lat,
          lng: update.lng,
          speed: update.speed,
          batteryLevel: update.batteryLevel,
          isCharging: update.isCharging,
          timestamp: update.timestamp,
          source: update.source
        })
      });
      return response.ok;
    } catch (error) {
      console.error('[HTTP] Send failed:', error);
      return false;
    }
  }

  public emit(event: string, data: any): void {
    this.socket?.emit(event, data);
  }

  public get connected(): boolean {
    return this.isConnected;
  }
}

export const socketService = new SocketService();
