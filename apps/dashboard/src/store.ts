"use client";

import { create } from "zustand";

import { buildMockKpis, mockActivities } from "@/lib/mock-data";
import type {
  ActivityItem,
  AIChatMessage,
  AppNotification,
  EmergencyState,
  HeatPoint,
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
} from "@/lib/types";
import { mockPersonnelTracks } from "@/lib/mockPatrolData";

interface AppState {
  polres: PolresItem[];
  heatPoints: HeatPoint[];
  activities: ActivityItem[];
  selectedPolresId: string | null;
  timeRangeHours: number;
  liveMode: boolean;
  heatmapEnabled: boolean;
  kpis: KPIItem[];
  aiMessages: AIChatMessage[];
  notifications: AppNotification[];
  emergency: EmergencyState;
  hasLoadedInitialData: boolean;
  setPolresData: (items: PolresItem[]) => void;
  setHeatPoints: (items: HeatPoint[]) => void;
  setSelectedPolres: (id: string | null) => void;
  setTimeRangeHours: (hours: number) => void;
  setLiveMode: (value: boolean) => void;
  setHeatmapEnabled: (value: boolean) => void;
  addAIMessage: (message: AIChatMessage) => void;
  pushNotification: (notification: Omit<AppNotification, "id" | "read" | "createdAt">) => void;
  markNotificationRead: (id: string) => void;
  triggerEmergency: (payload: Partial<EmergencyState> & { message: string; location: string }) => void;
  clearEmergency: () => void;
  
  // History & Patrol
  historyTimestamp: number;
  selectedPersonnelId: string | null;
  personnelTracks: PersonnelTrack[];
  setHistoryTimestamp: (timestamp: number) => void;
  setSelectedPersonnelId: (id: string | null) => void;
  setPersonnelTracks: (tracks: PersonnelTrack[]) => void;

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
  heatPoints: [],
  activities: mockActivities,
  selectedPolresId: null,
  timeRangeHours: 24,
  liveMode: true,
  heatmapEnabled: true,
  kpis: buildMockKpis(null),
  aiMessages: [
    {
      id: "welcome-ai",
      role: "assistant",
      content:
        "Situasi wilayah hukum Polda NTT saat ini kondusif. Pilih polres untuk melihat ringkasan terfokus dan rekomendasi taktis.",
      references: ["[Snapshot Operasi 30/03/2026]"],
      createdAt: new Date().toISOString(),
    },
  ],
  notifications: [
    {
      id: "notif-1",
      title: "Sinkronisasi frontend aktif",
      description: "Map, AI, dan panel kini memakai konteks polres yang sama.",
      level: "info",
      createdAt: new Date().toISOString(),
      read: false,
    },
  ],
  emergency: defaultEmergency,
  hasLoadedInitialData: false,
  
  historyTimestamp: 0, // Will be set on client mount
  selectedPersonnelId: null,
  personnelTracks: mockPersonnelTracks,
  
  activeMissions: [],
  predictiveMode: false,
  predictionPoints: [
    { id: "pred-1", lat: -10.165, lng: 123.60, weight: 0.8, label: "Potensi Konflik Massa", confidence: 75, reasoning: "Histori aksi massa mingguan di titik ini." },
    { id: "pred-2", lat: -9.65, lng: 120.26, weight: 0.6, label: "Potensi Pencurian Motor", confidence: 62, reasoning: "Trend kenaikan 3B di area pemukiman padat." }
  ],
  polresAssets: [],
  auditLogs: [],
  
  osintEnabled: false,
  osintSignals: [
    { id: "sig-1", lat: -10.15, lng: 123.61, source: "X", sentiment: "negative", content: "Aksi blokade jalan di jalan negara Soe. #NTTAction", timestamp: new Date().toISOString(), viralScore: 82 },
    { id: "sig-2", lat: -8.65, lng: 121.65, source: "News", sentiment: "provocative", content: "Massa mulai berkumpul di depan kantor Bupati Ende.", timestamp: new Date().toISOString(), viralScore: 75 }
  ],

  sandboxMode: false,
  sandboxImpact: null,

  searchQuery: "",
  searchResults: [],

  setPolresData: (items) =>
    set((state) => {
      const selected = items.find((item) => item.id === state.selectedPolresId) ?? null;
      return {
        polres: items,
        hasLoadedInitialData: true,
        kpis: buildMockKpis(selected),
      };
    }),
  setHeatPoints: (items) => set({ heatPoints: items }),
  setSelectedPolres: (id) =>
    set((state) => {
      const nextSelection = state.polres.find((item) => item.id === id) ?? null;
      const nextActivities = id
        ? mockActivities.filter((activity) => activity.polresId === id)
        : mockActivities;

      return {
        selectedPolresId: id,
        activities: nextActivities.length ? nextActivities : mockActivities,
        kpis: buildMockKpis(nextSelection),
      };
    }),
  setTimeRangeHours: (hours) => set({ timeRangeHours: hours }),
  setLiveMode: (value) => set({ liveMode: value }),
  setHeatmapEnabled: (value) => set({ heatmapEnabled: value }),
  addAIMessage: (message) => set((state) => ({ aiMessages: [...state.aiMessages, message] })),
  pushNotification: (notification) =>
    set((state) => ({
      notifications: [
        {
          id: `notif-${Date.now()}`,
          read: false,
          createdAt: new Date().toISOString(),
          ...notification,
        },
        ...state.notifications,
      ],
    })),
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    })),
  triggerEmergency: (payload) =>
    set((state) => ({
      emergency: {
        active: true,
        message: payload.message || "Emergency",
        location: payload.location || "Unknown Location",
        severity: payload.severity ?? "kritis",
        timestamp: payload.timestamp ?? new Date().toISOString(),
        lat: payload.lat ?? -10.15,
        lng: payload.lng ?? 123.58,
      },
      notifications: [
        {
          id: `notif-emergency-${Date.now()}`,
          title: "Emergency broadcast",
          description: `${payload.message} • ${payload.location}`,
          level: "critical",
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...state.notifications,
      ],
    })),
  clearEmergency: () => set({ emergency: defaultEmergency }),
  setHistoryTimestamp: (timestamp) => set({ historyTimestamp: timestamp }),
  setSelectedPersonnelId: (id) => set({ selectedPersonnelId: id }),
  setPersonnelTracks: (tracks) => set({ personnelTracks: tracks }),

  dispatchMission: (mission) => set((state) => {
    const id = `msn-${Date.now()}`;
    const newMission = { ...mission, id, createdAt: new Date().toISOString() };
    const log = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: "COMMANDER-01",
      action: "MISSION_DISPATCH",
      target: mission.assignedPersonnelId,
      details: mission.description
    };
    return { 
      activeMissions: [...state.activeMissions, newMission],
      auditLogs: [log, ...state.auditLogs]
    };
  }),

  updateMissionStatus: (id, status) => set((state) => ({
    activeMissions: state.activeMissions.map(m => m.id === id ? { ...m, status } : m)
  })),

  setPredictiveMode: (enabled) => set({ predictiveMode: enabled }),

  addAuditLog: (entry) => set((state) => ({
    auditLogs: [{ ...entry, id: `audit-${Date.now()}`, timestamp: new Date().toISOString() }, ...state.auditLogs]
  })),

  // OSINT
  setOsintEnabled: (enabled) => set({ osintEnabled: enabled }),
  
  // Sandbox
  setSandboxMode: (enabled) => set({ sandboxMode: enabled }),
  calculateSandboxImpact: (polresId, shifted) => set(() => ({
    sandboxImpact: {
      resourceShift: `${shifted} Peleton ke ${polresId}`,
      coverageChange: -15,
      responseTimeChange: 5,
      riskAssesment: "Medium"
    }
  })),

  // Search
  setSearchQuery: (query) => set((state) => {
    const results: SearchResult[] = [];
    if (query.length > 1) {
       state.polres.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).forEach(p => {
         results.push({ id: p.id, type: "location", title: p.name, subtitle: `${p.island} | Polres`, lat: p.lat, lng: p.lng });
       });
       if ("brimob".includes(query.toLowerCase())) {
          results.push({ id: "brimob-1", type: "command", title: "Brimob Polda NTT", subtitle: "Siap Gerak | 2 Peleton", lat: -10.17, lng: 123.63 });
       }
    }
    return { searchQuery: query, searchResults: results };
  }),
}));

export function getSelectedPolres(state: AppState): PolresItem | null {
  return state.polres.find((item) => item.id === state.selectedPolresId) ?? null;
}

export function getUnreadNotificationCount(state: AppState): number {
  return state.notifications.filter((item) => !item.read).length;
}
