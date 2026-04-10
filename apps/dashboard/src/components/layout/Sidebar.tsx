"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAppStore } from "@/store";
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
  ShieldCheck,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  viewId: string;
  icon: React.ElementType;
  label: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}

const NavItem = ({ viewId, icon: Icon, label, collapsed, onNavigate }: NavItemProps) => {
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") || "dashboard";
  const isActive = currentView === viewId;

  return (
    <Link
      href={`/?view=${viewId}`}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg transition-all duration-300 min-h-[44px]",
        collapsed ? "justify-center mx-1 px-2 py-2.5" : "px-4 py-2.5 mx-2",
        "text-slate-400 hover:text-white hover:bg-white/5",
        isActive && "text-white bg-white/5"
      )}
    >
      {/* Active Indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-yellow-500 rounded-r-full shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
      )}

      <Icon size={18} className={cn("shrink-0 transition-colors", isActive ? "text-yellow-500" : "group-hover:text-white")} />

      {!collapsed && (
        <span className="text-sm font-medium tracking-wide flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{label}</span>
      )}
    </Link>
  );
};

interface SidebarProps {
  onClose?: () => void;
  collapsed?: boolean;
}

export default function Sidebar({ onClose, collapsed = false }: SidebarProps) {
  const setLiveMode = useAppStore(state => state.setLiveMode);
  const setTimeRangeHours = useAppStore(state => state.setTimeRangeHours);
  const liveMode = useAppStore(state => state.liveMode);
  const timeRangeHours = useAppStore(state => state.timeRangeHours);
  
  const handleTimeframeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    switch (e.target.value) {
      case "current":
        setLiveMode(true);
        break;
      case "last-24h":
        setLiveMode(false);
        setTimeRangeHours(24);
        break;
      case "last-week":
        setLiveMode(false);
        setTimeRangeHours(168);
        break;
      case "last-month":
        setLiveMode(false);
        setTimeRangeHours(720);
        break;
    }
  };

  const selectValue = liveMode ? "current" : (timeRangeHours === 24 ? "last-24h" : (timeRangeHours === 168 ? "last-week" : "last-month"));

  return (
    <aside className={cn(
      "relative z-50 h-full bg-[#0B1B32] border-r border-white/5 flex flex-col overflow-hidden font-sans shrink-0 transition-all duration-300",
      collapsed ? "w-[68px]" : "w-[280px]"
    )}>

      {/* 1. BRANDING & TIMEFRAME GROUP */}
      <div className={cn("transition-all duration-300", collapsed ? "p-2" : "p-4 sm:p-6")}>
        <div className={cn("flex items-center mb-6 sm:mb-8 transition-all duration-300", collapsed ? "justify-center gap-0" : "gap-3")}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/10 shrink-0">
            <ShieldCheck size={24} className="text-[#0B1B32]" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-white leading-tight font-mono uppercase tracking-tight">Polda NTT</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">Command Center</p>
            </div>
          )}
          {/* Close button - only in mobile drawer mode */}
          {onClose && !collapsed && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {!collapsed && (
          <div className="relative group pt-4 border-t border-white/5">
            <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-2.5 ml-1">
              Platform Timeframe
            </label>
            <div className="relative">
              <select 
                value={selectValue}
                onChange={handleTimeframeChange}
                className="appearance-none w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2.5 text-xs font-bold text-slate-300 focus:outline-none focus:ring-1 focus:ring-yellow-500/50 cursor-pointer transition-all hover:bg-slate-900/80 uppercase tracking-widest min-h-[44px]"
              >
                <option value="current">Real-time / Live</option>
                <option value="last-24h">Operasi 24 Jam</option>
                <option value="last-week">Laporan Mingguan</option>
                <option value="last-month">Arsip Bulanan</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-slate-300 transition-colors" />
            </div>
          </div>
        )}
      </div>

      {/* 2. NAVIGATION AREA */}
      <nav className="flex-1 overflow-y-auto pt-2 pb-6 custom-scrollbar">
        {!collapsed && (
          <div className="px-4 sm:px-6 mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500/60">
            Main Console
          </div>
        )}
        <div className="space-y-1">
          <NavItem viewId="dashboard" icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} onNavigate={onClose} />
          <NavItem viewId="core-data" icon={Gauge} label="Core Data" collapsed={collapsed} onNavigate={onClose} />
          <NavItem viewId="statistics" icon={Activity} label="Statistics" collapsed={collapsed} onNavigate={onClose} />
          <NavItem viewId="operasi" icon={ShieldAlert} label="Operasi" collapsed={collapsed} onNavigate={onClose} />
          <NavItem viewId="wilayah" icon={MapIcon} label="Wilayah (21 Polres)" collapsed={collapsed} onNavigate={onClose} />
          <NavItem viewId="patrol" icon={Navigation} label="Patrol Analysis" collapsed={collapsed} onNavigate={onClose} />
          <NavItem viewId="intelijen" icon={BrainCircuit} label="Intelijen AI" collapsed={collapsed} onNavigate={onClose} />
          <NavItem viewId="sistem" icon={Settings} label="Sistem Anev" collapsed={collapsed} onNavigate={onClose} />
        </div>
      </nav>

      {/* 3. TACTICAL FOOTER */}
      <div className={cn("border-t border-white/5 bg-slate-900/20 transition-all duration-300", collapsed ? "p-2" : "p-3 sm:p-4")}>
        {collapsed ? (
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0 border border-white/10 shadow-lg">
              <span className="text-[10px] font-black text-white uppercase italic">CP</span>
            </div>
          </div>
        ) : (
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
        )}
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
