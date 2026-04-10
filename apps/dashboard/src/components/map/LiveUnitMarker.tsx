"use client";

import React, { useState } from "react";
import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { cn } from "@/lib/utils";
import type { PersonnelTrack } from "@/lib/types";
import { Battery, Wifi, WifiOff, Shield } from "lucide-react";

function formatTimeAgo(isoString?: string): string {
  if (!isoString) return "—";
  const diff = Date.now() - new Date(isoString).getTime();
  if (diff < 5000) return "just now";
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

function formatDutyTime(isoString?: string): string {
  if (!isoString) return "—";
  const diff = Date.now() - new Date(isoString).getTime();
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${mins}m`;
}

interface LiveUnitMarkerProps {
  track: PersonnelTrack;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

/**
 * LiveUnitMarker — Memoized, animated marker with heading arrow, battery/signal indicator, and tactical tooltip.
 */
const LiveUnitMarker = React.memo(function LiveUnitMarker({
  track,
  isSelected,
  onSelect,
}: LiveUnitMarkerProps) {
  const [hovered, setHovered] = useState(false);

  const lastWp = track.waypoints[track.waypoints.length - 1];
  if (!lastWp) return null;

  const isSOS = track.isSOS;
  const isLowBattery = track.batteryLevel < 20;
  const heading = track.heading ?? 0;
  const isOnline = track.connectionType !== "none" && track.signalStatus !== "No Signal";

  // Color scheme
  const baseColor = isSOS
    ? "#EF4444" // Crimson Red
    : isSelected
      ? "#D4AF37" // Gold
      : "#3B82F6"; // Neon Blue

  return (
    <AdvancedMarker
      position={{ lat: lastWp.lat, lng: lastWp.lng }}
      onClick={() => onSelect(track.id)}
    >
      <div
        className="relative flex flex-col items-center cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Heading Arrow */}
        <div
          className="absolute -top-3 z-10 transition-transform duration-700"
          style={{ transform: `rotate(${heading}deg)` }}
        >
          <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
            <path d="M6 0L12 16L6 12L0 16L6 0Z" fill={baseColor} fillOpacity={0.9} />
          </svg>
        </div>

        {/* Unit Icon */}
        <div
          className={cn(
            "relative z-20 w-9 h-9 rounded-full border-2 flex items-center justify-center text-white text-[9px] font-black uppercase shadow-xl transition-all duration-300",
            isSOS && "animate-pulse shadow-[0_0_16px_rgba(239,68,68,0.8)]",
            isLowBattery && !isSOS && "shadow-[0_0_12px_rgba(239,68,68,0.6)]",
            isSelected && "scale-125 shadow-[0_0_20px_rgba(212,175,55,0.6)]",
          )}
          style={{
            backgroundColor: `${baseColor}22`,
            borderColor: baseColor,
          }}
        >
          <Shield size={14} style={{ color: baseColor }} />
          {/* Low battery pulsing glow */}
          {isLowBattery && (
            <div className="absolute inset-0 rounded-full bg-red-500/20 animate-pulse" />
          )}
        </div>

        {/* Battery & Signal Mini Indicator */}
        <div className="flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded-full bg-[#0B1B32]/90 border border-white/10 backdrop-blur-sm">
          <Battery
            size={8}
            className={cn(
              isLowBattery ? "text-red-500" : "text-emerald-400",
            )}
          />
          <span className={cn("text-[7px] font-mono font-bold", isLowBattery ? "text-red-400" : "text-slate-300")}>
            {track.batteryLevel}%
          </span>
          <div className="w-px h-2 bg-white/10" />
          {isOnline ? (
            <Wifi size={7} className="text-emerald-400" />
          ) : (
            <WifiOff size={7} className="text-red-500" />
          )}
        </div>

        {/* Unit Type Label */}
        <div
          className="mt-0.5 px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider bg-[#0B1B32]/90 border border-white/5"
          style={{ color: baseColor }}
        >
          {track.unitType} • {track.name.split(" ")[0]}
        </div>

        {/* Tactical Tooltip — shown on hover */}
        {hovered && (
          <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-[500] pointer-events-none">
            <div className="bg-[#0B1B32] border border-white/10 rounded-2xl p-4 shadow-2xl shadow-black/50 backdrop-blur-xl min-w-[220px] text-left">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-blue-400">Personnel Track</div>
                  <div className="text-sm font-black text-white uppercase italic leading-tight">{track.name}</div>
                </div>
                {isSOS && (
                  <span className="px-1.5 py-0.5 bg-red-500/20 border border-red-500/30 rounded text-[8px] font-black text-red-500 uppercase">SOS</span>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">NRP</div>
                  <div className="text-[10px] font-mono text-white font-bold">{track.nrp}</div>
                </div>
                <div>
                  <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Speed</div>
                  <div className="text-[10px] font-mono text-white font-bold">{track.speed} km/h</div>
                </div>
                <div>
                  <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Duty Time</div>
                  <div className="text-[10px] font-mono text-white font-bold">{formatDutyTime(track.dutyStartedAt)}</div>
                </div>
                <div>
                  <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Last Sync</div>
                  <div className="text-[10px] font-mono text-emerald-400 font-bold">{formatTimeAgo(track.lastSyncAt)}</div>
                </div>
              </div>

              {/* Battery Bar */}
              <div className="mt-3 flex items-center gap-2">
                <Battery size={10} className={isLowBattery ? "text-red-500" : "text-emerald-400"} />
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", isLowBattery ? "bg-red-500" : "bg-emerald-500")}
                    style={{ width: `${track.batteryLevel}%` }}
                  />
                </div>
                <span className="text-[8px] font-mono text-slate-400">{track.batteryLevel}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdvancedMarker>
  );
});

export default LiveUnitMarker;
