"use client";

import { getSelectedPolres, useAppStore } from "@/store";
import { useEmergencySound } from "@/hooks/useEmergencySound";

export default function VisualHijackWrapper({ children }: { children: React.ReactNode }) {
  const emergency = useAppStore((state) => state.emergency);
  const clearEmergency = useAppStore((state) => state.clearEmergency);
  const selectedPolres = useAppStore(getSelectedPolres);

  useEmergencySound();

  return (
    <div
      className={`relative flex min-h-screen w-full bg-[var(--color-bg)] transition-all duration-300 ${
        emergency.active ? "after:pointer-events-none after:absolute after:inset-0 after:z-50 after:border-4 after:border-[var(--color-danger)] after:animate-[pulse-danger_2s_ease-in-out_infinite]" : ""
      }`}
    >
      {emergency.active ? (
        <div className="fixed left-1/2 top-20 z-[100] -translate-x-1/2 animate-[fade-in_0.3s_ease]">
          <div className="glass-card flex items-center gap-4 border-red-500/50 bg-slate-950/90 px-6 py-4 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/20 text-sm font-semibold text-red-500">
              SOS
            </div>
            <div>
              <h2 className="text-lg font-bold uppercase tracking-[0.18em] text-red-500">
                Status Kontinjensi: {emergency.message}
              </h2>
              <p className="text-sm font-mono text-slate-300 font-medium">
                {emergency.location}
                {emergency.lat && emergency.lng ? ` | GPS: ${emergency.lat.toFixed(4)}, ${emergency.lng.toFixed(4)}` : ""}
                {selectedPolres ? ` | Fokus: ${selectedPolres.name}` : ""}
              </p>
              <div className="mt-3 flex gap-3 pointer-events-auto">
                <button
                  onClick={() => {
                    // MapController in GoogleMap.tsx will handle flying to emergency coordinates
                    window.dispatchEvent(new CustomEvent('map:fly-to-emergency'));
                  }}
                  className="rounded bg-red-600 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white shadow hover:bg-red-500 transition-colors"
                >
                  Buka Komando
                </button>
                <button
                  onClick={clearEmergency}
                  className="rounded border border-red-500/30 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-300 hover:bg-red-500/10 hover:text-white transition-colors"
                >
                  Abaikan
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {children}
    </div>
  );
}
