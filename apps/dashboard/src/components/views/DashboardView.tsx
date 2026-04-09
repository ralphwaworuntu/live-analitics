"use client";

import React, { useState, useMemo } from "react";
import GoogleMap from "@/components/map/GoogleMap";
import ActionBar from "@/components/dashboard/ActionBar";
import { useAppStore } from "@/store";
import { Shield, MapPin, Users, AlertTriangle, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

/**
 * SENTINEL Command Center View
 * Focus: Full-screen tactical GIS tracker for live patrol monitoring and tactical AI intel.
 */
export default function DashboardView() {
  const { polres, searchQuery, filterStatus, filterPriority } = useAppStore();
  const [activeView, setActiveView] = useState<"list" | "map">("map");

  const filteredPolres = useMemo(() => {
    return polres.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchStatus = filterStatus === "all" || 
                          (filterStatus === "SOS" && p.status === "kritis") ||
                          (filterStatus === "Online" && (p.online || 0) > 0) ||
                          (filterStatus === "Offline" && (p.online || 0) === 0);

      // Priority in Polres context is mapped from status for this demo
      const matchPriority = filterPriority === "all" ||
                            (filterPriority === "Critical" && p.status === "kritis") ||
                            (filterPriority === "High" && p.status === "waspada") ||
                            (filterPriority === "Medium" && p.status === "waspada") ||
                            (filterPriority === "Low" && p.status === "kondusif");

      return matchSearch && matchStatus && matchPriority;
    });
  }, [polres, searchQuery, filterStatus, filterPriority]);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[#07111F]">
      {/* ACTION BAR (TOP) */}
      <ActionBar 
        activeView={activeView}
        onToggleView={setActiveView}
      />

      {/* CONTENT AREA */}
      <div className="flex-1 relative h-full flex flex-col">
        <AnimatePresence mode="wait">
          {activeView === "map" ? (
            <motion.div 
              key="map-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 w-full h-full"
            >
              <GoogleMap />
            </motion.div>
          ) : (
            <motion.div 
              key="list-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="absolute inset-0 w-full h-full p-6 overflow-y-auto custom-scrollbar bg-[#07111F]"
            >
              <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-widest italic">Inventory Wilayah</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-1">SENTINEL-AI Geolocation Index • Regional NTT</p>
                  </div>
                  <div className="flex gap-4">
                     <div className="flex flex-col items-end">
                       <span className="text-2xl font-black text-white font-mono">{filteredPolres.length}</span>
                       <span className="text-[9px] font-black text-slate-600 uppercase">Results Found</span>
                     </div>
                  </div>
                </div>

                {filteredPolres.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-white/5 rounded-3xl">
                    <div className="p-4 bg-white/5 rounded-full mb-4">
                      <Search size={32} className="text-slate-700" />
                    </div>
                    <h3 className="text-lg font-black text-slate-300 uppercase tracking-tighter italic">Wilayah/Kejadian tidak ditemukan</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">Database SENTINEL tidak mencatat entri untuk query ini.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPolres.map(p => (
                      <motion.div 
                        key={p.id}
                        whileHover={{ scale: 1.02 }}
                        className={cn(
                          "relative group bg-[#0B1B32] border rounded-2xl p-5 transition-all overflow-hidden",
                          p.status === "kritis" ? "border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.1)]" : "border-white/5"
                        )}
                      >
                        {p.status === "kritis" && (
                          <div className="absolute top-0 left-0 w-full h-0.5 bg-red-500 animate-pulse" />
                        )}
                        
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2 rounded-lg transition-colors",
                              p.status === "kritis" ? "bg-red-500/10 text-red-500" : "bg-white/5 text-slate-400"
                            )}>
                              {p.status === "kritis" ? <AlertTriangle size={18} /> : <Shield size={18} />}
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-white uppercase tracking-tight">{p.name}</h4>
                              <span className="text-[10px] text-slate-500 font-mono">ID: {p.id.toUpperCase()}</span>
                            </div>
                          </div>
                          <Badge variant={p.status === "kritis" ? "destructive" : p.status === "waspada" ? "warning" : "success"} className="text-[8px]">
                            {p.status.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="space-y-3">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Users size={12} className="text-slate-500" />
                                <span className="text-[10px] font-bold text-slate-300 uppercase">Personil</span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400">{(p.online || 0)} / {(p.personnel || 0)}</span>
                           </div>
                           <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className={cn("h-full transition-all duration-1000", p.status === "kritis" ? "bg-red-500" : "bg-[#D4AF37]")}
                                style={{ width: `${((p.online || 0) / (p.personnel || 1)) * 100}%` }}
                              />
                           </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between group-hover:bg-white/5 -mx-5 px-5 transition-colors cursor-pointer">
                           <div className="flex items-center gap-2">
                              <MapPin size={12} className="text-[#D4AF37]" />
                              <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-tighter">{p.island} Range</span>
                           </div>
                           <ChevronRight size={14} className="text-slate-600 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 10px; }
      `}</style>
    </div>
  );
}

function Badge({ children, variant = "info", className }: { children: React.ReactNode, variant?: "success" | "warning" | "destructive" | "info", className?: string }) {
  const styles = {
    success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    warning: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    destructive: "bg-red-500/10 text-red-500 border-red-500/20 animate-pulse",
    info: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  };
  
  return (
    <span className={cn("px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-widest", styles[variant], className)}>
      {children}
    </span>
  );
}

