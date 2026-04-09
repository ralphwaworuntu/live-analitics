"use client";

import React, { useState } from "react";
import { Search, Filter, List, Map as MapIcon, Plus, ChevronDown, Check } from "lucide-react";
import { useAppStore } from "@/store";
import { cn } from "@/lib/utils";
import TacticalDispatchModal from "./TacticalDispatchModal";
import { motion, AnimatePresence } from "framer-motion";

interface ActionBarProps {
  activeView: "list" | "map";
  onToggleView: (view: "list" | "map") => void;
}

export default function ActionBar({
  activeView,
  onToggleView,
}: ActionBarProps) {
  const { searchQuery, setSearchQuery, filterStatus, setFilterStatus, filterPriority, setFilterPriority, setSelectedPolres } = useAppStore();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const statuses = ["all", "SOS", "Online", "Offline"];
  const priorities = ["all", "Low", "Medium", "High", "Critical"];

  return (
    <div className="w-full px-4 py-3 bg-[#07111F]/50 backdrop-blur-md z-30">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between bg-[#0B1B32] border border-white/10 rounded-xl h-14 shadow-2xl overflow-hidden hover:border-white/20 transition-all">
        
        {/* SISI KIRI (Informasi) */}
        <div className="flex items-center px-6 gap-3 shrink-0">
          <h2 className="text-sm font-black text-white uppercase tracking-wider font-mono">Sektor Wilayah</h2>
          <div className="px-2 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-bold rounded border border-[#D4AF37]/20">
            21
          </div>
        </div>

        {/* SISI KANAN (Integrated Controls Group) */}
        <div className="flex items-stretch h-full divide-x divide-white/10 border-l border-white/10">
          
          {/* Slot 1: Search */}
          <div className="flex items-center px-4 min-w-[240px] lg:min-w-[320px] group transition-colors hover:bg-white/5">
            <Search className="w-4 h-4 text-slate-500 group-focus-within:text-[#D4AF37] transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Wilayah..."
              className="ml-3 bg-transparent border-none outline-none text-sm text-white placeholder:text-slate-600 w-full"
            />
          </div>

          {/* Slot 2: Filters */}
          <div className="relative flex items-center h-full">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "flex items-center h-full px-5 gap-2 transition-all group",
                (filterStatus !== "all" || filterPriority !== "all") ? "text-[#D4AF37]" : "text-slate-400 hover:text-white"
              )}
            >
              <Filter className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline text-xs font-bold uppercase tracking-tight">Filter</span>
              <ChevronDown size={12} className={cn("transition-transform", isFilterOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {isFilterOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 w-56 bg-[#0B1B32] border border-white/10 rounded-xl shadow-2xl p-4 z-50 space-y-4"
                  >
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Status Operasional</label>
                      <div className="grid grid-cols-2 gap-1">
                        {statuses.map(s => (
                          <button 
                            key={s}
                            onClick={() => setFilterStatus(s as any)}
                            className={cn(
                              "text-[10px] font-bold px-2 py-1.5 rounded-lg border transition-all flex items-center justify-between",
                              filterStatus === s ? "bg-[#D4AF37]/20 border-[#D4AF37]/40 text-[#D4AF37]" : "bg-white/5 border-transparent text-slate-400 hover:bg-white/10"
                            )}
                          >
                            {s === "all" ? "SEMUA" : s === "SOS" ? "SOS/DARURAT" : s.toUpperCase()}
                            {filterStatus === s && <Check size={10} />}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Prioritas</label>
                       <div className="flex flex-wrap gap-1">
                        {priorities.map(p => (
                          <button 
                            key={p}
                            onClick={() => setFilterPriority(p as any)}
                            className={cn(
                              "text-[10px] font-bold px-2 py-1.5 rounded-lg border transition-all flex items-center justify-between",
                              filterPriority === p ? "bg-[#3B82F6]/20 border-[#3B82F6]/40 text-[#3B82F6]" : "bg-white/5 border-transparent text-slate-400 hover:bg-white/10"
                            )}
                          >
                            {p.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Slot 3: Action Button */}
          <div className="flex items-center px-2">
            <button 
              onClick={() => {
                setSelectedPolres(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 h-10 px-4 bg-[#D4AF37] hover:bg-[#EBC145] text-[#07111F] font-black rounded-lg transition-all active:scale-95 shadow-[0_0_15px_rgba(212,175,55,0.2)] group"
            >
              <Plus className="w-4 h-4 stroke-[3px]" />
              <span className="text-[11px] uppercase tracking-tighter">Input Kejadian</span>
            </button>
          </div>

          {/* Slot 4: View Toggles */}
          <div className="flex items-center px-4 gap-1 transform scale-90 sm:scale-100">
            <button
              onClick={() => onToggleView("list")}
              className={cn(
                "p-2 rounded-lg transition-all",
                activeView === "list" ? "bg-[#D4AF37]/20 text-[#D4AF37] shadow-inner" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
              )}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggleView("map")}
              className={cn(
                "p-2 rounded-lg transition-all",
                activeView === "map" ? "bg-[#D4AF37]/20 text-[#D4AF37] shadow-inner" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
              )}
            >
              <MapIcon className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      <TacticalDispatchModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        initialLocation={searchQuery}
      />
    </div>
  );
}

