"use client";

import { useEffect, useRef } from "react";

import type { PersonnelTelemetry } from "@/lib/types";
import { useAppStore } from "@/store";

interface BatteryManager extends EventTarget {
  charging: boolean;
  level: number;
}

interface NetworkInformation extends EventTarget {
  effectiveType?: string;
  type?: string;
}

interface NavigatorWithTelemetry extends Navigator {
  connection?: NetworkInformation;
  getBattery?: () => Promise<BatteryManager>;
}

function getConnectionType(): string {
  if (typeof navigator === "undefined") {
    return "unknown";
  }

  if (!navigator.onLine) {
    return "none";
  }

  const nav = navigator as NavigatorWithTelemetry;
  return nav.connection?.effectiveType ?? nav.connection?.type ?? "unknown";
}

export function useTelemetry(unitId: string | null) {
  const telemetryRef = useRef<PersonnelTelemetry>({
    batteryLevel: 100,
    isCharging: false,
    speed: 0,
    connectionType: "unknown",
  });

  useEffect(() => {
    if (!unitId || typeof window === "undefined") {
      return;
    }

    const nav = navigator as NavigatorWithTelemetry;

    let battery: BatteryManager | null = null;
    let batteryIntervalId: number | null = null;
    let geoWatchId: number | null = null;

    const syncTelemetry = (partial: PersonnelTelemetry) => {
      telemetryRef.current = { ...telemetryRef.current, ...partial };
      useAppStore.getState().updatePersonnelTelemetry(unitId, telemetryRef.current);
    };

    const syncBattery = () => {
      if (!battery) {
        return;
      }

      syncTelemetry({
        batteryLevel: Math.round(battery.level * 100),
        isCharging: battery.charging,
      });
    };

    const syncNetwork = () => {
      const online = navigator.onLine;
      const connectionType = online ? getConnectionType() : "none";

      useAppStore.getState().setOnlineStatus(online);
      syncTelemetry({ connectionType });

    };

    if (nav.getBattery) {
      void nav.getBattery().then((resolvedBattery) => {
        battery = resolvedBattery;
        battery.addEventListener("levelchange", syncBattery);
        battery.addEventListener("chargingchange", syncBattery);
        syncBattery();
      }).catch(() => undefined);

      batteryIntervalId = window.setInterval(() => {
        syncBattery();
      }, 30000);
    }

    if (navigator.geolocation) {
      geoWatchId = navigator.geolocation.watchPosition(
        (position) => {
          const speed = position.coords.speed !== null && position.coords.speed >= 0
            ? Math.round(position.coords.speed * 3.6)
            : telemetryRef.current.speed ?? 0;

          syncTelemetry({ speed });

          useAppStore.getState().updatePersonnelPosition(
            unitId,
            position.coords.latitude,
            position.coords.longitude,
            telemetryRef.current,
          );
        },
        () => undefined,
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 15000,
        },
      );
    }

    const connection = nav.connection;
    window.addEventListener("online", syncNetwork);
    window.addEventListener("offline", syncNetwork);
    connection?.addEventListener("change", syncNetwork);
    syncNetwork();

    return () => {
      if (battery) {
        battery.removeEventListener("levelchange", syncBattery);
        battery.removeEventListener("chargingchange", syncBattery);
      }
      if (batteryIntervalId !== null) {
        window.clearInterval(batteryIntervalId);
      }
      if (geoWatchId !== null) {
        navigator.geolocation.clearWatch(geoWatchId);
      }
      window.removeEventListener("online", syncNetwork);
      window.removeEventListener("offline", syncNetwork);
      connection?.removeEventListener("change", syncNetwork);
    };
  }, [unitId]);
}
