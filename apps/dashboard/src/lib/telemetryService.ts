"use client";

/**
 * SENTINEL Personnel Telemetry Service
 * Collects real-time device telemetry: Battery, GPS Speed, Network Info.
 * Designed to run on field officers' mobile browsers (PWA).
 */

// --- Type Definitions ---

export interface TelemetrySnapshot {
  batteryLevel: number;       // 0-100
  isCharging: boolean;
  speed: number | null;       // km/h from GPS, null if unavailable
  connectionType: string;     // "4g" | "wifi" | "3g" | "none" | "unknown"
  isOnline: boolean;
  accuracy: number | null;    // meters
  timestamp: string;
}

export interface TelemetryAlerts {
  lowBattery: boolean;        // < 15%
  highSpeed: boolean;         // > 90 km/h
  signalLost: boolean;        // navigator.onLine === false
}

// Speed threshold in km/h — triggers "HIGH SPEED" label
const SPEED_THRESHOLD_KMH = 90;
// Battery threshold — triggers warning notification
const BATTERY_THRESHOLD_PERCENT = 15;

// --- Battery API ---

interface BatteryManager extends EventTarget {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  onchargingchange: ((this: BatteryManager, ev: Event) => void) | null;
  onlevelchange: ((this: BatteryManager, ev: Event) => void) | null;
}

async function getBatteryInfo(): Promise<{ level: number; charging: boolean }> {
  try {
    if ("getBattery" in navigator) {
      const battery = await (navigator as any).getBattery() as BatteryManager;
      return {
        level: Math.round(battery.level * 100),
        charging: battery.charging,
      };
    }
  } catch {
    // Battery API not supported or blocked
  }
  return { level: -1, charging: false };
}

// --- Network Information API ---

interface NetworkInformation extends EventTarget {
  effectiveType: "slow-2g" | "2g" | "3g" | "4g";
  type?: string;
  downlink?: number;
  rtt?: number;
}

function getConnectionType(): string {
  if (typeof navigator === "undefined") return "unknown";

  if (!navigator.onLine) return "none";

  const conn = (navigator as any).connection as NetworkInformation | undefined;
  if (conn) {
    // Prefer effectiveType (4g/3g/2g)
    if (conn.effectiveType) return conn.effectiveType;
    if (conn.type) return conn.type;
  }

  return "unknown";
}

export function mapConnectionToSignal(type: string): "LTE" | "5G" | "3G" | "H+" | "No Signal" {
  switch (type) {
    case "4g": return "LTE";
    case "5g": return "5G";
    case "3g": return "3G";
    case "2g":
    case "slow-2g": return "H+";
    case "wifi": return "LTE"; // WiFi mapped to best signal
    case "none": return "No Signal";
    default: return "LTE";
  }
}

// --- Geolocation Speed ---

function getCurrentPositionAsync(options?: PositionOptions): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000,
      ...options,
    });
  });
}

/**
 * Collect a full telemetry snapshot from browser APIs.
 * Should be called periodically (every 5-10 seconds) from client components.
 */
export async function collectTelemetrySnapshot(): Promise<TelemetrySnapshot> {
  const [battery, position] = await Promise.allSettled([
    getBatteryInfo(),
    getCurrentPositionAsync(),
  ]);

  const batteryData = battery.status === "fulfilled" ? battery.value : { level: -1, charging: false };

  let speed: number | null = null;
  let accuracy: number | null = null;

  if (position.status === "fulfilled") {
    const coords = position.value.coords;
    // coords.speed is in m/s → convert to km/h
    if (coords.speed !== null && coords.speed >= 0) {
      speed = Math.round(coords.speed * 3.6);
    }
    accuracy = coords.accuracy;
  }

  const connectionType = getConnectionType();

  return {
    batteryLevel: batteryData.level,
    isCharging: batteryData.charging,
    speed,
    connectionType,
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    accuracy,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Evaluate telemetry data against operational thresholds.
 */
export function evaluateAlerts(snapshot: TelemetrySnapshot): TelemetryAlerts {
  return {
    lowBattery: snapshot.batteryLevel >= 0 && snapshot.batteryLevel < BATTERY_THRESHOLD_PERCENT,
    highSpeed: snapshot.speed !== null && snapshot.speed > SPEED_THRESHOLD_KMH,
    signalLost: !snapshot.isOnline || snapshot.connectionType === "none",
  };
}

/**
 * Subscribe to battery level changes with a callback.
 * Returns an unsubscribe function.
 */
export async function subscribeBatteryChanges(
  onLevelChange: (level: number, charging: boolean) => void
): Promise<() => void> {
  if (typeof navigator === "undefined" || !("getBattery" in navigator)) {
    return () => {};
  }

  try {
    const battery = await (navigator as any).getBattery() as BatteryManager;

    const handleChange = () => {
      onLevelChange(Math.round(battery.level * 100), battery.charging);
    };

    battery.addEventListener("levelchange", handleChange);
    battery.addEventListener("chargingchange", handleChange);

    // Fire initial value
    handleChange();

    return () => {
      battery.removeEventListener("levelchange", handleChange);
      battery.removeEventListener("chargingchange", handleChange);
    };
  } catch {
    return () => {};
  }
}

/**
 * Subscribe to network status changes.
 * Returns an unsubscribe function.
 */
export function subscribeNetworkChanges(
  onChange: (online: boolean, connectionType: string) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  const handleOnline = () => onChange(true, getConnectionType());
  const handleOffline = () => onChange(false, "none");

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  const conn = (navigator as any).connection as NetworkInformation | undefined;
  const handleConnectionChange = () => onChange(navigator.onLine, getConnectionType());
  
  if (conn) {
    conn.addEventListener?.("change", handleConnectionChange);
  }

  // Fire initial value
  onChange(navigator.onLine, getConnectionType());

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
    if (conn) {
      conn.removeEventListener?.("change", handleConnectionChange);
    }
  };
}

// --- Simulation helpers for development ---

/**
 * Generate simulated telemetry for dashboard demo mode.
 * Produces realistic-looking data with occasional alerts.
 */
export function simulateTelemetry(trackId: string, tick: number): Partial<TelemetrySnapshot> {
  const seed = trackId.charCodeAt(trackId.length - 1) + tick;
  const batteryDrain = Math.max(5, 95 - (tick * 0.3) - (seed % 20));
  const speedVariance = 30 + Math.sin(tick / 5) * 40 + (seed % 30);

  return {
    batteryLevel: Math.round(Math.max(3, Math.min(100, batteryDrain))),
    isCharging: false,
    speed: Math.round(Math.max(0, speedVariance)),
    connectionType: seed % 15 === 0 ? "none" : seed % 4 === 0 ? "3g" : "4g",
    isOnline: seed % 15 !== 0,
    timestamp: new Date().toISOString(),
  };
}

// --- Constants exports ---
export { SPEED_THRESHOLD_KMH, BATTERY_THRESHOLD_PERCENT };
