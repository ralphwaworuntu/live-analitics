"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Map as MapIcon, 
  BrainCircuit, 
  Navigation,
  Settings,
  Activity,
  Gauge,
  ChevronDown,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  viewId: string;
  icon: React.ElementType;
  label: string;
}

const NavItem = ({ viewId, icon: Icon, label }: NavItemProps) => {
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") || "dashboard";
  const isActive = currentView === viewId;

  return (
    <Link
      href={`/?view=${viewId}`}
      className={cn(
        "group relative flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-all duration-200",
        "text-slate-400 hover:text-white hover:bg-white/5",
        isActive && "text-white bg-white/5"
      )}
    >
      {/* Active Indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-yellow-500 rounded-r-full shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
      )}
      
      <Icon size={18} className={cn("shrink-0 transition-colors", isActive ? "text-yellow-500" : "group-hover:text-white")} />
      
      <span className="text-sm font-medium tracking-wide flex-1">{label}</span>
    </Link>
  );
};

export default function Sidebar() {
  return (
    <aside className="relative z-50 w-[280px] h-full bg-[#0B1B32] border-r border-white/5 flex flex-col overflow-hidden font-sans shrink-0">
      
      {/* 1. BRANDING & TIMEFRAME GROUP */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/10 shrink-0">
            <ShieldCheck size={24} className="text-[#0B1B32]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight font-mono uppercase tracking-tight">Polda NTT</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">Command Center</p>
          </div>
        </div>

        <div className="relative group pt-4 border-t border-white/5">
          <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-2.5 ml-1">
            Platform Timeframe
          </label>
          <div className="relative">
            <select className="appearance-none w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2.5 text-xs font-bold text-slate-300 focus:outline-none focus:ring-1 focus:ring-yellow-500/50 cursor-pointer transition-all hover:bg-slate-900/80 uppercase tracking-widest">
              <option value="current">Real-time / Live</option>
              <option value="last-24h">Operasi 24 Jam</option>
              <option value="last-week">Laporan Mingguan</option>
              <option value="last-month">Arsip Bulanan</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-slate-300 transition-colors" />
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION AREA */}
      <nav className="flex-1 overflow-y-auto pt-2 pb-6 custom-scrollbar">
        <div className="px-6 mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500/60">
          Main Console
        </div>
        <div className="space-y-1">
          <NavItem viewId="dashboard" icon={LayoutDashboard} label="Dashboard (GIS)" />
          <NavItem viewId="core-data" icon={Gauge} label="Core Data Assets" />
          <NavItem viewId="statistics" icon={Activity} label="Statistics Anev" />
          <NavItem viewId="operasi" icon={ShieldAlert} label="Operasi" />
          <NavItem viewId="wilayah" icon={MapIcon} label="Wilayah (21 Polres)" />
          <NavItem viewId="patrol" icon={Navigation} label="Patrol Analysis" />
          <NavItem viewId="intelijen" icon={BrainCircuit} label="Intelijen AI" />
          <NavItem viewId="sistem" icon={Settings} label="Sistem Anev" />
        </div>
      </nav>

      {/* 3. TACTICAL FOOTER */}
      <div className="p-4 border-t border-white/5 bg-slate-900/20">
        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5 shadow-inner">
          <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0 border border-white/10 shadow-lg">
            <span className="text-[10px] font-black text-white uppercase italic">CP</span>
          </div>
          <div className="flex flex-col min-w-0 text-left">
            <span className="text-[11px] font-black text-white truncate tracking-tight uppercase">Biro Ops Co-Pilot</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
              <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Tactical Locked</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </aside>
  );
}
