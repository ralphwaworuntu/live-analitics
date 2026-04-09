"use client";

import React, { useState, useMemo } from "react";
import GoogleMap from "@/components/map/GoogleMap";
import ActionBar from "@/components/dashboard/ActionBar";
import { useAppStore } from "@/store";
import { Shield, MapPin, Users, AlertTriangle, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import TacticalDispatchModal from "../dashboard/TacticalDispatchModal";

/**
 * SENTINEL Command Center View
 * Focus: Full-screen tactical GIS tracker for live patrol monitoring and tactical AI intel.
 */
export default function DashboardView() {
  const { polres, searchQuery, filterStatus, filterPriority, setSelectedPolres } = useAppStore();
  const [activeView, setActiveView] = useState<"list" | "map">("map");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");

  const handlePolresClick = (p: { id: string, name: string }) => {
    setSelectedPolres(p.id);
    setSelectedLocation(""); // Let the modal filter handle it
    setIsModalOpen(true);
  };

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
                <div className="flex items-center justify-between mb-8 px-2">
                  <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-widest italic">Inventory Wilayah</h2>
                    <p className="text-[10px] text-[#D4AF37] font-black uppercase tracking-widest mt-1 opacity-80">Regional NTT Operational Index • Total 21 Polresta/Polres</p>
                  </div>
                  <div className="flex gap-4">
                     <div className="flex flex-col items-end">
                       <span className="text-3xl font-black text-white font-mono tracking-tighter">{filteredPolres.length}</span>
                       <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Wilayah Terdeteksi</span>
                     </div>
                  </div>
                </div>

                {filteredPolres.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-32 flex flex-col items-center justify-center text-center border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.02]"
                  >
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-[#D4AF37]/20 blur-3xl rounded-full" />
                      <div className="relative p-8 bg-white/5 rounded-full border border-white/10 shadow-2xl">
                        <Search size={48} className="text-slate-600" />
                      </div>
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Data Tidak Terdeteksi</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] mt-3 max-w-sm leading-relaxed">
                      Sistem tidak menemukan wilayah atau entitas yang sesuai dengan query pencarian Anda.
                    </p>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredPolres.map(p => (
                      <motion.div 
                        key={p.id}
                        layout
                        whileHover={{ scale: 1.02, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePolresClick(p)}
                        className={cn(
                          "relative group bg-[#0B1B32] border rounded-[24px] p-6 transition-all duration-300 cursor-pointer overflow-hidden",
                          p.status === "kritis" ? "border-red-500/40 shadow-[0_20px_40px_-15px_rgba(239,68,68,0.2)]" : "border-white/5 hover:border-white/20 shadow-xl"
                        )}
                      >
                        {p.status === "kritis" && (
                          <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse overflow-hidden">
                             <div className="w-full h-full bg-white/30 animate-[slide_1.5s_infinite]" />
                          </div>
                        )}
                        
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "p-3 rounded-2xl transition-all duration-500",
                              p.status === "kritis" ? "bg-red-500/10 text-red-500 scale-110" : "bg-white/5 text-slate-500 group-hover:bg-[#D4AF37]/10 group-hover:text-[#D4AF37]"
                            )}>
                              {p.status === "kritis" ? <AlertTriangle size={22} /> : <Shield size={22} />}
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-[#D4AF37] transition-colors">{p.name}</h4>
                              <span className="text-[10px] text-slate-500 font-mono font-bold tracking-widest">{p.id.toUpperCase()}</span>
                            </div>
                          </div>
                          <Badge variant={p.status === "kritis" ? "destructive" : p.status === "waspada" ? "warning" : "success"} className="text-[9px] px-2.5 py-1">
                            {p.status.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="space-y-4">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Users size={14} className="text-slate-500" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Kekuatan Personil</span>
                              </div>
                              <span className="text-[12px] font-black font-mono text-white">{(p.online || 0)} <span className="text-slate-600">/</span> {(p.personnel || 0)}</span>
                           </div>
                           <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden p-[1px]">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${((p.online || 0) / (p.personnel || 1)) * 100}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className={cn("h-full rounded-full", p.status === "kritis" ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-gradient-to-r from-[#D4AF37] to-[#F1C40F]")}
                              />
                           </div>
                        </div>

                        <div className="mt-8 pt-5 border-t border-white/5 flex items-center justify-between group-hover:bg-white/[0.03] -mx-6 px-6 transition-all">
                           <div className="flex items-center gap-2">
                              <MapPin size={14} className="text-[#D4AF37]" />
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Sektor {p.island}</span>
                           </div>
                           <div className="flex items-center gap-2 text-[#D4AF37] font-black uppercase text-[9px] tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                              Dispatch
                              <ChevronRight size={14} />
                           </div>
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

      <TacticalDispatchModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        initialLocation={selectedLocation}
      />

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

