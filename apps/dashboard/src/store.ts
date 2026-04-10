"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { buildMockKpis, mockActivities, mockPolresData } from "@/lib/mock-data";
import { mapConnectionToSignal } from "@/lib/telemetryService";
import type {
  ActivityItem,
  AIChatMessage,
  AppNotification,
  EmergencyState,
  KPIItem,
  PolresItem,
  PersonnelTrack,
  TacticalMission,
  PredictionPoint,
  PolresAssetStrength,
  AuditLogEntry,
  OSINTSignal,
  SandboxImpact,
  SearchResult,
  PatrolWaypoint,
  PersonnelTelemetry,
  PolsekItem,
  PolicePost,
  FieldReport,
  CctvPoint,
  ShadowHotspot,
  HeatPoint,
  UnitType,
} from "@/lib/types";
import { mockPersonnelTracks } from "@/lib/mockPatrolData";

type ShiftType = "pagi" | "malam";

interface AppState {
  polres: PolresItem[];
  polsek: PolsekItem[];
  policePosts: PolicePost[];
  activities: ActivityItem[];
  selectedPolresId: string | null;
  selectedPolsekId: string | null;
  timeRangeHours: number;
  liveMode: boolean;
  heatmapEnabled: boolean;
  kpis: KPIItem[];
  aiMessages: AIChatMessage[];
  notifications: AppNotification[];
  emergency: EmergencyState;
  hasLoadedInitialData: boolean;
  
  setPolresData: (items: PolresItem[]) => void;
  setPolsekData: (items: PolsekItem[]) => void;
  setPolicePosts: (items: PolicePost[]) => void;
  
  setSelectedPolres: (id: string | null) => void;
  setSelectedPolsek: (id: string | null) => void;
  
  setTimeRangeHours: (hours: number) => void;
  setLiveMode: (value: boolean) => void;
  setHeatmapEnabled: (value: boolean) => void;
  addAIMessage: (message: AIChatMessage) => void;
  pushNotification: (notification: Omit<AppNotification, "id" | "read" | "createdAt">) => void;
  markNotificationRead: (id: string) => void;
  
  triggerEmergency: (payload: Partial<EmergencyState> & { message: string; location: string }) => void;
  handleSOS: (unitId: string) => void;
  clearEmergency: () => void;
  filterStatus: "all" | "SOS" | "Online" | "Offline";
  filterPriority: "all" | "Low" | "Medium" | "High" | "Critical";
  setFilterStatus: (status: "all" | "SOS" | "Online" | "Offline") => void;
  setFilterPriority: (priority: "all" | "Low" | "Medium" | "High" | "Critical") => void;
  
  // History & Patrol
  historyTimestamp: number;
  selectedPersonnelId: string | null;
  personnelTracks: PersonnelTrack[];
  setHistoryTimestamp: (timestamp: number) => void;
  setSelectedPersonnelId: (id: string | null) => void;
  setPersonnelTracks: (tracks: PersonnelTrack[]) => void;
  
  // REAL-TIME & HARDENING
  activeShift: ShiftType;
  setActiveShift: (shift: ShiftType) => void;
  offlineQueue: PatrolWaypoint[];
  isOnline: boolean;
  setOnlineStatus: (status: boolean) => void;
  syncOfflineData: () => void;
  updatePersonnelPosition: (id: string, lat: number, lng: number, telemetry?: PersonnelTelemetry) => void;
  updatePersonnelTelemetry: (id: string, data: PersonnelTelemetry) => void;

  // C2 & Dispatch
  activeMissions: TacticalMission[];
  dispatchMission: (mission: Omit<TacticalMission, "id" | "createdAt">) => void;
  updateMissionStatus: (id: string, status: "en-route" | "on-site" | "completed") => void;
  
  // Predictions
  predictiveMode: boolean;
  setPredictiveMode: (enabled: boolean) => void;
  predictionPoints: PredictionPoint[];
  shadowHotspots: ShadowHotspot[];
  
  // Tactical Dispatch
  activePatrolRoute: { lat: number; lng: number }[] | null;
  setPatrolRoute: (route: { lat: number; lng: number }[] | null) => void;
  
  dispatchModalOpen: boolean;
  selectedIncident: FieldReport | null; // Incident for dispatch
  setDispatchModal: (open: boolean, incident?: FieldReport | null) => void;
  
  // Logistics & Assets
  polresAssets: PolresAssetStrength[];
  auditLogs: AuditLogEntry[];
  addAuditLog: (entry: Omit<AuditLogEntry, "id" | "timestamp">) => void;
  
  // OSINT
  osintEnabled: boolean;
  setOsintEnabled: (enabled: boolean) => void;
  osintSignals: OSINTSignal[];
  
  // Tactical Sandbox
  sandboxMode: boolean;
  setSandboxMode: (enabled: boolean) => void;
  sandboxImpact: SandboxImpact | null;
  calculateSandboxImpact: (polresId: string, personnelShifted: number) => void;

  // Global Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: SearchResult[];

  // Map Tracking & Focus
  mapCenter: { lat: number; lng: number; zoom?: number } | null;
  setMapCenter: (center: { lat: number; lng: number; zoom?: number } | null) => void;
  heatPoints: HeatPoint[];
  setHeatPoints: (points: HeatPoint[]) => void;

  // Multi-Agency & Citizen Integration
  bmkgOverlayEnabled: boolean;
  cctvMarkersEnabled: boolean;
  setBmkgOverlay: (enabled: boolean) => void;
  setCctvMarkers: (enabled: boolean) => void;
  cctvPoints: CctvPoint[];
  incomingPublicReport: FieldReport | null;
  triggerPublicReport: (report: FieldReport) => void;
  clearPublicReport: () => void;

  // PLAYBACK ENGINE
  playbackActive: boolean;
  playbackSpeed: number;
  setPlaybackActive: (active: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;

  // GEOFENCE
  geofenceAlerts: { unitId: string; message: string; timestamp: string }[];
  addGeofenceAlert: (alert: { unitId: string; message: string; timestamp: string }) => void;

  // MAP LAYERS (Operations View)
  mapTypeId: "roadmap" | "satellite" | "hybrid";
  setMapTypeId: (id: "roadmap" | "satellite" | "hybrid") => void;
  trafficLayerEnabled: boolean;
  setTrafficLayer: (enabled: boolean) => void;
  // GLOBAL ACTIONS & UI STATE
  isSettingsOpen: boolean;
  isNotificationsOpen: boolean;
  toggleSettings: (open?: boolean) => void;
  toggleNotifications: (open?: boolean) => void;
  executeAction: (actionType: string, payload?: Record<string, unknown>) => void;
  clearOperationalData: () => void;
}

const defaultEmergency: EmergencyState = {
  active: false,
  message: null,
  location: null,
  severity: "kritis",
  timestamp: null,
  lat: null,
  lng: null,
};

function buildTelemetryUpdates(track: PersonnelTrack, data: PersonnelTelemetry): Partial<PersonnelTrack> {
  const updates: Partial<PersonnelTrack> = {};

  if (data.batteryLevel !== undefined && data.batteryLevel >= 0) {
    updates.batteryLevel = Math.round(Math.max(0, Math.min(100, data.batteryLevel)));
  }

  if (data.isCharging !== undefined) {
    updates.isCharging = data.isCharging;
  }

  if (data.speed !== undefined && data.speed !== null) {
    const normalizedSpeed = Math.max(0, Math.round(data.speed));
    updates.speed = normalizedSpeed;
    updates.topSpeed = Math.max(track.topSpeed, normalizedSpeed);
  }

  if (data.connectionType !== undefined) {
    updates.connectionType = data.connectionType;
    updates.signalStatus = mapConnectionToSignal(data.connectionType);
  }

  return updates;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
  polres: mockPolresData,
  polsek: [],
  policePosts: [
    { id: 'post-1', polresId: 'p-001', name: "Pos Polisi Pelabuhan", lat: -10.158, lng: 123.606, type: "Pos Polisi" },
    { id: 'post-2', polresId: 'p-001', name: "Pos Polisi Terminal", lat: -10.165, lng: 123.61, type: "Pos Polisi" },
    { id: 'post-3', polresId: 'p-002', name: "Pos Pam Motaain", lat: -9.15, lng: 124.9, type: "Pos Pam" },
  ],
  activities: mockActivities,
  selectedPolresId: null,
  selectedPolsekId: null,
  timeRangeHours: 24,
  liveMode: true,
  heatmapEnabled: true,
  kpis: buildMockKpis(null),
  aiMessages: [
    {
      id: "welcome-ai",
      role: "assistant",
      content: "Sentinel-AI Tactical Active. Memantau Hierarchy Polsek & Audit Aset secara real-time.",
      createdAt: new Date().toISOString(),
    },
  ],
  notifications: [],
  emergency: defaultEmergency,
  hasLoadedInitialData: false,
  
  historyTimestamp: 0,
  selectedPersonnelId: null,
  personnelTracks: mockPersonnelTracks.map((t, idx) => ({
     ...t,
     unitType: t.unitType as UnitType,
     fuelStatus: 75 - (idx * 5),
     odometer: 1240 + (idx * 150),
     fuelInputShift: 15,
     health: { engine: 92, tires: 88, lastServiceKm: 1200 },
     batteryLevel: 85 - (idx * 12),
     isCharging: idx === 0,
     speed: 18 + (idx * 8),
     connectionType: idx % 2 === 0 ? "4g" : "5g",
     signalStatus: idx % 2 === 0 ? "LTE" : "5G",
     topSpeed: 45 + (idx * 10),
     harshBrakingCount: idx === 1 ? 3 : 0,
     isFakeGPS: idx === 2
  })) as PersonnelTrack[],

  // HARDENING
  activeShift: "pagi",
  offlineQueue: [],
  isOnline: true,

  // C2 & Dispatch
  activeMissions: [],
  predictiveMode: true,
  predictionPoints: [
    { id: 'pred-1', lat: -10.170, lng: 123.600, weight: 8, label: "Potensi Kejahatan Jalanan", confidence: 88, reasoning: "Tren mingguan menunjukkan tingginya aktivitas di jam malam." },
    { id: 'pred-2', lat: -10.150, lng: 123.630, weight: 6, label: "Kemacetan Tinggi", confidence: 72, reasoning: "Analisis historis menunjukkan bottleneck di titik ini pada jam masuk kerja." },
    { id: 'pred-3', lat: -8.500, lng: 119.880, weight: 9, label: "Risiko Laka Lantas", confidence: 91, reasoning: "Curah hujan tinggi dan volume kendaraan wisata meningkat di Labuan Bajo." },
  ],
  shadowHotspots: [
    { 
      id: 'shadow-1', 
      center: { lat: -10.165, lng: 123.605 }, 
      riskShift: "Curanmor", 
      confidence: 94, 
      intensity: 0.7,
      points: [
        { lat: -10.160, lng: 123.600 },
        { lat: -10.160, lng: 123.610 },
        { lat: -10.170, lng: 123.610 },
        { lat: -10.170, lng: 123.600 }
      ] 
    },
    { 
      id: 'shadow-2', 
      center: { lat: -10.145, lng: 123.625 }, 
      riskShift: "High Occupancy", 
      confidence: 82, 
      intensity: 0.5,
      points: [
        { lat: -10.140, lng: 123.620 },
        { lat: -10.140, lng: 123.630 },
        { lat: -10.150, lng: 123.630 },
        { lat: -10.150, lng: 123.620 }
      ] 
    },
  ],
  activePatrolRoute: null,
  dispatchModalOpen: false,
  selectedIncident: null,

  polresAssets: [],
  auditLogs: [],
  osintEnabled: false,
  osintSignals: [],
  sandboxMode: false,
  sandboxImpact: null,
  searchQuery: "",
  searchResults: [],

  // ACTIONS
  setActiveShift: (shift) => set({ activeShift: shift }),
  setOnlineStatus: (status) => set({ isOnline: status }),
  
  setPolresData: (items) => set({ polres: items, hasLoadedInitialData: true }),
  setPolsekData: (items) => set({ polsek: items }),
  setPolicePosts: (items) => set({ policePosts: items }),

  setSelectedPolres: (id) => set((state) => {
    const nextSelection = state.polres.find((item) => item.id === id) ?? null;
    return {
      selectedPolresId: id,
      selectedPolsekId: null,
      kpis: buildMockKpis(nextSelection),
    };
  }),

  setSelectedPolsek: (id) => set({ selectedPolsekId: id }),

  triggerEmergency: (payload) => set(() => ({
      emergency: {
        active: true,
        message: payload.message || "Emergency",
        location: payload.location || "Unknown Location",
        severity: payload.severity ?? "kritis",
        timestamp: payload.timestamp ?? new Date().toISOString(),
        lat: payload.lat ?? -10.15,
        lng: payload.lng ?? 123.58,
        unitId: payload.unitId
      },
  })),

  handleSOS: (unitId) => set((state) => {
     const unit = state.personnelTracks.find(t => t.id === unitId);
     const lastPos = unit?.waypoints[unit.waypoints.length - 1];
     
     return {
       emergency: {
         active: true,
         message: `UNIT MEMBUTUHKAN BANTUAN SEGERA`,
         location: unit?.polresId || "Unknown",
         severity: "kritis",
         timestamp: new Date().toISOString(),
         lat: lastPos?.lat ?? -10.15,
         lng: lastPos?.lng ?? 123.58,
         unitId
       },
       notifications: [{
         id: `sos-${Date.now()}`,
         title: "SOS ALERT",
         description: `Unit ${unitId} (${unit?.name}) memicu SOS!`,
         level: "critical",
         createdAt: new Date().toISOString(),
         read: false
       }, ...state.notifications]
     };
  }),

  clearEmergency: () => set({ emergency: defaultEmergency }),

  updatePersonnelPosition: (id, lat, lng, telemetry) => set((state) => {
    const timestamp = new Date().toISOString();
    return {
      personnelTracks: state.personnelTracks.map(t => {
        if (t.id !== id) return t;
        // Compute heading from previous → new position
        const prevWp = t.waypoints[t.waypoints.length - 1];
        let heading = t.heading ?? 0;
        if (prevWp) {
          const dLng = lng - prevWp.lng;
          const dLat = lat - prevWp.lat;
          if (Math.abs(dLng) > 0.000001 || Math.abs(dLat) > 0.000001) {
            heading = (Math.atan2(dLng, dLat) * 180 / Math.PI + 360) % 360;
          }
        }
        return {
          ...t,
          ...buildTelemetryUpdates(t, telemetry ?? {}),
          waypoints: [...t.waypoints.slice(-100), { lat, lng, timestamp }],
          odometer: t.odometer + 0.05,
          heading,
          lastSyncAt: timestamp,
          dutyStartedAt: t.dutyStartedAt || timestamp,
        };
      })
    };
  }),

  updatePersonnelTelemetry: (id, data) => {
    const state = get();
    const track = state.personnelTracks.find(t => t.id === id);
    if (!track) return;

    const updates = buildTelemetryUpdates(track, data);

    // Battery update
    if (data.batteryLevel !== undefined && data.batteryLevel >= 0) {
      // Smart alert: low battery < 15%
      if (data.batteryLevel < 15 && track.batteryLevel >= 15) {
        get().pushNotification({
          title: "⚡ Baterai Kritis",
          description: `Unit ${track.name} (${track.nrp}) — baterai ${data.batteryLevel}%. Perintahkan kembali ke pos untuk pengisian daya.`,
          level: "warning",
        });
        get().addAuditLog({
          actor: "Sentinel-AI Telemetry",
          action: "LOW_BATTERY_ALERT",
          target: `${track.name} (${track.id})`,
          details: `Baterai unit turun ke ${data.batteryLevel}%. Status: ${data.isCharging ? 'Charging' : 'Discharging'}.`,
        });
      }
    }

    // Speed update
    if (data.speed !== undefined && data.speed !== null && data.speed > 90 && track.speed <= 90) {
      get().pushNotification({
        title: "High Speed Pursuit",
        description: `Unit ${track.name} (${track.nrp}) melaju ${Math.round(data.speed)} km/jam.`,
        level: "critical",
      });
      get().addAuditLog({
        actor: "Sentinel-AI Telemetry",
        action: "HIGH_SPEED_PURSUIT",
        target: `${track.name} (${track.id})`,
        details: `Kecepatan unit mencapai ${Math.round(data.speed)} km/jam.`,
      });
    }

    // Signal update
    if (data.connectionType !== undefined) {
      // Smart alert: signal lost
      const nextSignalStatus = mapConnectionToSignal(data.connectionType);
      if (nextSignalStatus === "No Signal" && track.signalStatus !== "No Signal") {
        get().pushNotification({
          title: "📡 Sinyal Hilang",
          description: `Unit ${track.name} (${track.nrp}) kehilangan sinyal. Status diubah ke SIGNAL LOST.`,
          level: "critical",
        });
        get().addAuditLog({
          actor: "Sentinel-AI Telemetry",
          action: `UNIT ${track.id} LOST CONNECTION`,
          target: `${track.name} (${track.id})`,
          details: `Koneksi terputus. Jaringan terakhir: ${track.connectionType || track.signalStatus}.`,
        });
      }
    }

    set({
      personnelTracks: state.personnelTracks.map(t =>
        t.id === id ? { ...t, ...updates } : t
      ),
    });
  },

  syncOfflineData: () => set({ offlineQueue: [] }),
  
  setTimeRangeHours: (hours) => set({ timeRangeHours: hours }),
  setLiveMode: (value) => set({ liveMode: value }),
  setHeatmapEnabled: (value) => set({ heatmapEnabled: value }),
  addAIMessage: (message) => set((state) => ({ aiMessages: [...state.aiMessages, message] })),
  pushNotification: (notification) => set((state) => ({
      notifications: [{ 
        id: typeof crypto !== 'undefined' && crypto.randomUUID 
            ? `notif-${crypto.randomUUID()}` 
            : `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, 
        read: false, 
        createdAt: new Date().toISOString(), 
        ...notification 
      }, ...state.notifications],
  })),
  markNotificationRead: (id) => set((state) => ({
      notifications: state.notifications.map((n) => n.id === id ? { ...n, read: true } : n),
  })),

  setHistoryTimestamp: (timestamp) => set({ historyTimestamp: timestamp }),
  setSelectedPersonnelId: (id) => set({ selectedPersonnelId: id }),
  setPersonnelTracks: (tracks) => set({ personnelTracks: tracks }),

  dispatchMission: (mission) => set((state) => ({
     activeMissions: [...state.activeMissions, { 
       ...mission, 
       id: typeof crypto !== 'undefined' && crypto.randomUUID 
           ? `msn-${crypto.randomUUID()}` 
           : `msn-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, 
       createdAt: new Date().toISOString() 
     }] 
  })),

  updateMissionStatus: (id, status) => set((state) => ({
    activeMissions: state.activeMissions.map(m => m.id === id ? { ...m, status } : m)
  })),

  setPredictiveMode: (enabled) => set({ predictiveMode: enabled }),
  setPatrolRoute: (route) => set({ activePatrolRoute: route }),
  setDispatchModal: (open, incident) => set({ dispatchModalOpen: open, selectedIncident: incident || null }),
  addAuditLog: (entry) => set((state) => ({
    auditLogs: [{ 
      ...entry, 
      id: typeof crypto !== 'undefined' && crypto.randomUUID 
          ? `audit-${crypto.randomUUID()}` 
          : `audit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, 
      timestamp: new Date().toISOString() 
    }, ...state.auditLogs]
  })),
  setOsintEnabled: (enabled) => set({ osintEnabled: enabled }),
  setSandboxMode: (enabled) => set({ sandboxMode: enabled }),
  calculateSandboxImpact: (polresId, shifted) => set({
    sandboxImpact: { resourceShift: `${shifted} Peleton ke ${polresId}`, coverageChange: -15, responseTimeChange: 5, riskAssesment: "Medium" }
  }),

  setSearchQuery: (query) => set((state) => {
    const results: SearchResult[] = [];
    if (query.length > 1) {
       state.polres.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).forEach(p => {
         results.push({ id: p.id, type: "location", title: p.name, subtitle: `${p.island} | Polres`, lat: p.lat, lng: p.lng });
       });
    }
    return { searchQuery: query, searchResults: results };
  }),

  // Map Focus
  mapCenter: null,
  setMapCenter: (center) => set({ mapCenter: center }),
  heatPoints: [],
  setHeatPoints: (points) => set({ heatPoints: points }),

  // Multi-Agency & Citizen
  bmkgOverlayEnabled: false,
  cctvMarkersEnabled: true,
  setBmkgOverlay: (enabled) => set({ bmkgOverlayEnabled: enabled }),
  setCctvMarkers: (enabled) => set({ cctvMarkersEnabled: enabled }),
  cctvPoints: [
    { id: 'cam-01', name: "Simpang El Tari", lat: -10.165, lng: 123.605, type: 'Dishub', status: 'Online' },
    { id: 'cam-02', name: "Bundaran TI", lat: -10.158, lng: 123.606, type: 'Police', status: 'Online' },
    { id: 'cam-03', name: "Lippo Mall Area", lat: -10.150, lng: 123.615, type: 'Dishub', status: 'Offline' },
  ],
  incomingPublicReport: null,
  triggerPublicReport: (report) => {
    set({ incomingPublicReport: report, mapCenter: { lat: report.lat, lng: report.lng, zoom: 17 } });
    // Add to audit trail
    get().addAuditLog({
      actor: "Sentinel-AI System",
      action: "Incoming Public Report",
      target: report.id,
      details: `Citizen report from ${report.locationName} received.`
    });
  },
  clearPublicReport: () => set({ incomingPublicReport: null }),

  playbackActive: false,
  playbackSpeed: 1,
  setPlaybackActive: (active) => set({ playbackActive: active }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

  geofenceAlerts: [],
  addGeofenceAlert: (alert) => set((state) => ({ 
    geofenceAlerts: [alert, ...state.geofenceAlerts].slice(0, 50) 
  })),

  mapTypeId: "roadmap",
  setMapTypeId: (id) => set({ mapTypeId: id }),
  trafficLayerEnabled: false,
  setTrafficLayer: (enabled) => set({ trafficLayerEnabled: enabled }),

  filterStatus: "all",
  filterPriority: "all",
  setFilterStatus: (status) => set({ filterStatus: status }),
  setFilterPriority: (priority) => set({ filterPriority: priority }),
  isSettingsOpen: false,
  isNotificationsOpen: false,
  toggleSettings: (open) => set((state) => ({ isSettingsOpen: open ?? !state.isSettingsOpen })),
  toggleNotifications: (open) => set((state) => ({ isNotificationsOpen: open ?? !state.isNotificationsOpen })),

  executeAction: (actionType, payload) => {
    let title = "Action Executed";
    let description = `Aksi ${actionType} berhasil dijalankan.`;
    let level: "info" | "success" | "warning" | "critical" = "info";

    switch (actionType) {
      case "DISPATCH_MISSION":
        title = "Tactical Dispatch";
        description = `Unit ${payload?.unitName || 'Unknown'} telah dikerahkan ke lokasi ${payload?.locationName || 'Target'}.`;
        level = "success";
        break;
      case "EXPORT_ANEV":
        title = "Export ANEV Success";
        description = `Dokumen ANEV operasional periode ${new Date().toLocaleDateString()} telah diekspor.`;
        level = "success";
        break;
      default:
        break;
    }

    get().pushNotification({
      title,
      description,
      level,
    });

    get().addAuditLog({
      actor: "Irjen Pol. Daniel T.M. Silitonga",
      action: actionType,
      target: payload?.id ? String(payload.id) : "Global Dashboard",
      details: description
    });
  },

  clearOperationalData: () => {
    set({
      activeMissions: [],
      notifications: [],
      aiMessages: [],
      auditLogs: [],
      emergency: defaultEmergency,
    });
    localStorage.removeItem("sentinel-tactical-storage");

    get().pushNotification({
      title: "Security Clearing Success",
      description: "Seluruh data operasional dan riwayat log telah dihapus dari terminal.",
      level: "critical"
    });
  },
    }),
    {
      name: "sentinel-tactical-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeMissions: state.activeMissions,
        auditLogs: state.auditLogs,
        notifications: state.notifications,
        activeShift: state.activeShift,
        mapTypeId: state.mapTypeId,
        trafficLayerEnabled: state.trafficLayerEnabled,
        filterStatus: state.filterStatus,
        filterPriority: state.filterPriority,
        timeRangeHours: state.timeRangeHours,
        sandboxMode: state.sandboxMode,
        osintEnabled: state.osintEnabled,
        heatmapEnabled: state.heatmapEnabled,
      }),
    }
  )
);

export function getSelectedPolres(state: AppState): PolresItem | null {
  return state.polres.find((item) => item.id === state.selectedPolresId) ?? null;
}
