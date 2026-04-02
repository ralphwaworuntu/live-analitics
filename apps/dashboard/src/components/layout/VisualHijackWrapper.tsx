"use client";

import { getSelectedPolres, useAppStore } from "@/store";

export default function VisualHijackWrapper({ children }: { children: React.ReactNode }) {
  const emergency = useAppStore((state) => state.emergency);
  const selectedPolres = useAppStore(getSelectedPolres);

  return (
    <div
      className={`flex min-h-screen bg-[var(--color-bg)] transition-all duration-300 ${
        emergency.active ? "visual-hijack-active" : ""
      }`}
    >
      {emergency.active ? (
        <div className="fixed left-1/2 top-20 z-[100] -translate-x-1/2 animate-[fade-in_0.3s_ease]">
          <div className="glass-card flex items-center gap-4 border-[var(--color-danger)] bg-white px-6 py-4 shadow-[var(--shadow-glow-danger)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-danger)]/12 text-sm font-semibold text-[var(--color-danger)]">
              SOS
            </div>
            <div>
              <h2 className="text-lg font-bold uppercase tracking-[0.18em] text-[var(--color-danger)]">
                Urgent: {emergency.message}
              </h2>
              <p className="text-sm font-mono text-[var(--color-text)]">
                {emergency.location}
                {selectedPolres ? ` | Fokus ${selectedPolres.name}` : ""}
              </p>
            </div>
          </div>
        </div>
      ) : null}
      {children}
    </div>
  );
}
