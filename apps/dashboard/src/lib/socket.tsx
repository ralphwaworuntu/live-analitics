"use client";

import { useEffect } from "react";
import { io, Socket } from "socket.io-client";

import { useAppStore } from "@/store";

let socket: Socket | null = null;

export const initSocket = (token?: string) => {
  const socketEnabled = process.env.NEXT_PUBLIC_ENABLE_SOCKET === "true";
  if (!socketEnabled) {
    return null;
  }

  if (socket) {
    return socket;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  socket = io(apiUrl, {
    path: "/ws/socket.io",
    auth: {
      token: token || "",
    },
    transports: ["websocket"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 15000,
  });

  socket.io.on("reconnect_attempt", (attempt) => {
    console.log(`Socket reconnect attempt #${attempt}`);
  });

  return socket;
};

export function SocketProvider({
  children,
  token,
}: {
  children: React.ReactNode;
  token?: string;
}) {
  const triggerEmergency = useAppStore((state) => state.triggerEmergency);
  const pushNotification = useAppStore((state) => state.pushNotification);

  useEffect(() => {
    const currentSocket = initSocket(token);
    if (!currentSocket) {
      return;
    }

    currentSocket.on("connect", () => {
      console.log("Socket connected to SENTINEL WS Server. ID:", currentSocket.id);
    });

    currentSocket.on("disconnect", () => {
      console.log("Socket disconnected from WS Server.");
    });

    const onEmergency = (data: { message?: string; location?: string; severity?: string; timestamp?: string; lat?: number; lng?: number }) => {
      const message = data.message || "SOS PANIC BUTTON ACTIVATED";
      const location = data.location || "Lokasi Tidak Diketahui";

      triggerEmergency({
        message,
        location,
        severity: data.severity === "kritis" ? "kritis" : "tinggi",
        timestamp: data.timestamp,
        lat: data.lat,
        lng: data.lng,
      });

      pushNotification({
        title: "Emergency broadcast masuk",
        description: `${message} • ${location}`,
        level: "critical",
      });
    };

    currentSocket.on("emergency_broadcast", onEmergency);
    currentSocket.on("emergency_alert", onEmergency);
    currentSocket.on("mobile_sos", onEmergency);
    currentSocket.on("personnel_update", () => console.log("Received personnel update via WS"));
    currentSocket.on("patrol_position", () => console.log("Received patrol position via WS"));

    return () => {
      currentSocket.off("connect");
      currentSocket.off("disconnect");
      currentSocket.off("emergency_broadcast", onEmergency);
      currentSocket.off("emergency_alert", onEmergency);
      currentSocket.off("mobile_sos", onEmergency);
      currentSocket.off("personnel_update");
      currentSocket.off("patrol_position");
    };
  }, [pushNotification, token, triggerEmergency]);

  return <>{children}</>;
}
