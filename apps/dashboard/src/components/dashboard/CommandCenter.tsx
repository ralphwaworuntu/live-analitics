"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PanelRightClose, PanelRightOpen } from "lucide-react";

import GoogleMap from "@/components/map/GoogleMap";
import TacticalSearch from "@/components/map/TacticalSearch";
import TimeSlider from "@/components/map/TimeSlider";
import IntelligencePanel from "@/components/ai/IntelligencePanel";
import LiveReportTicker from "@/components/map/LiveReportTicker";
import { getSelectedPolres, useAppStore } from "@/store";

export default function CommandCenter() {
  const selectedPolres = useAppStore(getSelectedPolres);
  const kpis = useAppStore((state) => state.kpis);
  const emergency = useAppStore((state) => state.emergency);
  const heatmapEnabled = useAppStore((state) => state.heatmapEnabled);
  const setHeatmapEnabled = useAppStore((state) => state.setHeatmapEnabled);
  const sandboxMode = useAppStore((state) => state.sandboxMode);
  const setSandboxMode = useAppStore((state) => state.setSandboxMode);
  
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-[#020617] text-white">
      
      {/* KIRI - The Map Core */}
      <div className="relative flex-1 h-full bg-black">
        <GoogleMap />
        
        {/* Floating Search Bar di atas peta */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[400px] z-50">
          <TacticalSearch />
        </div>

        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-950/80 text-white shadow-2xl backdrop-blur-xl transition-all hover:bg-slate-900 hover:border-white/20"
        >
          {sidebarOpen ? <PanelRightClose className="h-5 w-5 opacity-70" /> : <PanelRightOpen className="h-5 w-5 opacity-70 cursor-pointer" />}
        </button>
      </div>

      {/* KANAN - Unified Command Sidebar */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 420, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="h-full border-l border-white/10 bg-[#0B1B32] flex flex-col overflow-y-auto custom-scrollbar p-6 gap-6 origin-right shrink-0"
          >
            
            {/* 1. Header Identity: SectorA1Card */}
        <div className="glass-card p-4 rounded-xl shadow-lg bg-slate-950/60 border-white/10 ring-1 ring-white/5">
          <div className="flex items-center justify-between mb-2">
             <div className="eyebrow !text-[8px] tracking-[0.3em] opacity-40">SENTINEL • CMD ROOM</div>
             <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_cyan]" />
          </div>
          <h1 className="text-sm font-black uppercase tracking-tight leading-tight">
            {selectedPolres ? selectedPolres.name : "Polda NTT Sector A1"}
          </h1>
          <div className="mt-0.5 text-[9px] text-white/40 uppercase tracking-widest font-mono">
             Regional Threat Assessment Ready
          </div>
          
          <div className="mt-3 flex flex-wrap gap-2">
            <div className={`px-2 py-0.5 rounded border text-[8px] font-black uppercase tracking-[0.15em] transition-all ${
              emergency.active 
                ? "bg-red-500/20 border-red-500/40 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse" 
                : "bg-green-500/10 border-green-500/20 text-green-400"
            }`}>
              {emergency.active ? "Crisis Mode" : "Nominal Status"}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 h-9">
            <button
              onClick={() => setHeatmapEnabled(!heatmapEnabled)}
              className={`group relative overflow-hidden rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all ${
                heatmapEnabled 
                  ? "border-amber-500/50 bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)]" 
                  : "border-white/5 bg-white/5 text-white/40 hover:bg-white/10"
              }`}
            >
              <span className="relative z-10">Heat Map</span>
            </button>
            <button
              onClick={() => setSandboxMode(!sandboxMode)}
              className={`group relative overflow-hidden rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all ${
                sandboxMode 
                  ? "border-cyan-500/50 bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]" 
                  : "border-white/5 bg-white/5 text-white/40 hover:bg-white/10"
              }`}
            >
              <span className="relative z-10">Simulate</span>
            </button>
          </div>
        </div>

        {/* 2. Stats Section*/}
        <div className="flex gap-4">
          {kpis.slice(0, 2).map((kpi) => (
             <div key={kpi.id} className="flex-1">
                 <MetricCard {...kpi} />
             </div>
          ))}
        </div>

        {/* 3. Intelligence Unit */}
        <div className="flex-1 min-h-[350px]">
           <div className="h-full rounded-2xl border border-white/5 bg-slate-950/60 shadow-xl overflow-hidden ring-1 ring-white/10">
              <IntelligencePanel />
           </div>
        </div>

        {/* 4. Activity Log */}
        <div className="w-full">
           <LiveReportTicker />
        </div>

        {/* 5. Control Center */}
        <div className="w-full shrink-0">
           <TimeSlider />
        </div>

          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function MetricCard({
  title,
  value,
  change,
  changeType,
}: {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
}) {
  const toneClass = {
    positive: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
    negative: "text-rose-400 border-rose-500/20 bg-rose-500/10",
    neutral: "text-amber-400 border-amber-500/20 bg-amber-500/10",
  }[changeType];

  return (
    <div className="glass-card p-3 rounded-xl border border-white/5 bg-slate-950/60 backdrop-blur-md shadow-lg transition-all text-white">
      <div className="flex items-center justify-between pointer-events-none">
        <div>
          <div className="text-[8px] uppercase tracking-[0.2em] text-white/40 font-bold mb-0.5">{title}</div>
          <div className="text-lg font-mono font-bold tracking-tight text-white/90">{value}</div>
        </div>
        <div className={`rounded px-1.5 py-0.5 text-[8px] font-black border tracking-widest ${toneClass}`}>
          {change}
        </div>
      </div>
    </div>
  );
}




