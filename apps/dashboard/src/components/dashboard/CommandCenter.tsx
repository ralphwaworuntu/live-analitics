"use client";

import { useMemo } from "react";

import GoogleMap from "@/components/map/GoogleMap";
import OSINTPulse from "@/components/map/OSINTPulse";
import TacticalSearch from "@/components/map/TacticalSearch";
import { getSelectedPolres, useAppStore } from "@/store";

export default function CommandCenter() {
  const selectedPolres = useAppStore(getSelectedPolres);
  const kpis = useAppStore((state) => state.kpis);
  const activities = useAppStore((state) => state.activities);
  const notifications = useAppStore((state) => state.notifications);
  const emergency = useAppStore((state) => state.emergency);
  const heatmapEnabled = useAppStore((state) => state.heatmapEnabled);
  const setHeatmapEnabled = useAppStore((state) => state.setHeatmapEnabled);
  const liveMode = useAppStore((state) => state.liveMode);
  const setLiveMode = useAppStore((state) => state.setLiveMode);
  const sandboxMode = useAppStore((state) => state.sandboxMode);
  const setSandboxMode = useAppStore((state) => state.setSandboxMode);
  const osintEnabled = useAppStore((state) => state.osintEnabled);
  const setOsintEnabled = useAppStore((state) => state.setOsintEnabled);



  const visibleActivities = useMemo(() => activities.slice(0, 5), [activities]);
  const priorityNotifications = useMemo(() => notifications.slice(0, 3), [notifications]);

  return (
    <div className={`relative h-full w-full overflow-hidden bg-[var(--color-bg)] text-[var(--color-text)] transition-all duration-500 ${
      sandboxMode ? "border-[6px] border-cyan-500/50 shadow-[inset_0_0_100px_rgba(6,182,212,0.1)]" : ""
    }`}>
      {/* GLOBAL TACTICAL SEARCH */}
      <TacticalSearch />

      {/* GIS MAP CONTAINER - TIER 0 BACKBONE */}
      <div className="absolute inset-0 z-0">
        <GoogleMap />
      </div>

      {/* OSINT DATA LAYER */}
      <OSINTPulse />

      {/* OVERLAY TACTICAL HUD */}
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-4 sm:p-6">
        
        {/* TOP HUD: Command Title & Posture */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="pointer-events-auto glass-card max-w-xl p-4 shadow-[var(--shadow-float)] backdrop-blur-2xl">
            <div className="eyebrow">Pusat Komando Daerah</div>
            <h1 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-[var(--color-text)]">
              {selectedPolres ? `Operasi: ${selectedPolres.name}` : "Tactical Operating Picture Polda NTT"}
            </h1>
            <p className="mt-1 text-xs text-[var(--color-muted)] leading-relaxed">
              Sistem visual state terpusat. Peta taktis, feed insiden, dan command AI tersinkronisasi.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <div className="command-chip">
                <strong>{selectedPolres ? selectedPolres.name : "Tinjauan Regional"}</strong>
                <span>{selectedPolres ? "Fokus Wilayah" : "Seluruh Yurisdiksi"}</span>
              </div>
              <div className="command-chip">
                <strong>{emergency.active ? "Status Darurat" : "Postur Normal"}</strong>
                <span>{priorityNotifications.length} Siaga</span>
              </div>
              {sandboxMode && (
                <div className="command-chip !border-cyan-500/50 !bg-cyan-500/10 !text-cyan-400 animate-pulse">
                  <strong>WARGAMING MODE</strong>
                  <span>Simulasi Aktif</span>
                </div>
              )}
            </div>
          </div>

          <div className="pointer-events-auto flex items-start gap-2">
             <StatusTile
              label="Postur"
              value={selectedPolres ? selectedPolres.status.toUpperCase() : emergency.active ? "EMERGENCY" : "KONDUSIF"}
              tone={emergency.active ? "danger" : selectedPolres?.status === "kontinjensi" ? "danger" : selectedPolres?.status === "waspada" ? "warning" : "success"}
            />
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setHeatmapEnabled(!heatmapEnabled)}
                className={`pointer-events-auto rounded-xl border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all shadow-md ${
                  heatmapEnabled
                    ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)] text-white"
                    : "border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-muted)]"
                }`}
              >
                Layer Panas
              </button>
              <button
                onClick={() => setLiveMode(!liveMode)}
                className={`pointer-events-auto rounded-xl border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all shadow-md ${
                  liveMode
                    ? "border-[var(--color-success)] bg-[var(--color-success)]/18 text-[var(--color-success)]"
                    : "border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-muted)]"
                }`}
              >
                {liveMode ? "Data Langsung" : "Tayangan Ulang"}
              </button>
              <button
                onClick={() => setSandboxMode(!sandboxMode)}
                className={`pointer-events-auto rounded-xl border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all shadow-md ${
                  sandboxMode
                    ? "border-cyan-500 bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                    : "border-white/10 bg-slate-900/40 text-white/40"
                }`}
              >
                Sandbox
              </button>
              <button
                onClick={() => setOsintEnabled(!osintEnabled)}
                className={`pointer-events-auto rounded-xl border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all shadow-md ${
                  osintEnabled
                    ? "border-orange-500 bg-orange-500 text-white"
                    : "border-white/10 bg-slate-900/40 text-white/40"
                }`}
              >
                OSINT Pulse
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM HUD: Metrics & Incident Queue */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
           {/* LEFT BOTTOM: KPIs */}
           <div className="pointer-events-auto grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4 lg:w-auto">
             {kpis.map((kpi) => (
                <MetricCard key={kpi.id} {...kpi} />
             ))}
           </div>

           {/* RIGHT BOTTOM: Live Feed */}
           <div className="pointer-events-auto flex w-full max-w-sm flex-col gap-3 lg:w-auto">
             {priorityNotifications.length > 0 && (
               <div className="glass-card max-h-[22vh] overflow-y-auto p-4 shadow-[var(--shadow-glow-danger)] border-[var(--color-danger)]/40 scrollbar-hide">
                  <div className="eyebrow mb-3 !text-[var(--color-danger)] text-[9px] uppercase">Peringatan Prioritas</div>
                  <div className="space-y-2">
                    {priorityNotifications.map((item) => (
                      <div key={item.id} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
                        <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-danger)]">{item.level}</div>
                        <div className="mt-1 text-xs font-semibold">{item.title}</div>
                      </div>
                    ))}
                  </div>
               </div>
             )}

             <div className="glass-card max-h-[30vh] overflow-y-auto p-4 shadow-[var(--shadow-float)] scrollbar-hide">
                <div className="eyebrow mb-3">Laporan Insiden (Live)</div>
                <div className="flex flex-col gap-2">
                   {visibleActivities.map((item) => (
                     <EventItem key={item.id} {...item} />
                   ))}
                </div>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  change,
  changeType,
  subtitle,
}: {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  subtitle: string;
}) {
  const tone = {
    positive: "text-[var(--color-success)]",
    negative: "text-[var(--color-danger)]",
    neutral: "text-[var(--color-info)]",
  }[changeType];

  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[9px] uppercase tracking-[0.2em] text-[var(--color-subtle)] line-clamp-1">{title}</div>
          <div className="metric mt-1 text-xl font-bold text-[var(--color-text)]">{value}</div>
        </div>
        <div className={`rounded-lg px-2 py-0.5 text-[9px] font-bold ${tone} bg-[var(--color-surface)]`}>
          {change}
        </div>
      </div>
      <div className="mt-1 text-[10px] text-[var(--color-muted)] line-clamp-1">{subtitle}</div>
    </div>
  );
}

function StatusTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "success" | "warning" | "danger" | "info";
}) {
  const accent = {
    success: "text-[var(--color-success)] border-[var(--color-success)]/26",
    warning: "text-[var(--color-brand-gold)] border-[var(--color-brand-gold)]/26",
    danger: "text-[var(--color-danger)] border-[var(--color-danger)]/26",
    info: "text-[var(--color-info)] border-[var(--color-info)]/26",
  }[tone];

  return (
      <div className={`rounded-xl border bg-[var(--color-panel)] p-3 ${accent} shadow-md backdrop-blur-xl shrink-0`}>
        <div className="text-[9px] uppercase tracking-[0.2em] text-[var(--color-subtle)]">{label}</div>
        <div className="mt-1 text-sm font-bold">{value}</div>
      </div>
  );
}

function EventItem({
  time,
  title,
  location,
  status,
}: {
  time: string;
  title: string;
  location: string;
  status: "success" | "info" | "danger" | "warning";
}) {
  const statusColors = {
    success: "bg-[var(--color-success)]",
    info: "bg-[var(--color-info)]",
    danger: "bg-[var(--color-danger)]",
    warning: "bg-[var(--color-brand-gold)]",
  };

  return (
    <div className="flex gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
      <div className="mt-1 flex flex-col items-center">
        <div className={`h-2 w-2 rounded-full ${statusColors[status]}`} />
        <div className="mt-1 h-full w-px bg-[var(--color-border)]" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="text-xs font-semibold text-[var(--color-text)] line-clamp-1 border-b border-transparent">{title}</div>
          <div className="metric text-[9px] uppercase tracking-[0.1em] text-[var(--color-subtle)] shrink-0">{time}</div>
        </div>
        <div className="mt-0.5 text-[10px] text-[var(--color-muted)] line-clamp-1">{location}</div>
      </div>
    </div>
  );
}
