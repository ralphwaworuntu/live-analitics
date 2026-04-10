"use client";

import React, { useState, useMemo } from "react";
import GoogleMap from "@/components/map/GoogleMap";
import ActionBar from "@/components/dashboard/ActionBar";
import PolresCard from "@/components/dashboard/PolresCard";
import { useAppStore } from "@/store";
import { Search } from "lucide-react";
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
              className="absolute inset-0 w-full h-full p-3 sm:p-4 lg:p-6 overflow-y-auto custom-scrollbar bg-[#07111F]"
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                    {filteredPolres.map(p => (
                      <PolresCard
                        key={p.id}
                        polres={p}
                        onClick={() => handlePolresClick(p)}
                      />
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

