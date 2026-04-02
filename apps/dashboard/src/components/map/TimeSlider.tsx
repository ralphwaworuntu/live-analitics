"use client";

import { useMemo, useEffect, useState } from "react";
import { useAppStore } from "@/store";

export default function TimeSlider() {
  const historyTimestamp = useAppStore((state) => state.historyTimestamp);
  const liveMode = useAppStore((state) => state.liveMode);
  const setHistoryTimestamp = useAppStore((state) => state.setHistoryTimestamp);
  const setLiveMode = useAppStore((state) => state.setLiveMode);

  const [currentTimeMinutes, setCurrentTimeMinutes] = useState(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });

  useEffect(() => {
    // Current time indicator updates every minute
    const interval = setInterval(() => {
      const d = new Date();
      setCurrentTimeMinutes(d.getHours() * 60 + d.getMinutes());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60).toString().padStart(2, "0");
    const mins = (minutes % 60).toString().padStart(2, "0");
    return `${hrs}:${mins} WITA`;
  };

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number.parseInt(event.target.value, 10);
    setHistoryTimestamp(val);
    if (val >= currentTimeMinutes - 2) {
      setLiveMode(true);
    } else {
      setLiveMode(false);
    }
  };

  return (
    <div className="absolute bottom-6 left-1/2 z-10 w-[92%] max-w-3xl -translate-x-1/2 sm:w-[86%]">
      <div className="rounded-[26px] border border-[var(--color-border)] bg-[rgba(11,27,50,0.85)] px-4 py-4 shadow-[var(--shadow-float)] backdrop-blur-xl sm:px-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-brand-gold)]">Temporal Control</div>
            <div className="mt-1 text-sm text-[var(--color-text)] sm:text-[15px]">Scrub Histori Patroli</div>
          </div>
          <div className="metric text-right text-xs font-semibold text-[var(--color-brand-gold)]">
             {liveMode ? (
               <span className="flex items-center gap-2">
                 <span className="relative flex h-2 w-2">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-danger)] opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-danger)]"></span>
                 </span>
                 LIVE
               </span>
             ) : formatTime(historyTimestamp)}
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 mt-2">
          <button
            title="Toggle live mode"
            onClick={() => {
              setLiveMode(!liveMode);
              if (!liveMode) {
                setHistoryTimestamp(currentTimeMinutes);
              }
            }}
            className="rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text)] transition-colors hover:border-[var(--color-brand-gold)]/40 hover:text-[var(--color-brand-gold)]"
          >
            {liveMode ? "LIVE" : "PLAY"}
          </button>

          <div className="relative h-1.5 flex-1 rounded-full bg-[var(--color-surface-3)]">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-[linear-gradient(90deg,var(--color-brand-primary),var(--color-brand-gold))] transition-all duration-75"
              style={{ width: `${(historyTimestamp / 1439) * 100}%` }}
            />
            {/* Current Time Indicator */}
            <div 
              className="absolute top-1/2 h-3 w-1 -translate-y-1/2 bg-white/70 shadow-[0_0_8px_rgba(255,255,255,0.5)] z-0 rounded-full"
              style={{ left: `${(currentTimeMinutes / 1439) * 100}%` }}
              title="Waktu Saat Ini"
            />

            <input
              type="range"
              min="0"
              max="1439"
              step="1"
              value={historyTimestamp}
              onChange={handleSliderChange}
              className="absolute left-0 top-0 h-full w-full cursor-pointer opacity-0 z-20"
            />
            <div
              className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-[var(--color-brand-gold)] bg-[var(--color-panel)] shadow-md transition-all duration-75 z-10"
              style={{ left: `calc(${(historyTimestamp / 1439) * 100}% - 8px)` }}
            />
          </div>

          <div className="w-14 text-right text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)] sm:w-16">
            {Math.floor(historyTimestamp / 60)}j {historyTimestamp % 60}m
          </div>
        </div>
      </div>
    </div>
  );
}
