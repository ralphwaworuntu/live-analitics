"use client";

import { useMemo } from "react";

import { useAppStore } from "@/store";

export default function TimeSlider() {
  const timeRangeHours = useAppStore((state) => state.timeRangeHours);
  const liveMode = useAppStore((state) => state.liveMode);
  const setTimeRangeHours = useAppStore((state) => state.setTimeRangeHours);
  const setLiveMode = useAppStore((state) => state.setLiveMode);

  const value = useMemo(() => Math.round((timeRangeHours / 24) * 100), [timeRangeHours]);

  const formatTime = (percent: number) => {
    const now = new Date();
    const hoursBack = Math.round(((100 - percent) / 100) * 24);
    const target = new Date(now.getTime() - hoursBack * 60 * 60 * 1000);
    return `${target.getHours().toString().padStart(2, "0")}:${target.getMinutes().toString().padStart(2, "0")} WITA`;
  };

  return (
    <div className="absolute bottom-6 left-1/2 z-10 w-[92%] max-w-3xl -translate-x-1/2 sm:w-[86%]">
      <div className="rounded-[26px] border border-[var(--color-border)] bg-[rgba(255,255,255,0.96)] px-4 py-4 shadow-[var(--shadow-float)] backdrop-blur-xl sm:px-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">Temporal Control</div>
            <div className="mt-1 text-sm text-[var(--color-text)] sm:text-[15px]">Histori kejadian 24 jam</div>
          </div>
          <div className="metric text-right text-xs font-semibold text-[var(--color-brand-primary)]">
            {liveMode ? "Realtime Live" : formatTime(value)}
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            title="Toggle live mode"
            onClick={() => setLiveMode(!liveMode)}
            className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text)] transition-colors hover:border-[var(--color-brand-primary)]/40"
          >
            {liveMode ? "Live" : "Play"}
          </button>

          <div className="relative h-1.5 flex-1 rounded-full bg-[var(--color-surface-3)]">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-[linear-gradient(90deg,var(--color-brand-primary),var(--color-brand-gold))] transition-all duration-100"
              style={{ width: `${value}%` }}
            />
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={value}
              onChange={(event) => {
                const nextValue = Number.parseInt(event.target.value, 10);
                setLiveMode(nextValue >= 96);
                setTimeRangeHours(Math.max(1, Math.round((nextValue / 100) * 24)));
              }}
              className="absolute left-0 top-0 h-full w-full cursor-pointer opacity-0"
            />
            <div
              className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-[var(--color-brand-primary)] bg-white shadow-md transition-all duration-100"
              style={{ left: `calc(${value}% - 8px)` }}
            />
          </div>

          <div className="w-14 text-right text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)] sm:w-16">
            {timeRangeHours} jam
          </div>
        </div>
      </div>
    </div>
  );
}
