"use client";

import { create } from "zustand";

import { buildMockKpis, mockActivities } from "@/lib/mock-data";
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
  PolsekItem,
  PolicePost,
  FieldReport,
  CctvPoint,
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
  updatePersonnelPosition: (id: string, lat: number, lng: number) => void;

  // C2 & Dispatch
  activeMissions: TacticalMission[];
  dispatchMission: (mission: Omit<TacticalMission, "id" | "createdAt">) => void;
  updateMissionStatus: (id: string, status: "en-route" | "on-site" | "completed") => void;
  
  // Predictions
  predictiveMode: boolean;
  setPredictiveMode: (enabled: boolean) => void;
  predictionPoints: PredictionPoint[];
  
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

  // Multi-Agency & Citizen Integration
  bmkgOverlayEnabled: boolean;
  cctvMarkersEnabled: boolean;
  setBmkgOverlay: (enabled: boolean) => void;
  setCctvMarkers: (enabled: boolean) => void;
  cctvPoints: CctvPoint[];
  incomingPublicReport: FieldReport | null;
  triggerPublicReport: (report: FieldReport) => void;
  clearPublicReport: () => void;
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

export const useAppStore = create<AppState>((set) => ({
  polres: [],
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
     fuelStatus: 75 - (idx * 5),
     odometer: 1240 + (idx * 150),
     fuelInputShift: 15,
     health: { engine: 92, tires: 88, lastServiceKm: 1200 }
  })),

  // HARDENING
  activeShift: "pagi",
  offlineQueue: [],
  isOnline: true,

  // C2 & Dispatch
  activeMissions: [],
  predictiveMode: true,
  predictionPoints: [
    { id: 'pred-1', lat: -10.17, lng: 123.60, weight: 8, label: "Potensi Kejahatan Jalanan", confidence: 88, reasoning: "Tren mingguan menunjukkan tingginya aktivitas di jam malam." },
    { id: 'pred-2', lat: -10.15, lng: 123.63, weight: 6, label: "Kemacetan Tinggi", confidence: 72, reasoning: "Analisis historis menunjukkan bottleneck di titik ini pada jam masuk kerja." },
    { id: 'pred-3', lat: -8.50, lng: 119.88, weight: 9, label: "Risiko Laka Lantas", confidence: 91, reasoning: "Curah hujan tinggi dan volume kendaraan wisata meningkat di Labuan Bajo." },
  ],
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

  updatePersonnelPosition: (id, lat, lng) => set((state) => {
    const timestamp = new Date().toISOString();
    return {
      personnelTracks: state.personnelTracks.map(t => 
        t.id === id 
          ? { ...t, waypoints: [...t.waypoints, { lat, lng, timestamp }], odometer: t.odometer + 0.05 } 
          : t
      )
    };
  }),

  syncOfflineData: () => set({ offlineQueue: [] }),
  
  setTimeRangeHours: (hours) => set({ timeRangeHours: hours }),
  setLiveMode: (value) => set({ liveMode: value }),
  setHeatmapEnabled: (value) => set({ heatmapEnabled: value }),
  addAIMessage: (message) => set((state) => ({ aiMessages: [...state.aiMessages, message] })),
  pushNotification: (notification) => set((state) => ({
      notifications: [{ id: `notif-${Date.now()}`, read: false, createdAt: new Date().toISOString(), ...notification }, ...state.notifications],
  })),
  markNotificationRead: (id) => set((state) => ({
      notifications: state.notifications.map((n) => n.id === id ? { ...n, read: true } : n),
  })),

  setHistoryTimestamp: (timestamp) => set({ historyTimestamp: timestamp }),
  setSelectedPersonnelId: (id) => set({ selectedPersonnelId: id }),
  setPersonnelTracks: (tracks) => set({ personnelTracks: tracks }),

  dispatchMission: (mission) => set((state) => ({
     activeMissions: [...state.activeMissions, { ...mission, id: `msn-${Date.now()}`, createdAt: new Date().toISOString() }] 
  })),

  updateMissionStatus: (id, status) => set((state) => ({
    activeMissions: state.activeMissions.map(m => m.id === id ? { ...m, status } : m)
  })),

  setPredictiveMode: (enabled) => set({ predictiveMode: enabled }),
  addAuditLog: (entry) => set((state) => ({
    auditLogs: [{ ...entry, id: `audit-${Date.now()}`, timestamp: new Date().toISOString() }, ...state.auditLogs]
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
    const auditLogs = useAppStore.getState().auditLogs;
    const newEntry: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: "Sentinel-AI System",
      action: "Incoming Public Report",
      target: report.id,
      details: `Citizen report from ${report.locationName} received.`
    };
    set({ auditLogs: [newEntry, ...auditLogs] });
  },
  clearPublicReport: () => set({ incomingPublicReport: null }),
}));

export function getSelectedPolres(state: AppState): PolresItem | null {
  return state.polres.find((item) => item.id === state.selectedPolresId) ?? null;
}
