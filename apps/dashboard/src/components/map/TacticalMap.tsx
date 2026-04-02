"use client";

import { Users, Navigation, Radio, Satellite, Target, AlertTriangle } from "lucide-react";
import { useState } from "react";

export default function TacticalMap() {
  const [personnelCount] = useState(1243);
  const [activeEvents] = useState(12);

  return (
    <div className="relative w-full h-full bg-[#07111F] overflow-hidden group">
      {/* GIS Grid Background */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #EAF2FF 1px, transparent 0)`,
        backgroundSize: '48px 48px'
      }} />
      
      {/* Mock Map Image (Replace with real Mapbox/Leaflet) */}
      <div className="absolute inset-0 bg-[#0B1B32]/10 mix-blend-screen opacity-60">
         {/* We can use an image or map component here */}
         <div className="w-full h-full flex items-center justify-center border-4 border-[#D4AF37]/5 rounded-3xl m-4 overflow-hidden relative">
            <div className="absolute inset-0 bg-blue-900/10 backdrop-blur-[2px]" />
            <Satellite className="w-16 h-16 text-white/5 animate-pulse" />
            <div className="text-white/20 font-bold uppercase tracking-[1em] text-sm animate-pulse">GIS ANALYTICS LAYER</div>
         </div>
      </div>

      {/* Floating Status: Live Personnel Count (Top-Left) */}
      <div className="absolute top-10 left-10 z-20 animate-in slide-in-from-left-4 duration-1000">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 bg-slate-950/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_15px_35px_rgba(0,0,0,0.5)] border-l-4 border-l-[#D4AF37]">
            <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-[#D4AF37]" strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]/60 mb-0.5">Live Personnel Count</div>
              <div className="text-2xl font-black font-mono tracking-tighter text-white tabular-nums">
                {personnelCount.toLocaleString()}
                <span className="text-[10px] text-[#18C29C] font-bold ml-2 uppercase tracking-widest">(+4)</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-[#FF4D6D]/10 backdrop-blur-xl border border-[#FF4D6D]/30 rounded-2xl p-4 shadow-[0_15px_35px_rgba(255,77,109,0.15)] animate-pulse">
            <AlertTriangle className="w-5 h-5 text-[#FF4D6D]" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF4D6D]">Active Incidents</div>
              <div className="text-sm font-mono font-bold text-white uppercase">{activeEvents} CRITICAL REPORTS</div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Tools Sidebar (Bottom Right) */}
      <div className="absolute bottom-10 right-10 z-20 flex flex-col gap-2">
        {[
          { icon: <Target className="w-4 h-4" />, label: "RE-CENTER" },
          { icon: <Radio className="w-4 h-4" />, label: "POLKES STREAM" },
          { icon: <Satellite className="w-4 h-4" />, label: "SATELLITE" },
        ].map((tool, i) => (
          <button key={i} className="w-12 h-12 rounded-xl bg-slate-950/80 backdrop-blur-xl border border-white/10 text-white/50 hover:text-[#D4AF37] hover:border-[#D4AF37]/40 flex items-center justify-center transition-all group/tool relative">
            {tool.icon}
            <div className="absolute right-14 bg-slate-950 px-3 py-1.5 rounded-lg border border-white/10 text-[9px] uppercase tracking-widest opacity-0 group-hover/tool:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
               {tool.label}
            </div>
          </button>
        ))}
      </div>

      {/* HUD Scanner Scan Line */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
         <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent shadow-[0_0_20px_#D4AF37] scan-line-anim" />
      </div>

      {/* Map Compass HUD */}
      <div className="absolute top-10 right-10 opacity-20 pointer-events-none scale-75">
         <div className="w-24 h-24 rounded-full border border-white/20 flex items-center justify-center relative">
            <div className="w-[1px] h-24 bg-white/20 absolute rotate-45" />
            <div className="w-[1px] h-24 bg-white/20 absolute -rotate-45" />
            <div className="w-2 h-2 bg-[#D4AF37] rounded-full" />
            <Navigation className="w-6 h-6 text-white absolute -top-8 animate-pulse" />
         </div>
      </div>
    </div>
  );
}
