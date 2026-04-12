"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  PersonnelTrack,
  PersonnelTelemetry,
  TelemetrySnapshot,
  TelemetryAlerts,
  DispatchMission,
  GeofenceAlert,
  Notification,
  PolisiItem,
  PolicePost,
  EmergencyState,
  CctvPoint,
  ShadowHotspot,
  FieldReport,
} from "@/lib/types";

interface PersonnelPosition {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: string;
}

interface AppState {
  // Personnel tracking
  personnelTracks: PersonnelTrack[];
  selectedPersonnelId: string | null;
  selectedPersonnelPosition: PersonnelPosition | null;

  // Map state
  polres: PolisiItem[];
  selectedPolresId: string | null;
  policePosts: PolicePost[];
  mapCenter: { lat: number; lng: number; zoom?: number } | null;

  // Alerts
  geofenceAlerts: GeofenceAlert[];

  // Emergency
  emergency: EmergencyState;

  // Dispatch
  dispatchModal: { open: boolean; report?: FieldReport };
  dispatchMission: DispatchMission | null;

  // Notifications
  notifications: Notification[];

  // CCTV & Predictive
  cctvPoints: CctvPoint[];
  cctvMarkersEnabled: boolean;
  predictiveMode: boolean;
  shadowHotspots: ShadowHotspot[];

  // Active missions & routes
  activeMissions: Array<{
    id: string;
    title: string;
    targetLat: number;
    targetLng: number;
    priority: "Low" | "Medium" | "High" | "Critical";
  }>;
  activePatrolRoute: { lat: number; lng: number }[] | null;

  // Playback
  historyTimestamp: number | null;
  playbackActive: boolean;
  playbackSpeed: number;

  // Actions
  setPersonnelTracks: (tracks: PersonnelTrack[]) => void;
  setSelectedPersonnelId: (id: string | null) => void;
  setSelectedPersonnelPosition: (position: PersonnelPosition | null) => void;
  updatePersonnelPosition: (id: string, lat: number, lng: number, telemetry?: PersonnelTelemetry) => void;
  updatePersonnelTelemetry: (id: string, data: PersonnelTelemetry) => void;

  setPolres: (list: PolisiItem[]) => void;
  setSelectedPolresId: (id: string | null) => void;
  setPolicePosts: (posts: PolicePost[]) => void;
  setMapCenter: (center: { lat: number; lng: number; zoom?: number } | null) => void;

  addGeofenceAlert: (alert: GeofenceAlert) => void;
  clearGeofenceAlerts: () => void;

  setEmergency: (emergency: EmergencyState) => void;
  clearEmergency: () => void;

  setDispatchModal: (open: boolean, report?: FieldReport) => void;
  setDispatchMission: (mission: DispatchMission | null) => void;

  pushNotification: (notification: Omit<Notification, "id" | "timestamp">) => void;
  clearNotifications: () => void;

  setCctvPoints: (points: CctvPoint[]) => void;
  setCctvMarkers: (enabled: boolean) => void;
  setPredictiveMode: (enabled: boolean) => void;
  setShadowHotspots: (hotspots: ShadowHotspot[]) => void;

  setActiveMissions: (missions: AppState["activeMissions"]) => void;
  setActivePatrolRoute: (route: { lat: number; lng: number }[] | null) => void;

  setHistoryTimestamp: (timestamp: number | null) => void;
  setPlaybackActive: (active: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
}

export const getSelectedPolres = (state: AppState) =>
  state.polres.find((p) => p.id === state.selectedPolresId) ?? null;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      personnelTracks: [],
      selectedPersonnelId: null,
      selectedPersonnelPosition: null,

      polres: [],
      selectedPolresId: null,
      policePosts: [],
      mapCenter: null,

      geofenceAlerts: [],

      emergency: { active: false },

      dispatchModal: { open: false },
      dispatchMission: null,

      notifications: [],

      cctvPoints: [],
      cctvMarkersEnabled: true,
      predictiveMode: false,
      shadowHotspots: [],

      activeMissions: [],
      activePatrolRoute: null,

      historyTimestamp: null,
      playbackActive: false,
      playbackSpeed: 1,

      // Personnel tracking actions
      setPersonnelTracks: (tracks) => set({ personnelTracks: tracks }),

      setSelectedPersonnelId: (id) => set({ selectedPersonnelId: id }),

      setSelectedPersonnelPosition: (position) => set({ selectedPersonnelPosition: position }),

      updatePersonnelPosition: (id, lat, lng, telemetry) =>
        set((state) => ({
          personnelTracks: state.personnelTracks.map((track) =>
            track.id === id
              ? {
                  ...track,
                  lat,
                  lng,
                  waypoints: [
                    ...track.waypoints,
                    { lat, lng, timestamp: new Date().toISOString(), speed: telemetry?.speed, accuracy: telemetry?.accuracy },
                  ].slice(-100),
                }
              : track
          ),
          selectedPersonnelPosition:
            state.selectedPersonnelId === id
              ? { lat, lng, accuracy: telemetry?.accuracy ?? undefined, timestamp: new Date().toISOString() }
              : state.selectedPersonnelPosition,
        })),

      updatePersonnelTelemetry: (id, data) =>
        set((state) => ({
          personnelTracks: state.personnelTracks.map((track) =>
            track.id === id
              ? {
                  ...track,
                  batteryLevel: data.batteryLevel ?? track.batteryLevel,
                  isCharging: data.isCharging ?? track.isCharging,
                  speed: data.speed ?? track.speed,
                  connectionType: data.connectionType ?? track.connectionType,
                  signalStatus: data.signalStatus ?? track.signalStatus,
                  lat: data.lat ?? track.lat,
                  lng: data.lng ?? track.lng,
                  accuracy: data.accuracy ?? track.accuracy,
                }
              : track
          ),
        })),

      // Map actions
      setPolres: (list) => set({ polres: list }),
      setSelectedPolresId: (id) => set({ selectedPolresId: id }),
      setPolicePosts: (posts) => set({ policePosts: posts }),
      setMapCenter: (center) => set({ mapCenter: center }),

      // Geofence actions
      addGeofenceAlert: (alert) =>
        set((state) => ({
          geofenceAlerts: [alert, ...state.geofenceAlerts].slice(0, 50),
        })),
      clearGeofenceAlerts: () => set({ geofenceAlerts: [] }),

      // Emergency actions
      setEmergency: (emergency) => set({ emergency }),
      clearEmergency: () => set({ emergency: { active: false } }),

      // Dispatch actions
      setDispatchModal: (open, report) =>
        set({ dispatchModal: { open, report } }),
      setDispatchMission: (mission) => set({ dispatchMission: mission }),

      // Notification actions
      pushNotification: (notification) =>
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              timestamp: new Date().toISOString(),
            },
            ...state.notifications,
          ].slice(0, 100),
        })),
      clearNotifications: () => set({ notifications: [] }),

      // CCTV & Predictive actions
      setCctvPoints: (points) => set({ cctvPoints: points }),
      setCctvMarkers: (enabled) => set({ cctvMarkersEnabled: enabled }),
      setPredictiveMode: (enabled) => set({ predictiveMode: enabled }),
      setShadowHotspots: (hotspots) => set({ shadowHotspots: hotspots }),

      // Mission actions
      setActiveMissions: (missions) => set({ activeMissions: missions }),
      setActivePatrolRoute: (route) => set({ activePatrolRoute: route }),

      // Playback actions
      setHistoryTimestamp: (timestamp) => set({ historyTimestamp: timestamp }),
      setPlaybackActive: (active) => set({ playbackActive: active }),
      setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
    }),
    {
      name: "sentinel-dashboard-storage",
      partialize: (state) => ({
        selectedPolresId: state.selectedPolresId,
        cctvMarkersEnabled: state.cctvMarkersEnabled,
        predictiveMode: state.predictiveMode,
      }),
    }
  )
);
