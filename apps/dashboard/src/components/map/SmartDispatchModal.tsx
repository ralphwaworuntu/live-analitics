"use client";

import { useAppStore } from "@/store";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Zap, Fuel, Activity, Navigation, X } from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

export default function SmartDispatchModal() {
  const isOpen = useAppStore(state => state.dispatchModalOpen);
  const incident = useAppStore(state => state.selectedIncident);
  const setOpen = useAppStore(state => state.setDispatchModal);
  const personnel = useAppStore(state => state.personnelTracks);

  const recommendedUnits = useMemo(() => {
    if (!incident) return [];

    return personnel
      .map(unit => {
        const lastPos = unit.waypoints[unit.waypoints.length - 1];
        const dist = Math.sqrt(
          Math.pow(lastPos.lat - incident.lat, 2) + 
          Math.pow(lastPos.lng - incident.lng, 2)
        ) * 111.32; // Approx KM

        // Scoring: Lower is better
        // Proximity (50%), Fuel (25%), Workload (25%)
        // Workload is simulated by unit ID length for now
        const workload = (unit.id.length % 5) * 20; 
        const score = (dist * 2) + (100 - unit.fuelStatus) + workload;

        return {
          ...unit,
          distance: dist.toFixed(1),
          workload,
          score
        };
      })
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);
  }, [incident, personnel]);

  if (!isOpen || !incident) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-[#0B1B32] border border-white/10 w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl shadow-black/50"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-[#0B1B32] to-[#0E2442]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
                <Shield className="text-rose-500 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Smart Dispatch</h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Biro Ops Intervention Module</p>
              </div>
            </div>
            <button 
              onClick={() => setOpen(false)}
              className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <div className="p-6">
            <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Target Incident</div>
              <div className="text-sm font-bold text-white mb-1">{incident.locationName}</div>
              <div className="text-[11px] text-slate-400 leading-relaxed italic">"{incident.textReport}"</div>
            </div>

            <div className="space-y-3">
              <div className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest flex items-center gap-2">
                <Zap size={12} /> Top Recommended Responders
              </div>

              {recommendedUnits.map((unit, idx) => (
                <div 
                  key={unit.id}
                  className={cn(
                    "p-4 rounded-2xl border transition-all cursor-pointer group hover:scale-[1.02]",
                    idx === 0 ? "bg-[#D4AF37]/10 border-[#D4AF37]/30 shadow-[0_0_20px_rgba(212,175,55,0.1)]" : "bg-white/5 border-white/5 hover:border-white/20"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center overflow-hidden">
                         <Activity size={18} className={idx === 0 ? "text-[#D4AF37]" : "text-slate-400"} />
                      </div>
                      <div>
                        <div className="text-[11px] font-black text-white uppercase">{unit.name}</div>
                        <div className="text-[9px] text-slate-500 font-mono tracking-tighter uppercase">{unit.id} • {unit.unitType} UNIT</div>
                      </div>
                    </div>
                    {idx === 0 && (
                      <span className="text-[8px] font-black bg-[#D4AF37] text-black px-2 py-0.5 rounded-full uppercase">Optimal</span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 opacity-40">
                        <Navigation size={10} className="text-white" />
                        <span className="text-[8px] font-black uppercase text-white">Distance</span>
                      </div>
                      <div className="text-xs font-mono font-bold text-white">{unit.distance} KM</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 opacity-40">
                        <Fuel size={10} className="text-white" />
                        <span className="text-[8px] font-black uppercase text-white">Fuel</span>
                      </div>
                      <div className="text-xs font-mono font-bold text-white">{unit.fuelStatus}%</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 opacity-40">
                        <Activity size={10} className="text-white" />
                        <span className="text-[8px] font-black uppercase text-white">Load</span>
                      </div>
                      <div className="text-xs font-mono font-bold text-white">{unit.workload}%</div>
                    </div>
                  </div>

                  {idx === 0 && (
                    <button className="w-full mt-4 py-3 bg-[#D4AF37] hover:bg-[#B8962E] text-black font-black text-[11px] uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2">
                      <Zap size={14} /> Dispatch Now
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
