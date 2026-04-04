"use client";

import React from "react";
import { 
  Map, 
  Plus, 
  Settings, 
  Bell, 
  ChevronDown 
} from "lucide-react";

/**
 * TopHeader Component for Sentinel-AI Dashboard
 * Features breadcrumbs navigation and user utility actions.
 */
export default function TopHeader() {
  return (
    <header className="sticky top-0 z-[100] w-full h-16 bg-[#0B1B32] border-b border-white/5 flex items-center justify-between px-8 shadow-2xl">
      
      {/* SISI KIRI (Breadcrumbs / Page Title) */}
      <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left duration-500">
        <div className="p-2 bg-yellow-500/10 rounded-lg">
          <Map size={18} className="text-yellow-500" />
        </div>
        <span className="text-sm font-medium text-slate-200 tracking-wide">Radar Operasional</span>
      </div>

      {/* SISI KANAN (Utility Icons Group) */}
      <div className="flex items-center gap-6 animate-in fade-in slide-in-from-right duration-500">
        
        {/* Button "+ Baru" */}
        <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg border border-white/5 transition-all">
          <Plus size={14} />
          <span>BARU</span>
        </button>

        {/* Action Icons */}
        <div className="flex items-center gap-4">
          <button className="text-slate-500 hover:text-white transition-all transform hover:scale-110 active:scale-95">
            <Settings size={20} />
          </button>
          
          <button className="relative text-slate-500 hover:text-white transition-all transform hover:scale-110 active:scale-95">
            <Bell size={20} />
            <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 bg-red-600 text-[10px] font-bold text-white rounded-full border-2 border-[#0B1B32]">
              4
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-white/5" />

        {/* User Profile */}
        <button className="flex items-center gap-3 group transition-all">
          <div className="w-8 h-8 rounded-full bg-slate-700 border border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-yellow-500/50">
            <span className="text-[10px] font-black text-white italic">DTMS</span>
          </div>
          <div className="hidden md:flex flex-col items-start translate-y-[1px]">
            <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">Irjen Pol. Daniel T.M. Silitonga</span>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Kapolda NTT</span>
          </div>
          <ChevronDown size={14} className="text-slate-500 group-hover:text-slate-200 group-hover:translate-y-0.5 transition-all" />
        </button>

      </div>
    </header>
  );
}
