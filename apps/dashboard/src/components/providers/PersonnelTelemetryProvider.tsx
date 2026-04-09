"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/store";
import {
  simulateTelemetry,
  mapConnectionToSignal,
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
  const tickRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      tickRef.current += 1;
      const tick = tickRef.current;
      const tracks = useAppStore.getState().personnelTracks;

      // Update each personnel track with simulated telemetry
      tracks.forEach((track) => {
        const sim = simulateTelemetry(track.id, tick);

        updatePersonnelTelemetry(track.id, {
          batteryLevel: sim.batteryLevel,
          isCharging: sim.isCharging,
          speedKmh: sim.speedKmh,
          signalStatus: mapConnectionToSignal(sim.connectionType || "4g"),
        });
      });
    }, 8000); // Every 8 seconds — realistic telemetry cadence

    return () => clearInterval(interval);
  }, [updatePersonnelTelemetry]);

  return null; // Invisible provider
}
