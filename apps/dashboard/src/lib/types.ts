export type SeverityLevel = "kondusif" | "waspada" | "kontinjensi" | "kritis";

export interface PolsekItem {
  id: string;
  polresId: string;
  name: string;
  lat: number;
  lng: number;
  crimeStatus: "Merah" | "Kuning" | "Hijau";
  polygons?: number[][]; // GeoJSON simplified
}

export interface PolicePost {
  id: string;
  polresId: string;
  polsekId?: string;
  name: string;
  lat: number;
  lng: number;
  type: "Pos Polisi" | "Pos Lantas" | "Pos Pam";
}

export interface AssetHealth {
  engine: number; // 0-100
  tires: number; // 0-100
  lastServiceKm: number;
}

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
  crimeStatus?: "Merah" | "Kuning" | "Hijau";
  cases?: number;
  polsekList?: PolsekItem[];
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

export interface AIReference {
  title: string;
  snippet: string;
}

export interface AIChatAction {
  label: string;
  type: "plot-strategy" | "fly-to" | "generate-anev" | "generate-patrol";
  lat?: number;
  lng?: number;
  radius?: number;
}

export interface AIChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  references?: string[];
  referencesData?: AIReference[];
  actionBtn?: AIChatAction;
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
  unitId?: string; // Unit trigger SOS
}

export interface PatrolWaypoint {
  lat: number;
  lng: number;
  timestamp: string; 
}

export interface PatrolHotspot {
  id: string;
  lat: number;
  lng: number;
  name: string;
  lastVisitedAt?: string;
  status: "safe" | "vulnerable" | "critical";
}

export interface PatrolPlan {
  id: string;
  polresId: string;
  week: number;
  hotspots: PatrolHotspot[];
  renOpsMatch: "VALID" | "REVISI";
  analysisSummary: string;
}

export type UnitType = "R2" | "R4";

export interface PersonnelTrack {
  id: string;
  nrp: string;
  name: string;
  polresId: string;
  polsekId?: string;
  unitType: UnitType;
  waypoints: PatrolWaypoint[];
  // TACTICAL MICRO
  fuelStatus: number; // percent
  odometer: number; // km
  fuelInputShift?: number; // Liters
  isSOS?: boolean;
  health: AssetHealth;
}

export interface YoloBBox {
  label: string;
  confidence: number;
  x: number; 
  y: number;
  width: number;
  height: number;
}

export interface FieldReport {
  id: string;
  timestamp: string;
  personnelName: string;
  nrp: string;
  locationName: string;
  lat: number;
  lng: number;
  textReport: string;
  imageSrc?: string;
  yoloBoxes?: YoloBBox[];
  isSOS?: boolean;
}

export type MissionStatus = "en-route" | "on-site" | "completed";

export interface TacticalMission {
  id: string;
  title: string;
  description: string;
  status: MissionStatus;
  assignedPersonnelId: string;
  targetLat: number;
  targetLng: number;
  etaMinutes: number;
  createdAt: string;
}

export interface PredictionPoint {
  id: string;
  lat: number;
  lng: number;
  weight: number; 
  label: string;
  confidence: number; 
  reasoning: string;
  isShadow?: boolean; // New: indicates a predictive "shadow" hotspot
  radius?: number; // For circular pulse
}

export interface ShadowHotspot {
  id: string;
  center: { lat: number; lng: number };
  points: { lat: number; lng: number }[]; // Polygon points
  intensity: number;
  riskShift: string; // e.g. "Curanmor", "Laka Lantas"
  confidence: number;
}

export interface PolresAssetStrength {
  polresId: string;
  personnelReal: number;
  personnelDsp: number;
  patrolCars: number;
  emergencyLogistics: number; 
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  details: string;
}

export interface OSINTSignal {
  id: string;
  lat: number;
  lng: number;
  source: "X" | "News" | "IG";
  sentiment: "positive" | "neutral" | "negative" | "provocative";
  content: string;
  timestamp: string;
  viralScore: number; 
}

export interface SandboxImpact {
  resourceShift: string;
  coverageChange: number; 
  responseTimeChange: number; 
  riskAssesment: "Low" | "Medium" | "High";
}

export interface CctvPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: "Dishub" | "Police";
  status: "Online" | "Offline";
  url?: string;
}

export interface SearchResult {
  id: string;
  type: "personnel" | "incident" | "location" | "command" | "cctv";
  title: string;
  subtitle: string;
  lat?: number;
  lng?: number;
}
