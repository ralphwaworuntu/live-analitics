export interface PersonnelTelemetry {
  batteryLevel?: number;
  isCharging?: boolean;
  speed?: number | null;
  connectionType?: string;
  signalStatus?: 'LTE' | '5G' | '3G' | 'H+' | 'No Signal';
  accuracy?: number | null;
  lat?: number;
  lng?: number;
  timestamp?: string;
}

export interface PatrolWaypoint {
  lat: number;
  lng: number;
  timestamp: string;
  speed?: number;
  heading?: number;
  accuracy?: number;
}

export type UnitType = 'MOTOR' | 'SOSIAL' | 'DALmas' | 'STRADA' | 'SPGDT' | 'PATROLI';
export type AssetHealth = 'excellent' | 'good' | 'maintenance' | 'critical';
export type CrimeStatus = 'Hijau' | 'Kuning' | 'Merah';

export interface PersonnelTrack {
  id: string;
  nrp: string;
  name: string;
  polresId: string;
  sekolId?: string;
  unitType: UnitType;
  waypoints: PatrolWaypoint[];
  fuelStatus: number;
  odometer: number;
  fuelInputShift?: number;
  isSOS?: boolean;
  health: AssetHealth;
  batteryLevel: number;
  isCharging: boolean;
  speed: number;
  connectionType: string;
  signalStatus: 'LTE' | '5G' | '3G' | 'H+' | 'No Signal';
  topSpeed: number;
  harshBrakingCount: number;
  isFakeGPS: boolean;
  isUndercover?: boolean;
  heading?: number;
  lastSyncAt?: string;
  dutyStartedAt?: string;
  isGhost?: boolean;
  lastActiveAt?: string;
  offlineSince?: string;
  lat?: number;
  lng?: number;
  accuracy?: number;
}

export interface TelemetrySnapshot {
  batteryLevel: number;
  isCharging: boolean;
  speed: number | null;
  connectionType: string;
  isOnline: boolean;
  accuracy: number | null;
  timestamp: string;
  lat?: number;
  lng?: number;
}

export interface TelemetryAlerts {
  lowBattery: boolean;
  highSpeed: boolean;
  signalLost: boolean;
}

export interface PolisiItem {
  id: string;
  name: string;
  lat: number;
  lng: number;
  crimeStatus: CrimeStatus;
  personCount?: number;
}

export interface PolicePost {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
}

export interface EmergencyState {
  active: boolean;
  lat?: number;
  lng?: number;
  message?: string;
  location?: string;
}

export interface CctvPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'Online' | 'Offline';
}

export interface ShadowHotspot {
  id: string;
  name: string;
  points: { lat: number; lng: number }[];
}

export interface FieldReport {
  id: string;
  personnelId: string;
  personnelName: string;
  lat: number;
  lng: number;
  timestamp: string;
  textReport?: string;
  batteryLevel?: number;
  isSOS?: boolean;
  isFakeGPS?: boolean;
  isUndercover?: boolean;
}

export interface DispatchMission {
  title: string;
  type: string;
  description: string;
  locationName: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'pending' | 'en-route' | 'arrived' | 'completed';
  assignedPersonnelId: string;
  unitName: string;
  targetLat: number;
  targetLng: number;
  etaMinutes: number;
}

export interface GeofenceAlert {
  unitId: string;
  message: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  level: 'info' | 'success' | 'warning' | 'error';
  timestamp?: string;
}

export interface AppNotification extends Notification {
  read?: boolean;
}