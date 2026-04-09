"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Battery,
  BatteryCharging,
  BatteryLow,
  ChevronRight,
  MapPin,
  Shield,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";

import type { PersonnelTrack, PolresItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store";

interface PolresCardProps {
  polres: PolresItem;
  onClick: () => void;
}

function getLeadTelemetry(tracks: PersonnelTrack[]) {
  if (tracks.length === 0) {
    return null;
  }

  return [...tracks].sort((left, right) => {
    const leftScore = (left.signalStatus === "No Signal" ? 200 : 0) + (left.batteryLevel < 15 ? 100 : 0) + left.speed;
    const rightScore = (right.signalStatus === "No Signal" ? 200 : 0) + (right.batteryLevel < 15 ? 100 : 0) + right.speed;
    return rightScore - leftScore;
  })[0];
}

export default function PolresCard({ polres, onClick }: PolresCardProps) {
  const personnelTracks = useAppStore((state) => state.personnelTracks);

  const telemetry = useMemo(() => {
    const tracks = personnelTracks.filter((track) => track.polresId === polres.id);
    const leadTrack = getLeadTelemetry(tracks);
    const maxSpeed = tracks.reduce((highest, track) => Math.max(highest, track.speed), 0);
    const minBattery = tracks.reduce((lowest, track) => Math.min(lowest, track.batteryLevel), 100);
    const hasChargingUnit = tracks.some((track) => track.isCharging);
    const hasSignalLoss = tracks.some((track) => track.signalStatus === "No Signal" || track.connectionType === "none");

    return {
      leadTrack,
      maxSpeed,
      minBattery: tracks.length > 0 ? minBattery : 0,
      hasChargingUnit,
      hasSignalLoss,
    };
  }, [personnelTracks, polres.id]);

  const batteryLevel = telemetry.leadTrack?.batteryLevel ?? telemetry.minBattery;
  const batteryIcon = telemetry.hasChargingUnit
    ? <BatteryCharging size={12} />
    : batteryLevel < 15
      ? <BatteryLow size={12} />
      : <Battery size={12} />;
  const batteryTone = telemetry.hasChargingUnit
    ? "border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37]"
    : batteryLevel < 15
      ? "border-red-500/40 bg-red-500/10 text-red-400 animate-pulse"
      : "border-white/10 bg-white/5 text-slate-300";
  const signalTone = telemetry.hasSignalLoss
    ? "border-slate-500/30 bg-slate-500/10 text-slate-300"
    : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative group cursor-pointer overflow-hidden rounded-[24px] border bg-[#0B1B32] p-6 transition-all duration-300",
        polres.status === "kritis"
          ? "border-red-500/40 shadow-[0_20px_40px_-15px_rgba(239,68,68,0.2)]"
          : "border-white/5 shadow-xl hover:border-white/20",
        telemetry.hasSignalLoss && "grayscale-[0.55] opacity-80",
      )}
    >
      {polres.status === "kritis" && (
        <div className="absolute left-0 top-0 h-1 w-full overflow-hidden bg-red-500 animate-pulse">
          <div className="h-full w-full animate-[slide_1.5s_infinite] bg-white/30" />
        </div>
      )}

      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "rounded-2xl p-3 transition-all duration-500",
              polres.status === "kritis"
                ? "scale-110 bg-red-500/10 text-red-500"
                : "bg-white/5 text-slate-500 group-hover:bg-[#D4AF37]/10 group-hover:text-[#D4AF37]",
            )}
          >
            {polres.status === "kritis" ? <AlertTriangle size={22} /> : <Shield size={22} />}
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-tight text-white transition-colors group-hover:text-[#D4AF37]">
              {polres.name}
            </h4>
            <span className="font-mono text-[10px] font-bold tracking-widest text-slate-500">
              {polres.id.toUpperCase()}
            </span>
          </div>
        </div>
        <Badge variant={polres.status === "kritis" ? "destructive" : polres.status === "waspada" ? "warning" : "success"}>
          {polres.status.toUpperCase()}
        </Badge>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-slate-500" />
            <span className="text-[10px] font-black uppercase tracking-widest italic text-slate-400">
              Kekuatan Personil
            </span>
          </div>
          <span className="font-mono text-[12px] font-black text-white">
            {polres.online || 0} <span className="text-slate-600">/</span> {polres.personnel || 0}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/5 p-[1px]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((polres.online || 0) / (polres.personnel || 1)) * 100}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full",
              polres.status === "kritis"
                ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                : "bg-gradient-to-r from-[#D4AF37] to-[#F1C40F]",
            )}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest", batteryTone)}>
          {batteryIcon}
          <span>{batteryLevel}%</span>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-blue-300">
          <span>⚡ {telemetry.maxSpeed} km/jam</span>
        </div>

        <div className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest", signalTone)}>
          {telemetry.hasSignalLoss ? <WifiOff size={12} /> : <Wifi size={12} />}
          <span>{telemetry.hasSignalLoss ? "Connection Lost" : (telemetry.leadTrack?.connectionType ?? "online").toUpperCase()}</span>
        </div>
      </div>

      {telemetry.leadTrack && (
        <div className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
          Focus unit: <span className="text-slate-300">{telemetry.leadTrack.name}</span>
        </div>
      )}

      <div className="mt-8 -mx-6 flex items-center justify-between border-t border-white/5 px-6 pt-5 transition-all group-hover:bg-white/[0.03]">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-[#D4AF37]" />
          <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">
            Sektor {polres.island}
          </span>
        </div>
        <div className="flex translate-x-4 items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#D4AF37] opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
          Dispatch
          <ChevronRight size={14} />
        </div>
      </div>
    </motion.div>
  );
}

function Badge({
  children,
  variant = "info",
}: {
  children: ReactNode;
  variant?: "success" | "warning" | "destructive" | "info";
}) {
  const styles = {
    success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
    warning: "border-yellow-500/20 bg-yellow-500/10 text-yellow-500",
    destructive: "border-red-500/20 bg-red-500/10 text-red-500 animate-pulse",
    info: "border-blue-500/20 bg-blue-500/10 text-blue-500",
  };

  return (
    <span className={cn("rounded border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest", styles[variant])}>
      {children}
    </span>
  );
}
