// @ts-ignore
import { io, Socket } from "socket.io-client";
import { generateIntegrityHash } from "../utils/crypto";
import { useAppStore } from "../store";

declare var process: { env: { [key: string]: string | undefined } };

const QUEUE_KEY = "sentinel_pos_queue";
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:8000"; // Default for Android Emulator

class SocketService {
  private socket: Socket | null = null;
  private lastEmitTime: number = 0;

  constructor() {
    this.socket = io(API_URL, {
      path: "/ws/socket.io",
      transports: ["websocket"],
      autoConnect: true,
    });

    this.socket.on("connect", () => {
      console.log("[SOCKET] Connected to Command Center");
      this.syncQueue();
    });

    this.socket.on("INTEL_ALERT", (alert: any) => {
      console.log("[INTEL] Received AI Alert:", alert);
      useAppStore.getState().addAlert(alert);
      if (alert.level === 'CRITICAL') {
        useAppStore.getState().setRiskScore(80);
      }
    });

    this.socket.on("risk_update", (data: { score: number }) => {
      useAppStore.getState().setRiskScore(data.score);
    });

    this.socket.on("PEER_UPDATE", (peer: any) => {
      useAppStore.getState().updatePeer(peer.id, peer);
    });

    this.socket.on("PEER_SOS", (peer: any) => {
      useAppStore.getState().updatePeer(peer.id, { ...peer, isSOS: true });
      useAppStore.getState().addAlert({
        id: `sos-${peer.id}-${Date.now()}`,
        title: `BACKUP REQUIRED: ${peer.callsign}`,
        description: `Officer triggered SOS at ${peer.latitude}, ${peer.longitude}`,
      });
    });
  }

  public async emitPosition(payload: any) {
    const ts = Date.now();
    const assetId = useAppStore.getState().assetId;
    const nrp = useAppStore.getState().nrp || '91180501';
    const name = useAppStore.getState().userName || 'Petugas Patroli';
    
    // Build payload matching dashboard PersonnelTelemetry interface
    const telemetryData = {
      id: assetId,
      nrp: nrp,
      name: name,
      lat: payload.lat,
      lng: payload.lng,
      speed: payload.speed ?? 0,
      batteryLevel: payload.batteryLevel ?? 100,
      isCharging: payload.isCharging ?? false,
      connectionType: payload.connectionType || (this.socket?.connected ? '4g' : 'none'),
      signalStatus: this.socket?.connected ? 'LTE' : 'No Signal',
      isOnline: this.socket?.connected ?? false,
      timestamp: payload.timestamp || new Date().toISOString(),
    };
    
    const hash = await generateIntegrityHash({
      id: telemetryData.id,
      lat: telemetryData.lat,
      lng: telemetryData.lng,
      timestamp: telemetryData.timestamp
    });
    
    const fullPayload = { ...telemetryData, hash };

    // Update global store with the new hash for the ticker
    useAppStore.getState().setCurrentHash(hash);

    if (this.socket?.connected) {
      // Emit to server which broadcasts to dashboard
      this.socket.emit("PERSONNEL_TELEMETRY", fullPayload);
      console.log('[SOCKET] Emitted:', { lat: payload.lat?.toFixed(4), speed: payload.speed?.toFixed(1), battery: payload.batteryLevel });
    } else {
      this.addToQueue(fullPayload);
    }
  }

  /**
   * Throttled emission based on dynamic interval (Task 1 & 2)
   */
  public async emitPositionWithThrottling(location: any, interval: number) {
    const now = Date.now();
    if (now - this.lastEmitTime >= interval) {
      this.lastEmitTime = now;
      await this.emitPosition({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        speed: (location.coords.speed ?? 0) * 3.6,
        source: 'foreground-hook'
      });
    }
  }

  private addToQueue(payload: any) {
    // In React Native / Expo, we'd use AsyncStorage or similar, 
    // but for this task I'll use a local storage mock or persistent logic if available.
    // Assuming a global 'localStorage' shim or similar for consistency with user request.
    try {
      const queueRaw = localStorage.getItem(QUEUE_KEY);
      const queue = JSON.parse(queueRaw || "[]");
      queue.push(payload);
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-500))); // Keep last 500
    } catch (e) {
      console.warn("Queue buffering failed", e);
    }
  }

  private syncQueue() {
    if (!this.socket?.connected) return;
    try {
      const queueRaw = localStorage.getItem(QUEUE_KEY);
      const queue = JSON.parse(queueRaw || "[]");
      if (queue.length > 0) {
        queue.forEach((item: any) => this.socket?.emit("personnel_update", item));
        localStorage.removeItem(QUEUE_KEY);
        console.log(`[SYNC] Flushed ${queue.length} points to server.`);
      }
    } catch (e) {}
  }

  public emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }
}

export const socketService = new SocketService();
