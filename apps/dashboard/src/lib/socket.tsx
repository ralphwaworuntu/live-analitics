"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAppStore } from "@/store";

let socket: Socket | null = null;

export const initSocket = (token?: string) => {
  const socketEnabled = process.env.NEXT_PUBLIC_ENABLE_SOCKET === "true";
  if (!socketEnabled) return null;
  if (socket) return socket;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  socket = io(apiUrl, {
    path: "/ws/socket.io",
    auth: { token: token || "" },
    transports: ["websocket"],
    autoConnect: true,
    reconnection: true,
  });

  return socket;
};

export function SocketProvider({ children, token }: { children: React.ReactNode; token?: string }) {
  const triggerEmergency = useAppStore((state) => state.triggerEmergency);
  const pushNotification = useAppStore((state) => state.pushNotification);
  const isOnline = useAppStore((state) => state.isOnline);
  const syncOfflineData = useAppStore((state) => state.syncOfflineData);

  const prevOnline = useRef(isOnline);

  useEffect(() => {
    // SYNC LOGIC for Offline Resilience
    if (isOnline && !prevOnline.current) {
       syncOfflineData();
    }
    prevOnline.current = isOnline;
  }, [isOnline, syncOfflineData]);

  useEffect(() => {
    const currentSocket = initSocket(token);
    let timer: NodeJS.Timeout | null = null;

    if (!currentSocket) {
      // INTERNAL SIMULATION ENGINE (Hardening Phase)
      timer = setInterval(() => {
        const { personnelTracks, updatePersonnelPosition } = useAppStore.getState();
        personnelTracks.forEach((track) => {
          const randomFactor = 0.0003; // Smooth drift
          const lastPos = track.waypoints[track.waypoints.length - 1];
          const newLat = lastPos.lat + (Math.random() - 0.5) * randomFactor;
          const newLng = lastPos.lng + (Math.random() - 0.5) * randomFactor;
          updatePersonnelPosition(track.id, newLat, newLng);
        });
      }, 3000);
      return () => { if (timer) clearInterval(timer); };
    }

    currentSocket.on("connect", () => console.log("SENTINEL WS CONNECTED"));
    currentSocket.on("disconnect", () => console.log("SENTINEL WS DISCONNECTED"));

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
      currentSocket.off("connect");
      currentSocket.off("disconnect");
      currentSocket.off("emergency_broadcast");
      currentSocket.off("personnel_update");
    };
  }, [pushNotification, token, triggerEmergency]);

  return <>{children}</>;
}
