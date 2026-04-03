"use client";

import React from "react";
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Map as MapIcon, 
  BrainCircuit, 
  Navigation,
  Settings,
  Activity,
  Droplets,
  Gauge
} from "lucide-react";
import { useAppStore } from "@/store";

const navItems = [
  { name: "Dashboard", id: "dashboard", icon: LayoutDashboard },
  { name: "Operasi", id: "operasi", icon: ShieldAlert },
  { name: "Wilayah (21 Polres)", id: "wilayah", icon: MapIcon },
  { name: "Patrol Analysis", id: "patrol", icon: Navigation },
  { name: "Intelijen", id: "intelijen", icon: BrainCircuit },
  { name: "Sistem", id: "sistem", icon: Settings },
];

interface SidebarNavProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
}

export default function SidebarNav({ activeMenu, setActiveMenu }: SidebarNavProps) {
  const tracks = useAppStore(state => state.personnelTracks);
  
  return (
    <aside className="flex h-full w-64 flex-col bg-[#0B1B32] border-r border-white/10 text-slate-300 z-50">
      <div className="flex items-center h-16 px-6 border-b border-white/10">
        <h1 className="text-lg font-bold tracking-widest text-white italic">SENTINEL-AI</h1>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto custom-scrollbar">
        <div className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Main Console
        </div>
        
        {navItems.map((item) => {
          const isActive = activeMenu === item.name;
          const Icon = item.icon;

          return (
            <button
              key={item.name}
              onClick={() => setActiveMenu(item.name)}
              className={`group w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 relative ${
                isActive 
                  ? "bg-white/5 text-[#FFD700]" 
                  : "hover:bg-white/5 hover:text-white"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-md bg-[#FFD700]" />
              )}
              
              <Icon 
                className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                  isActive ? "text-[#FFD700]" : "text-slate-400 group-hover:text-white"
                }`} 
              />
              {item.name}
            </button>
          );
        })}

        {/* Tactical Micro: Asset Health Indicators */}
        <div className="mt-10 px-3 mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
           <Activity size={12} /> Asset Fleet Status
        </div>
        <div className="space-y-4 px-3 pb-6">
           {tracks.slice(0, 3).map(track => (
             <div key={track.id} className="space-y-2">
                <div className="flex justify-between items-center text-[10px]">
                   <span className="font-bold text-slate-400">{track.id} Health</span>
                   <span className="text-emerald-400 font-mono">{track.health.engine}%</span>
                </div>
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                   <div 
                     className={`h-full transition-all duration-1000 ${track.health.engine > 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                     style={{ width: `${track.health.engine}%` }} 
                   />
                </div>
                <div className="flex items-center justify-between text-[8px] text-slate-500 font-mono tracking-tighter">
                   <div className="flex items-center gap-1"><Droplets size={8} /> {track.fuelStatus}% FUEL</div>
                   <div className="flex items-center gap-1"><Gauge size={8} /> {track.odometer.toFixed(0)} KM</div>
                </div>
             </div>
           ))}
        </div>
      </nav>
      
      <div className="p-4 border-t border-white/10">
         <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
          <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0 border border-white/10">
            <span className="text-xs font-bold text-white uppercase italic">CP</span>
          </div>
          <div className="flex flex-col min-w-0 text-left">
            <span className="text-sm font-medium text-white truncate">CO-PILOT AI</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400">Tactical Locked</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
