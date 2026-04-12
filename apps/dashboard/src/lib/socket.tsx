"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/store";
import { socketService } from "./socketService";

export function SocketProvider({ children, token }: { children: React.ReactNode; token?: string }) {
  const triggerEmergency = useAppStore((state) => state.triggerEmergency);
  const pushNotification = useAppStore((state) => state.pushNotification);
  const isOnline = useAppStore((state) => state.isOnline);
  const syncOfflineData = useAppStore((state) => state.syncOfflineData);

  const prevOnline = useRef(isOnline);

  useEffect(() => {
    // SYNC LOGIC for Offline Resilience (Store-based)
    if (isOnline && !prevOnline.current) {
       syncOfflineData();
    }
    prevOnline.current = isOnline;
  }, [isOnline, syncOfflineData]);

  useEffect(() => {
    const currentSocket = socketService.init(token);
    let timer: NodeJS.Timeout | null = null;

    if (!currentSocket) {
      // INTERNAL SIMULATION ENGINE (Hardening Phase)
      timer = setInterval(() => {
        const { personnelTracks, updatePersonnelPosition, updatePersonnelTelemetry } = useAppStore.getState();
        personnelTracks.forEach((track) => {
          const randomFactor = 0.0003; // Smooth drift
          const lastPos = track.waypoints[track.waypoints.length - 1];
          const newLat = lastPos.lat + (Math.random() - 0.5) * randomFactor;
          const newLng = lastPos.lng + (Math.random() - 0.5) * randomFactor;
          updatePersonnelPosition(track.id, newLat, newLng);
          
          // WAR ROOM SIMULATION: Inject telemetry for alerts
          if (track.id === "p-001") {
            updatePersonnelTelemetry(track.id, { speed: 95, connectionType: "5g" });
          } else if (track.id === "p-ttu-001") {
            updatePersonnelTelemetry(track.id, { batteryLevel: 7, isCharging: false, speed: 0, connectionType: "4g" });
          } else if (track.id === "p-002") {
            updatePersonnelTelemetry(track.id, { speed: null, connectionType: "none" });
          }
        });
      }, 3000);
      return () => { if (timer) clearInterval(timer); };
    }

    const onEmergency = (data: { message: string; [key: string]: any }) => {
      triggerEmergency({ ...data } as any);
      pushNotification({ title: "Broadcast", description: data.message, level: "critical" });
    };

    currentSocket.on("emergency_broadcast", onEmergency);
    currentSocket.on("personnel_update", (data: { id: string; lat: number; lng: number }) => {
       const { updatePersonnelPosition } = useAppStore.getState();
       updatePersonnelPosition(data.id, data.lat, data.lng);
    });

    return () => {
      if (timer) clearInterval(timer);
      currentSocket.off("emergency_broadcast");
      currentSocket.off("personnel_update");
    };
  }, [pushNotification, token, triggerEmergency]);

  return <>{children}</>;
}
