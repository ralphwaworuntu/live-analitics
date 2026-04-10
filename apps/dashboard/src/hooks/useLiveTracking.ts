"use client";

import { useMemo, useEffect, useRef } from "react";
import { useAppStore } from "@/store";
import type { PersonnelTrack } from "@/lib/types";

import { useEmergencySound } from "@/hooks/useEmergencySound";

/**
 * Haversine formula — distance between two lat/lng points in kilometers.
 */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface NearestUnit {
  track: PersonnelTrack;
  distanceKm: number;
  etaMinutes: number; // based on avg 40 km/h
}

/**
 * useLiveTracking — Dedicated hook for the OperationsView.
 *
 * Provides personnel tracks from the store, nearest-unit calculation,
 * and automatic geofence breach detection.
 */
export function useLiveTracking() {
  const personnelTracks = useAppStore((s) => s.personnelTracks);
  const polres = useAppStore((s) => s.polres);
  const addGeofenceAlert = useAppStore((s) => s.addGeofenceAlert);
  const breachCooldown = useRef<Map<string, number>>(new Map());
  const { playVoiceWarning } = useEmergencySound();

  // --- Nearest Units ---
  const nearestUnits = useMemo(() => {
    return (lat: number, lng: number, count = 3): NearestUnit[] => {
      return personnelTracks
        .map((track) => {
          const wp = track.waypoints[track.waypoints.length - 1];
          if (!wp) return null;
          const distanceKm = haversineKm(lat, lng, wp.lat, wp.lng);
          const avgSpeed = Math.max(track.speed, 40); // at least 40 km/h
          const etaMinutes = Math.round((distanceKm / avgSpeed) * 60);
          return { track, distanceKm: Math.round(distanceKm * 10) / 10, etaMinutes };
        })
        .filter(Boolean)
        .sort((a, b) => a!.distanceKm - b!.distanceKm)
        .slice(0, count) as NearestUnit[];
    };
  }, [personnelTracks]);

  // --- Geofence Breach Detection ---
  const lastCheckTime = useRef<number>(0);

  useEffect(() => {
    const now = Date.now();
    // Only run expensive geofence checks every 2 seconds
    if (now - lastCheckTime.current < 2000) return;
    lastCheckTime.current = now;

    personnelTracks.forEach((track) => {
      const wp = track.waypoints[track.waypoints.length - 1];
      if (!wp) return;

      const assignedPolres = polres.find((p) => p.id === track.polresId);
      if (!assignedPolres) return;

      const distFromBase = haversineKm(wp.lat, wp.lng, assignedPolres.lat, assignedPolres.lng);
      const geofenceRadiusKm = 15;

      if (distFromBase > geofenceRadiusKm) {
        const cooldownKey = `${track.id}-${assignedPolres.id}`;
        const lastAlert = breachCooldown.current.get(cooldownKey) ?? 0;

        if (now - lastAlert > 60000) {
          breachCooldown.current.set(cooldownKey, now);
          addGeofenceAlert({
            unitId: track.id,
            message: `GEOFENCE BREACH: Unit ${track.name} exited ${assignedPolres.name} sector (${distFromBase.toFixed(1)}km from base).`,
            timestamp: new Date().toISOString(),
          });
          playVoiceWarning(`Peringatan Geofence. Unit ${track.name} keluar dari sektor ${assignedPolres.name}.`);
        }
      }
    });
  }, [personnelTracks, polres, addGeofenceAlert, playVoiceWarning]);

  // --- Get Track by ID ---
  const getTrackById = useMemo(() => {
    return (id: string) => personnelTracks.find((t) => t.id === id) ?? null;
  }, [personnelTracks]);

  return {
    tracks: personnelTracks,
    nearestUnits,
    getTrackById,
    haversineKm,
  };
}
