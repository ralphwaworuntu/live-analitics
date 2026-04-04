"use client";

import React from "react";
import { Search, Filter, List, Map as MapIcon, Plus } from "lucide-react";

interface ActionBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeView?: "list" | "map";
  onToggleView?: (view: "list" | "map") => void;
}

/**
 * Integrated Toolbar for Sentinel-AI Dashboard
 * Features a unified control group with vertical dividers.
 */
export default function ActionBar({
  searchQuery,
  setSearchQuery,
  activeView = "map",
  onToggleView,
}: ActionBarProps) {
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
              className="ml-3 bg-transparent border-none outline-none text-sm text-slate-200 placeholder:text-slate-600 w-full"
            />
          </div>

          {/* Slot 2: Filters */}
          <button className="flex items-center px-5 gap-2 text-slate-400 hover:text-white hover:bg-white/5 transition-all group">
            <Filter className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline text-xs font-bold uppercase tracking-tight">Filter</span>
          </button>

          {/* Slot 3: Action Button */}
          <div className="flex items-center px-2">
            <button className="flex items-center gap-2 h-10 px-4 bg-[#D4AF37] hover:bg-[#EBC145] text-[#07111F] font-black rounded-lg transition-all active:scale-95 shadow-[0_0_15px_rgba(212,175,55,0.2)] group">
              <Plus className="w-4 h-4 stroke-[3px]" />
              <span className="text-[11px] uppercase tracking-tighter">Input Kejadian</span>
            </button>
          </div>

          {/* Slot 4: View Toggles */}
          <div className="flex items-center px-4 gap-1 transform scale-90 sm:scale-100">
            <button
              onClick={() => onToggleView?.("list")}
              className={`p-2 rounded-lg transition-all ${
                activeView === "list" 
                  ? "bg-[#D4AF37]/20 text-[#D4AF37] shadow-inner" 
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggleView?.("map")}
              className={`p-2 rounded-lg transition-all ${
                activeView === "map" 
                  ? "bg-[#D4AF37]/20 text-[#D4AF37] shadow-inner" 
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
              }`}
            >
              <MapIcon className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
