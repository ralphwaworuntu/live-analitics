"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store";
import { 
  Compass, 
  MapPin, 
  Target, 
  Signal, 
  Battery, 
  Navigation,
  Clock,
  AlertTriangle
} from "lucide-react";

interface TacticalCompassProps {
  personnelName?: string;
}

export function TacticalCompass({ personnelName }: TacticalCompassProps) {
  const selectedPersonnelId = useAppStore((s) => s.selectedPersonnelId);
  const personnelTracks = useAppStore((s) => s.personnelTracks);
  const selectedPosition = useAppStore((s) => s.selectedPersonnelPosition);
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [heading, setHeading] = useState(0);

  const selectedTrack = personnelTracks.find((t) => t.id === selectedPersonnelId);
  
  const lat = selectedPosition?.lat ?? selectedTrack?.lat;
  const lng = selectedPosition?.lng ?? selectedTrack?.lng;
  const accuracy = selectedPosition?.accuracy ?? selectedTrack?.accuracy;
  const speed = selectedTrack?.speed;
  const batteryLevel = selectedTrack?.batteryLevel;
  const signalStatus = selectedTrack?.signalStatus;
  const isCharging = selectedTrack?.isCharging;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      setHeading((prev) => (prev + Math.random() * 2 - 1) % 360);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCoordinate = (value: number | undefined, type: "lat" | "lng") => {
    if (value === undefined || value === null) return "---.------";
    const direction = type === "lat" ? (value >= 0 ? "S" : "N") : value >= 0 ? "E" : "W";
    const abs = Math.abs(value);
    return `${abs.toFixed(6)}° ${direction}`;
  };

  const formatAccuracy = (acc: number | undefined) => {
    if (acc === undefined || acc === null) return "---";
    if (acc < 10) return `${acc.toFixed(1)}m EXCELLENT`;
    if (acc < 50) return `${acc.toFixed(1)}m GOOD`;
    if (acc < 100) return `${acc.toFixed(1)}m FAIR`;
    return `${acc.toFixed(1)}m POOR`;
  };

  const getAccuracyColor = (acc: number | undefined) => {
    if (acc === undefined || acc === null) return "text-slate-500";
    if (acc < 10) return "text-emerald-400";
    if (acc < 50) return "text-blue-400";
    if (acc < 100) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="h-full w-full bg-[#07111F] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-px h-full bg-[#D4AF37]/30" />
        <div className="absolute top-0 left-1/2 w-px h-full bg-[#D4AF37]/30" />
        <div className="absolute top-0 left-3/4 w-px h-full bg-[#D4AF37]/30" />
        <div className="absolute top-1/4 left-0 w-full h-px bg-[#D4AF37]/30" />
        <div className="absolute top-1/2 left-0 w-full h-px bg-[#D4AF37]/30" />
        <div className="absolute top-3/4 left-0 w-full h-px bg-[#D4AF37]/30" />
      </div>

      {/* Alert Banner */}
      <div className="absolute top-0 left-0 right-0 bg-red-600/20 border-b border-red-500/30 py-2 px-4 flex items-center justify-center gap-2">
        <AlertTriangle size={14} className="text-red-400 animate-pulse" />
        <span className="text-xs font-black uppercase tracking-widest text-red-400">
          Map Engine Offline - Tactical Compass Active
        </span>
      </div>

      {/* Main Compass Display */}
      <div className="relative mt-8">
        {/* Outer Ring */}
        <div className="w-64 h-64 rounded-full border-4 border-[#D4AF37]/50 flex items-center justify-center relative">
          {/* Heading Indicator */}
          <div 
            className="absolute top-2 left-1/2 -translate-x-1/2 transition-transform duration-300"
            style={{ transform: `translateX(-50%) rotate(${heading}deg)` }}
          >
            <Navigation size={20} className="text-[#D4AF37]" />
          </div>

          {/* Compass Ring */}
          <div className="w-56 h-56 rounded-full border-2 border-slate-700 flex items-center justify-center">
            {/* Cardinal Directions */}
            <div className="absolute top-4 text-[10px] font-black text-[#D4AF37]">N</div>
            <div className="absolute bottom-4 text-[10px] font-black text-slate-500">S</div>
            <div className="absolute left-4 text-[10px] font-black text-slate-500">W</div>
            <div className="absolute right-4 text-[10px] font-black text-slate-500">E</div>

            {/* Inner Circle */}
            <div className="w-40 h-40 rounded-full border border-slate-700/50 flex items-center justify-center bg-[#0a1628]/50">
              <Compass size={48} className="text-slate-600" />
            </div>
          </div>
        </div>

        {/* Heading Text */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center">
          <div className="text-2xl font-black text-white font-mono">
            {Math.round(heading).toString().padStart(3, "0")}°
          </div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Heading
          </div>
        </div>
      </div>

      {/* Position Data */}
      <div className="mt-16 w-full max-w-md space-y-3">
        {/* Latitude */}
        <div className="bg-[#0B1B32]/80 border border-white/10 rounded-xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
            <MapPin size={18} className="text-[#D4AF37]" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
              Latitude
            </div>
            <div className="text-lg font-mono font-bold text-white">
              {formatCoordinate(lat, "lat")}
            </div>
          </div>
        </div>

        {/* Longitude */}
        <div className="bg-[#0B1B32]/80 border border-white/10 rounded-xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
            <MapPin size={18} className="text-[#D4AF37]" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
              Longitude
            </div>
            <div className="text-lg font-mono font-bold text-white">
              {formatCoordinate(lng, "lng")}
            </div>
          </div>
        </div>

        {/* Accuracy */}
        <div className="bg-[#0B1B32]/80 border border-white/10 rounded-xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
            <Target size={18} className="text-[#D4AF37]" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
              GPS Accuracy
            </div>
            <div className={`text-lg font-mono font-bold ${getAccuracyColor(accuracy)}`}>
              {formatAccuracy(accuracy)}
            </div>
          </div>
        </div>

        {/* Secondary Telemetry */}
        <div className="grid grid-cols-3 gap-2">
          {/* Speed */}
          <div className="bg-[#0B1B32]/80 border border-white/10 rounded-xl p-3 flex flex-col items-center">
            <Navigation size={14} className="text-slate-500 mb-1" />
            <div className="text-sm font-mono font-bold text-white">
              {speed !== undefined ? `${Math.round(speed)}` : "---"}
            </div>
            <div className="text-[8px] font-black uppercase text-slate-500 tracking-widest">
              km/h
            </div>
          </div>

          {/* Signal */}
          <div className="bg-[#0B1B32]/80 border border-white/10 rounded-xl p-3 flex flex-col items-center">
            <Signal size={14} className={signalStatus === "No Signal" ? "text-red-400 mb-1" : "text-emerald-400 mb-1"} />
            <div className="text-sm font-mono font-bold text-white">
              {signalStatus ?? "---"}
            </div>
            <div className="text-[8px] font-black uppercase text-slate-500 tracking-widest">
              Signal
            </div>
          </div>

          {/* Battery */}
          <div className="bg-[#0B1B32]/80 border border-white/10 rounded-xl p-3 flex flex-col items-center">
            <Battery size={14} className={batteryLevel !== undefined && batteryLevel < 20 ? "text-red-400 mb-1" : "text-emerald-400 mb-1"} />
            <div className="text-sm font-mono font-bold text-white">
              {batteryLevel !== undefined ? `${Math.round(batteryLevel)}%` : "---"}
            </div>
            <div className="text-[8px] font-black uppercase text-slate-500 tracking-widest">
              {isCharging ? "CHG" : "BATT"}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={12} className="text-slate-500" />
          <span className="text-xs font-mono text-slate-500">
            {currentTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-600">
          SENTINEL TACTICAL COMPASS
        </div>
      </div>

      {/* Personnel Name Badge */}
      {personnelName && (
        <div className="absolute top-20 right-6 bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-3 py-1.5 rounded-lg">
          <div className="text-[8px] font-black uppercase text-[#D4AF37] tracking-widest">
            Personnel
          </div>
          <div className="text-sm font-bold text-white">
            {personnelName}
          </div>
        </div>
      )}
    </div>
  );
}

export default TacticalCompass;