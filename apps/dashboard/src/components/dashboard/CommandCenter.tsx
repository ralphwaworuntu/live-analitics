"use client";

import GoogleMap from "@/components/map/GoogleMap";
import OSINTPulse from "@/components/map/OSINTPulse";
import TacticalSearch from "@/components/map/TacticalSearch";
import TimeSlider from "@/components/map/TimeSlider";
import IntelligencePanel from "@/components/ai/IntelligencePanel";
import { getSelectedPolres, useAppStore } from "@/store";

export default function CommandCenter() {
  const selectedPolres = useAppStore(getSelectedPolres);
  const kpis = useAppStore((state) => state.kpis);
  const emergency = useAppStore((state) => state.emergency);
  const heatmapEnabled = useAppStore((state) => state.heatmapEnabled);
  const setHeatmapEnabled = useAppStore((state) => state.setHeatmapEnabled);
  const sandboxMode = useAppStore((state) => state.sandboxMode);
  const setSandboxMode = useAppStore((state) => state.setSandboxMode);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 text-white">
      
      {/* LAYER 0: BACKGROUND (GIS MAP) */}
      <div className="absolute inset-0 z-0 bg-slate-900">
        <GoogleMap />
      </div>

      {/* LAYER 10: TACTICAL HUD (SLOT-BASED POSITIONING) */}
      
      {/* SLOT: TOP-LEFT (Operating Picture & Controls) */}
      <div className="absolute top-6 left-6 z-10 w-80 pointer-events-auto">
        <div className="glass-card p-4 shadow-2xl backdrop-blur-2xl border-white/10">
          <div className="eyebrow !text-[8px] opacity-50">SENTINEL COMMAND GRID</div>
          <h1 className="mt-1.5 text-md font-bold text-white uppercase tracking-tight leading-tight">
            {selectedPolres ? selectedPolres.name : "Polda NTT Operating Picture"}
          </h1>
          
          <div className="mt-3 flex flex-wrap gap-1.5">
            <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-bold text-[var(--color-brand-gold)] uppercase tracking-widest">
              {selectedPolres ? "Fokus" : "Regional"}
            </div>
            <div className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-widest ${
              emergency.active ? "bg-red-500/20 border-red-500/40 text-red-400 animate-pulse" : "bg-green-500/10 border-green-500/20 text-green-400"
            }`}>
              {emergency.active ? "Emergency" : "Kondusif"}
            </div>
          </div>

          {/* INTEGRATED HEAT/SIM TOGGLES */}
          <div className="mt-5 grid grid-cols-2 gap-1.5 h-10">
            <button
              onClick={() => setHeatmapEnabled(!heatmapEnabled)}
              className={`rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all ${
                heatmapEnabled ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)] text-white shadow-[0_0_15px_rgba(31,103,204,0.3)]" : "border-white/5 bg-white/5 text-white/30"
              }`}
            >
              Heat Map
            </button>
            <button
              onClick={() => setSandboxMode(!sandboxMode)}
              className={`rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all ${
                sandboxMode ? "border-cyan-500 bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]" : "border-white/5 bg-white/5 text-white/30"
              }`}
            >
              Simulate
            </button>
          </div>
        </div>
      </div>

      {/* SLOT: LEFT-MIDDLE (Status & OSINT) */}
      <div className="absolute top-64 left-6 z-10 w-80 pointer-events-auto flex flex-col gap-3">
        {kpis.slice(0, 2).map((kpi) => (
           <MetricCard key={kpi.id} {...kpi} />
        ))}
        <OSINTPulse />
      </div>

      {/* SLOT: TOP-CENTER (Tactical Search) */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 w-[450px] pointer-events-auto">
        <TacticalSearch />
      </div>

      {/* SLOT: RIGHT (Intelligence Unit) */}
      <div className="absolute top-6 right-6 bottom-6 z-10 w-[380px] pointer-events-auto">
         <div className="h-full rounded-[28px] border border-white/5 bg-slate-950/40 backdrop-blur-3xl shadow-2xl overflow-hidden">
            <IntelligencePanel />
         </div>
      </div>

      {/* SLOT: BOTTOM (Temporal Control) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-auto min-w-[800px] pointer-events-auto">
        <TimeSlider />
      </div>

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
    positive: "text-[var(--color-success)]",
    negative: "text-[var(--color-danger)]",
    neutral: "text-[var(--color-info)]",
  }[changeType];

  return (
    <div className="glass-card p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[8px] uppercase tracking-wider text-[var(--color-subtle)] line-clamp-1">{title}</div>
          <div className="text-sm font-bold text-white mt-0.5">{value}</div>
        </div>
        <div className={`rounded px-1 py-0.5 text-[8px] font-bold ${toneClass} bg-white/5 border border-white/5`}>
          {change}
        </div>
      </div>
    </div>
  );
}




