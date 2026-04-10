"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/store";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, AlertTriangle, Crosshair, Radio, X } from "lucide-react";
import { useLiveTracking } from "@/hooks/useLiveTracking";

// -------------------------------------------------------------
// PUSH TO TALK (PTT) WIDGET
// -------------------------------------------------------------
function PTTSidebarWidget() {
  const [talking, setTalking] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[200]">
      <button
        onMouseDown={() => setTalking(true)}
        onMouseUp={() => setTalking(false)}
        onMouseLeave={() => setTalking(false)}
        onTouchStart={() => setTalking(true)}
        onTouchEnd={() => setTalking(false)}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl border-4 transition-all duration-150 ${
          talking
            ? "bg-[#D4AF37] border-[#D4AF37] scale-110 shadow-[0_0_30px_rgba(212,175,55,0.7)]"
            : "bg-[#0B1B32] border-white/10 hover:border-[#D4AF37]/50"
        }`}
      >
        <Mic
          size={24}
          className={talking ? "text-[#0B1B32]" : "text-[#D4AF37]"}
        />
        {/* Voice Waves Simulation */}
        {talking && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="absolute w-full h-full rounded-full border-2 border-[#D4AF37] animate-ping opacity-50" />
            <span className="absolute w-12 h-12 rounded-full bg-[#D4AF37] blur-md animate-pulse opacity-40" />
          </div>
        )}
      </button>
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-black uppercase text-slate-400 bg-black/50 px-2 py-0.5 rounded backdrop-blur">
        {talking ? "TRANSMITTING..." : "HOLD PTT"}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// SOS BLACKBOX CRISIS WINDOW
// -------------------------------------------------------------
function CrisisWindow() {
  const isEmergency = useAppStore((s) => s.emergency.active);
  const emergencyLoc = useAppStore((s) => s.emergency.location);
  const emergencyUnitId = useAppStore((s) => s.emergency.unitId);
  const emergencyMessage = useAppStore((s) => s.emergency.message);
  const emergencyLat = useAppStore((s) => s.emergency.lat);
  const emergencyLng = useAppStore((s) => s.emergency.lng);
  
  const tracks = useAppStore((s) => s.personnelTracks);
  const sosUnit = tracks.find(t => t.isSOS || t.id === emergencyUnitId);
  
  const { nearestUnits } = useLiveTracking();

  const [waveHeight, setWaveHeight] = useState<number[]>([10, 20, 15, 30, 25, 40, 35, 20, 15, 10]);

  // Simulate audio wave form
  useEffect(() => {
    if (!isEmergency) return;
    const intv = setInterval(() => {
      setWaveHeight(prev => prev.map(() => 10 + Math.random() * 40));
    }, 150);
    return () => clearInterval(intv);
  }, [isEmergency]);

  // Calculate nearest units if we have coordinates
  const backups = (emergencyLat && emergencyLng) ? nearestUnits(emergencyLat, emergencyLng, 3) : [];

  if (!isEmergency) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#0B1B32] border border-red-500/30 w-full max-w-4xl rounded-[32px] overflow-hidden shadow-[0_0_80px_rgba(239,68,68,0.2)] flex flex-col md:flex-row shadow-black/50"
        >
          {/* LEFT: Incident & Audio Stream */}
          <div className="md:w-1/2 p-6 md:border-r border-white/5 bg-gradient-to-b from-[#0B1B32] to-[#1a0f14]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex flex-col items-center justify-center border border-red-500/50 animate-pulse">
                <AlertTriangle className="text-red-500 w-6 h-6 mb-1" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-red-500 uppercase tracking-tight leading-none">CRISIS WINDOW</h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono mt-1">Live Intercept Stream</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-black/30 border border-white/5 p-4 rounded-xl">
                <div className="text-[10px] text-slate-500 mb-1 font-mono uppercase">Reporting Unit</div>
                <div className="text-lg font-black text-white">{sosUnit ? sosUnit.name : "UNKNOWN REPORTER"}</div>
                {sosUnit && <div className="text-xs text-red-400 font-mono mt-1">NRP: {sosUnit.nrp} • BATT {sosUnit.batteryLevel}%</div>}
              </div>
              <div className="bg-black/30 border border-white/5 p-4 rounded-xl">
                <div className="text-[10px] text-slate-500 mb-1 font-mono uppercase">Location & Message</div>
                <div className="text-sm font-bold text-white mb-2">{emergencyLoc}</div>
                <div className="text-lg font-black text-red-400">&quot;{emergencyMessage}&quot;</div>
              </div>
            </div>

            {/* Simulated Live Audio Stream Form */}
            <div className="mt-8 border border-red-500/20 bg-red-950/20 rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute top-2 left-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[8px] font-black uppercase text-red-400 tracking-widest">Live Comm Intercept</span>
              </div>
              <div className="h-24 mt-4 flex items-center justify-center gap-1">
                {waveHeight.map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: h }}
                    className="w-2 bg-red-500/60 rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: History & Backups */}
          <div className="md:w-1/2 p-6 bg-[#0B1B32]">
             <div className="mb-6">
               <h4 className="text-sm font-black text-white uppercase flex items-center gap-2 border-b border-white/10 pb-2">
                 <Radio size={16} className="text-[#D4AF37]" /> Tactical Backup Response
               </h4>
             </div>
             
             {sosUnit && (
               <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                 <div className="text-[10px] text-slate-400 uppercase font-bold mb-2">Unit Trajectory (Last 5 Min)</div>
                 <div className="flex flex-col gap-2">
                   {sosUnit.waypoints.slice(-3).reverse().map((wp, i) => (
                     <div key={i} className="flex justify-between text-[10px] font-mono border-l-2 pl-2 border-slate-600">
                       <span className="text-slate-300">Lat: {wp.lat.toFixed(5)} Lng: {wp.lng.toFixed(5)}</span>
                       <span className="text-slate-500">{new Date(wp.timestamp).toLocaleTimeString()}</span>
                     </div>
                   ))}
                 </div>
               </div>
             )}

             <div className="space-y-3">
                <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Top 3 Nearest Units</div>
                {backups.map((bk) => (
                  <div key={bk.track.id} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5 hover:border-emerald-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <Crosshair size={14} className="text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{bk.track.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{bk.distanceKm} km • ETA: {bk.etaMinutes}m</div>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase rounded shadow-lg transition-colors">
                      Engage
                    </button>
                  </div>
                ))}
             </div>
          </div>

          <button 
            className="absolute top-4 right-4 text-slate-500 hover:text-white"
            onClick={() => useAppStore.getState().clearEmergency()}
          >
            <X size={24} />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// -------------------------------------------------------------
// EXPORT CONTAINER
// -------------------------------------------------------------
export default function TacticalComms() {
  return (
    <>
      <PTTSidebarWidget />
      <CrisisWindow />
    </>
  );
}
