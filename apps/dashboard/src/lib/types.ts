export type SeverityLevel = "kondusif" | "waspada" | "kontinjensi";

export interface PolresItem {
  id: string;
  name: string;
  island: string;
  lat: number;
  lng: number;
  status: SeverityLevel;
  personnel?: number;
  online?: number;
  reports24h?: number;
}

export interface HeatPoint {
  id: string;
  title: string;
  severity: "rendah" | "sedang" | "tinggi" | "kritis";
  lat: number;
  lng: number;
  weight: number;
  polresId?: string;
  timestamp?: string;
}

export interface ActivityItem {
  id: string;
  time: string;
  title: string;
  location: string;
  polresId: string;
  status: "success" | "info" | "danger" | "warning";
}

export interface KPIItem {
  id: string;
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: string;
  subtitle: string;
}

export interface AIChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  references?: string[];
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  level: "info" | "warning" | "critical";
  createdAt: string;
  read: boolean;
}

export interface EmergencyState {
  active: boolean;
  message: string | null;
  location: string | null;
  severity: "kritis" | "tinggi" | "sedang";
  timestamp: string | null;
  lat: number | null;
  lng: number | null;
}

export interface PatrolWaypoint {
  lat: number;
  lng: number;
  timestamp: string; // ISO string or simple time like "08:30"
}

export interface PersonnelTrack {
  id: string;
  nrp: string;
  name: string;
  polresId: string;
  waypoints: PatrolWaypoint[];
}
