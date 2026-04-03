"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/store";

/**
 * Real-Time Engine (Socket.io/Pusher Simulator)
 * ---------------------------------------------
 * This component simulates live unit position updates from a WebSocket source.
 * It periodically updates coordinates for units in the store.
 */
export default function RealTimeProvider({ children }: { children: React.ReactNode }) {
  const updatePersonnelPosition = useAppStore((state) => state.updatePersonnelPosition);
  const personnelTracks = useAppStore((state) => state.personnelTracks);
  const isOnline = useAppStore((state) => state.isOnline);
  const syncOfflineData = useAppStore((state) => state.syncOfflineData);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Simulate periodic location updates
    timerRef.current = setInterval(() => {
      personnelTracks.forEach((track) => {
        // Only move units that are active
        const randomFactor = 0.005;
        const newLat = track.waypoints[track.waypoints.length - 1].lat + (Math.random() - 0.5) * randomFactor;
        const newLng = track.waypoints[track.waypoints.length - 1].lng + (Math.random() - 0.5) * randomFactor;
        
        updatePersonnelPosition(track.id, newLat, newLng);
      });
    }, 5000); // Update every 5 seconds

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [personnelTracks, updatePersonnelPosition]);

  // Handle Online/Offline Transition
  const lastOnlineState = useRef(isOnline);
  useEffect(() => {
    if (isOnline && !lastOnlineState.current) {
        // Backfilling / Store-and-Forward simulation
        syncOfflineData();
    }
    lastOnlineState.current = isOnline;
  }, [isOnline, syncOfflineData]);

  return <>{children}</>;
}
