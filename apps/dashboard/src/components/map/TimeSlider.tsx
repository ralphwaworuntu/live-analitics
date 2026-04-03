"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store";
import { BrainCircuit, Sparkles } from "lucide-react";

export default function TimeSlider() {
  const historyTimestamp = useAppStore((state) => state.historyTimestamp);
  const liveMode = useAppStore((state) => state.liveMode);
  const setHistoryTimestamp = useAppStore((state) => state.setHistoryTimestamp);
  const setLiveMode = useAppStore((state) => state.setLiveMode);
  const predictiveMode = useAppStore((state) => state.predictiveMode);
  const setPredictiveMode = useAppStore((state) => state.setPredictiveMode);

  const [currentTimeMinutes, setCurrentTimeMinutes] = useState(0);

  // Sync initial time on mount ONLY to avoid hydration mismatch
  useEffect(() => {
    const d = new Date();
    const initialMinutes = d.getHours() * 60 + d.getMinutes();
    setCurrentTimeMinutes(initialMinutes);
    if (liveMode) {
      setHistoryTimestamp(initialMinutes);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    <div className="rounded-[28px] border border-white/5 bg-slate-950/60 p-5 shadow-3xl backdrop-blur-3xl transition-all hover:bg-slate-950/80 ring-1 ring-white/10">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <div className={`text-[10px] items-center gap-2 font-black uppercase tracking-[0.25em] flex ${predictiveMode ? "text-purple-400" : "text-amber-500"}`}>
            {predictiveMode ? <BrainCircuit className="w-4 h-4" /> : null}
            {predictiveMode ? "AI PREDICTIVE FORECAST" : "TEMPORAL CONTROL"}
          </div>
        </div>
        <div className="metric text-right text-[11px] font-mono font-bold text-white/60 opacity-80">
           {liveMode ? (
             <span className="flex items-center gap-2 text-rose-500 font-black">
               <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
               </span>
               LIVE FEED
             </span>
           ) : <span className="text-amber-500">{formatTime(historyTimestamp)}</span>}
        </div>
      </div>

      <div className="flex items-center gap-4 mt-2">
        <button
          onClick={() => {
            if (predictiveMode) setPredictiveMode(false);
            setLiveMode(!liveMode);
            if (!liveMode) {
              setHistoryTimestamp(currentTimeMinutes);
            }
          }}
          className={`h-10 rounded-xl border px-5 text-[11px] font-black uppercase tracking-widest transition-all ${
            liveMode 
              ? "bg-rose-500/10 border-rose-500/30 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.1)]" 
              : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
          }`}
        >
          {liveMode ? "STOP" : "LIVE"}
        </button>

        <button
          onClick={() => {
            const newState = !predictiveMode;
            setPredictiveMode(newState);
            if (newState) setLiveMode(false);
          } }
          className={`h-10 rounded-xl border px-5 text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
            predictiveMode 
              ? "bg-purple-500/20 border-purple-500/40 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]" 
              : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          PREDIKSI
        </button>

        <div className="relative h-2 flex-1 rounded-full bg-white/5 border border-white/5 overflow-hidden">
          <div
            className={`absolute left-0 top-0 h-full transition-all duration-75 ${
              predictiveMode 
                ? "bg-gradient-to-r from-purple-600 to-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]" 
                : "bg-gradient-to-r from-cyan-600 to-cyan-400"
            }`}
            style={{ width: `${(historyTimestamp / 1439) * 100}%` }}
          />
          <div 
            className="absolute top-0 bottom-0 h-full w-[2px] bg-white/40 z-10 shadow-[0_0_8px_white]"
            style={{ left: `${(currentTimeMinutes / 1439) * 100}%` }}
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
        </div>

        <div className="w-20 text-right text-[11px] font-mono font-bold text-white/30 tabular-nums">
          {Math.floor(historyTimestamp / 60).toString().padStart(2, '0')}:{ (historyTimestamp % 60).toString().padStart(2, '0')}
        </div>
      </div>
    </div>
  );
}
