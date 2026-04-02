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
} from "@/lib/types";

interface AppState {
  polres: PolresItem[];
  heatPoints: HeatPoint[];
  activities: ActivityItem[];
  selectedPolresId: string | null;
  searchQuery: string;
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
  setSearchQuery: (query: string) => void;
  setTimeRangeHours: (hours: number) => void;
  setLiveMode: (value: boolean) => void;
  setHeatmapEnabled: (value: boolean) => void;
  addAIMessage: (message: AIChatMessage) => void;
  pushNotification: (notification: Omit<AppNotification, "id" | "read" | "createdAt">) => void;
  markNotificationRead: (id: string) => void;
  triggerEmergency: (payload: Partial<EmergencyState> & { message: string; location: string }) => void;
  clearEmergency: () => void;
}

const defaultEmergency: EmergencyState = {
  active: false,
  message: null,
  location: null,
  severity: "kritis",
  timestamp: null,
};

export const useAppStore = create<AppState>((set) => ({
  polres: [],
  heatPoints: [],
  activities: mockActivities,
  selectedPolresId: null,
  searchQuery: "",
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
  setSearchQuery: (query) => set({ searchQuery: query }),
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
        message: payload.message,
        location: payload.location,
        severity: payload.severity ?? "kritis",
        timestamp: payload.timestamp ?? new Date().toISOString(),
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
}));

export function getSelectedPolres(state: AppState): PolresItem | null {
  return state.polres.find((item) => item.id === state.selectedPolresId) ?? null;
}

export function getUnreadNotificationCount(state: AppState): number {
  return state.notifications.filter((item) => !item.read).length;
}
