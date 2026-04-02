"use client";

import { useAppStore } from "@/store";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation, Clock, CheckCircle2, ShieldAlert } from "lucide-react";

export default function MissionTracker() {
  const activeMissions = useAppStore((state) => state.activeMissions);

  if (activeMissions.length === 0) return null;

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Navigation className="w-3.5 h-3.5 text-[var(--color-brand-gold)]" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-brand-gold)] font-bold">Active Missions (C2)</span>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
        <AnimatePresence>
          {activeMissions.map((mission) => (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-3 shadow-lg"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="text-[11px] font-bold text-white uppercase tracking-wider">{mission.title}</div>
                <StatusBadge status={mission.status} />
              </div>

              <div className="text-[10px] text-[var(--color-muted)] line-clamp-2 mb-3">
                Target: {mission.description}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-[var(--color-subtle)]" />
                  <span className="text-[9px] font-mono text-[var(--color-subtle)] uppercase">ETA: {mission.etaMinutes} MIN</span>
                </div>
                <div className="text-[9px] font-mono text-[var(--color-brand-gold)] opacity-70">
                  ID: {mission.assignedPersonnelId}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    "en-route": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    "on-site": "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "completed": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  };
  
  const icons = {
    "en-route": <Navigation className="w-2.5 h-2.5" />,
    "on-site": <ShieldAlert className="w-2.5 h-2.5" />,
    "completed": <CheckCircle2 className="w-2.5 h-2.5" />,
  };

  const label = status.replace("-", " ").toUpperCase();

  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[8px] font-bold tracking-widest ${styles[status as keyof typeof styles]}`}>
      {icons[status as keyof typeof icons]}
      {label}
    </span>
  );
}
