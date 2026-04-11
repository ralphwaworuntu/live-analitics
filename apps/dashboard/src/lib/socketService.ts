import { io, Socket } from "socket.io-client";
import { generateIntegrityHash } from "./crypto";

const QUEUE_KEY = "sentinel_pos_queue";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class SocketService {
  private socket: Socket | null = null;
  private isConnecting: boolean = false;

  public init(token?: string): Socket | null {
    if (this.socket) return this.socket;
    if (this.isConnecting) return null;

    this.isConnecting = true;
    this.socket = io(API_URL, {
      path: "/ws/socket.io",
      auth: { token: token || "" },
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
    });

    this.socket.on("connect", () => {
      console.log("SENTINEL WS CONNECTED - Triggering Queue Sync");
      this.syncQueue();
      this.isConnecting = false;
    });

    this.socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
      this.isConnecting = false;
    });

    return this.socket;
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public async emitPosition(payload: any) {
    const ts = Date.now();
    const hash = await generateIntegrityHash({ ...payload, ts });
    const fullPayload = { ...payload, ts, hash };

    if (this.socket?.connected) {
      this.socket.emit("personnel_update", fullPayload);
    } else {
      this.addToQueue(fullPayload);
    }
  }

  private addToQueue(payload: any) {
    try {
      const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
      queue.push(payload);
      // Limit queue size to avoid localStorage bloat (e.g., 1000 points)
      if (queue.length > 1000) queue.shift();
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
      console.log(`[SENTINEL-BUFFER] Data buffered. Queue size: ${queue.length}`);
    } catch (e) {
      console.error("Failed to buffer position:", e);
    }
  }

  private syncQueue() {
    if (!this.socket?.connected) return;

    try {
      const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
      if (queue.length === 0) return;

      console.log(`[SENTINEL-SYNC] Syncing ${queue.length} points...`);
      
      // Emit each buffered point in order
      queue.forEach((item: any) => {
        this.socket?.emit("personnel_update", item);
      });

      localStorage.removeItem(QUEUE_KEY);
      console.log("[SENTINEL-SYNC] Sync complete. Queue cleared.");
    } catch (e) {
      console.error("Failed to sync queue:", e);
    }
  }
}

export const socketService = new SocketService();
