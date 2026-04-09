"use client";

import { useEffect, useRef } from "react";
import { useTelemetry } from "@/hooks/useTelemetry";
import { useAppStore } from "@/store";
import {
  simulateTelemetry,
} from "@/lib/telemetryService";

/**
 * PersonnelTelemetryProvider
 * 
 * Runs a background simulation loop that updates all personnelTracks
 * with realistic battery drain, speed, and signal telemetry.
 * 
 * In production this would be replaced with real Socket.IO / WebSocket
 * pushes from the mobile BEFIND app. For the dashboard demo this
 * simulates the data flows so the UI can react to alerts.
 */
export default function PersonnelTelemetryProvider() {
  const updatePersonnelTelemetry = useAppStore(state => state.updatePersonnelTelemetry);
  const selectedPersonnelId = useAppStore(state => state.selectedPersonnelId);
  const tickRef = useRef(0);
  const localUnitId = selectedPersonnelId ?? useAppStore.getState().personnelTracks[0]?.id ?? null;

  useTelemetry(localUnitId);

  useEffect(() => {
    const interval = setInterval(() => {
      tickRef.current += 1;
      const tick = tickRef.current;
      const tracks = useAppStore.getState().personnelTracks;

      // Update each personnel track with simulated telemetry
      tracks.forEach((track) => {
        if (track.id === localUnitId) {
          return;
        }

        const sim = simulateTelemetry(track.id, tick);

        updatePersonnelTelemetry(track.id, {
          batteryLevel: sim.batteryLevel,
          isCharging: sim.isCharging,
          speed: sim.speed,
          connectionType: sim.connectionType || "4g",
        });
      });
    }, 8000); // Every 8 seconds — realistic telemetry cadence

    return () => clearInterval(interval);
  }, [localUnitId, updatePersonnelTelemetry]);

  return null; // Invisible provider
}
