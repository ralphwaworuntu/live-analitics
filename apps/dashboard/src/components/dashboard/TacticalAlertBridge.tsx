"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BatteryLow, Siren, TriangleAlert, WifiOff, Zap } from "lucide-react";

import { useEmergencySound } from "@/hooks/useEmergencySound";
import type { PersonnelTrack } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store";

type AlertType = "high-speed" | "battery-critical" | "lost-connection";

type TacticalAlert = {
  id: string;
  type: AlertType;
  unitId: string;
  unitName: string;
  speed?: number;
  batteryLevel?: number;
  lat: number;
  lng: number;
  createdAt: number;
};

function buildAlert(track: PersonnelTrack, type: AlertType): TacticalAlert | null {
  const lastWaypoint = track.waypoints[track.waypoints.length - 1];
  if (!lastWaypoint) {
    return null;
  }

  return {
    id: `${type}:${track.id}`,
    type,
    unitId: track.id,
    unitName: track.name,
    speed: track.speed,
    batteryLevel: track.batteryLevel,
    lat: lastWaypoint.lat,
    lng: lastWaypoint.lng,
    createdAt: Date.now(),
  };
}

export default function TacticalAlertBridge() {
  const personnelTracks = useAppStore((state) => state.personnelTracks);
  const setMapCenter = useAppStore((state) => state.setMapCenter);
  const setSelectedPersonnelId = useAppStore((state) => state.setSelectedPersonnelId);
  const activeAlertsRef = useRef<Map<string, TacticalAlert>>(new Map());
  const [alerts, setAlerts] = useState<TacticalAlert[]>([]);
  const { playTacticalBeep } = useEmergencySound();

  useEffect(() => {
    const nextAlerts = new Map<string, TacticalAlert>();
    let shouldPlayHighSpeedBeep = false;

    personnelTracks.forEach((track) => {
      const status = track.connectionType === "none" || track.signalStatus === "No Signal" ? "offline" : "online";

      const highSpeedAlert = track.speed > 80 ? buildAlert(track, "high-speed") : null;
      const batteryAlert = track.batteryLevel < 10 && !track.isCharging ? buildAlert(track, "battery-critical") : null;
      const lostConnectionAlert = status === "offline" ? buildAlert(track, "lost-connection") : null;

      [highSpeedAlert, batteryAlert, lostConnectionAlert].forEach((alert) => {
        if (!alert) {
          return;
        }

        const previous = activeAlertsRef.current.get(alert.id);
        nextAlerts.set(alert.id, previous ? { ...alert, createdAt: previous.createdAt } : alert);

        if (alert.type === "high-speed" && !previous) {
          shouldPlayHighSpeedBeep = true;
        }
      });
    });

    activeAlertsRef.current = nextAlerts;
    const frameId = window.requestAnimationFrame(() => {
      setAlerts([...nextAlerts.values()].sort((left, right) => left.createdAt - right.createdAt));
    });

    if (shouldPlayHighSpeedBeep) {
      playTacticalBeep();
    }

    return () => window.cancelAnimationFrame(frameId);
  }, [personnelTracks, playTacticalBeep]);

  const renderedAlerts = useMemo(() => alerts.slice(-4).reverse(), [alerts]);

  return (
    <div className="pointer-events-none fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-[220] flex w-[min(92vw,420px)] max-w-full flex-col gap-2 sm:gap-3">
      <AnimatePresence initial={false}>
        {renderedAlerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 72, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 96, scale: 0.96 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className={cn(
              "pointer-events-auto overflow-hidden rounded-[24px] border shadow-2xl backdrop-blur-xl",
              alert.type === "high-speed" && "border-red-500/50 bg-[linear-gradient(135deg,rgba(127,29,29,0.96),rgba(59,7,7,0.98))]",
              alert.type === "battery-critical" && "border-amber-400/30 bg-[linear-gradient(135deg,rgba(120,53,15,0.95),rgba(68,32,12,0.98))]",
              alert.type === "lost-connection" && "border-slate-500/30 bg-[linear-gradient(135deg,rgba(30,41,59,0.95),rgba(15,23,42,0.98))]",
            )}
          >
            <div className={cn("absolute inset-x-0 top-0 h-1", alert.type === "high-speed" ? "bg-red-400 animate-pulse" : alert.type === "battery-critical" ? "bg-[#D4AF37]" : "bg-slate-400")} />

            <div className="flex gap-4 p-4">
              <div className={cn(
                "mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border",
                alert.type === "high-speed" && "border-red-400/40 bg-red-500/15 text-red-200",
                alert.type === "battery-critical" && "border-[#D4AF37]/40 bg-[#D4AF37]/15 text-[#F3D97A]",
                alert.type === "lost-connection" && "border-slate-400/30 bg-slate-400/10 text-slate-200",
              )}>
                {alert.type === "high-speed" ? (
                  <div className="relative">
                    <Siren size={18} className="absolute -right-1 -top-1 text-red-300 animate-pulse" />
                    <Zap size={20} />
                  </div>
                ) : alert.type === "battery-critical" ? (
                  <BatteryLow size={20} />
                ) : (
                  <WifiOff size={20} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#D4AF37]/90">
                  {alert.type === "high-speed" ? "Pursuit Alert" : alert.type === "battery-critical" ? "Power Alert" : "Signal Alert"}
                </div>
                <p className="mt-2 text-sm font-black uppercase leading-snug text-white">
                  {alert.type === "high-speed"
                    ? `PENGEJARAN KECEPATAN TINGGI: ${alert.unitName} - ${alert.speed ?? 0} KM/JAM`
                    : alert.type === "battery-critical"
                      ? `UNIT ${alert.unitName} KRISIS DAYA (Baterai < 10%)`
                      : `UNIT ${alert.unitName} LOST CONNECTION`}
                </p>
                <div className="mt-2 flex items-center gap-2 text-[11px] font-medium text-slate-300">
                  {alert.type === "battery-critical" && (
                    <>
                      <TriangleAlert size={12} className="text-[#D4AF37]" />
                      <span>{alert.batteryLevel ?? 0}% dan tidak sedang charging</span>
                    </>
                  )}
                  {alert.type === "lost-connection" && <span>Status: offline</span>}
                  {alert.type === "high-speed" && <span>Perlu atensi operator segera</span>}
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400">
                    {alert.lat.toFixed(4)}, {alert.lng.toFixed(4)}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPersonnelId(alert.unitId);
                      setMapCenter({ lat: alert.lat, lng: alert.lng, zoom: 16 });
                    }}
                    className="rounded-xl border border-[#D4AF37]/35 bg-[#D4AF37]/15 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#F3D97A] transition-colors hover:bg-[#D4AF37]/25"
                  >
                    LIHAT POSISI
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
