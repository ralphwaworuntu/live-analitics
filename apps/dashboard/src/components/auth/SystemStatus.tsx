"use client";

import { useState, useEffect } from "react";

const BOOT_LOGS = [
  "Initializing SENTINEL Core OS...",
  "Loading Tactical Design Tokens...",
  "Establishing Secure Connection to Polda NTT Servers...",
  "Checking GPU Clusters for AI Modules [A100]...",
  "Ollama loaded. LLM Engine Ready.",
  "YOLOv8 Vision Service Connected.",
  "PostGIS Database Online.",
  "[System Ready] Awaiting Operator Authorization."
];

const CYCLING_MESSAGES = [
  "Kamtibmas Status: KONDUSIF",
  "21 Polres: 19 Online, 2 Sync Pending",
  "AI Engine: Idle — Awaiting Context",
  "Polda NTT Secure Network Active"
];

export function SystemStatus() {
  const [time, setTime] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [bootComplete, setBootComplete] = useState(false);
  const [cycleMsg, setCycleMsg] = useState("");

  useEffect(() => {
    // Clock
    const timer = setInterval(() => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) +
        " WITA - " +
        now.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()
      );
    }, 1000);
    
    // Boot sequence
    let step = 0;
    const bootInterval = setInterval(() => {
      if (step < BOOT_LOGS.length) {
        setLogs(prev => [...prev, BOOT_LOGS[step]]);
        step++;
      } else {
        clearInterval(bootInterval);
        setBootComplete(true);
      }
    }, 400); // 400ms per step

    return () => {
      clearInterval(timer);
      clearInterval(bootInterval);
    };
  }, []);

  useEffect(() => {
    if (!bootComplete) return;
    let idx = 0;
    setCycleMsg(CYCLING_MESSAGES[idx]);
    const cycleInterval = setInterval(() => {
      idx = (idx + 1) % CYCLING_MESSAGES.length;
      setCycleMsg(CYCLING_MESSAGES[idx]);
    }, 3000);
    return () => clearInterval(cycleInterval);
  }, [bootComplete]);

  const progress = Math.min((logs.length / BOOT_LOGS.length) * 100, 100);

  return (
    <div className="mt-8 lg:mt-12 flex flex-col gap-4 sm:gap-5 max-w-md w-full">
      {/* Dynamic Clock */}
      <div className="flex items-center gap-3 text-[#D4AF37] font-mono text-xs sm:text-sm tracking-widest bg-[#0E2442]/60 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl border border-[#D4AF37]/30 border-l-4 border-l-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.1)] w-fit backdrop-blur-md">
        <svg className="w-4 h-4 sm:w-5 sm:h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {time || "SYNCING CLOCK..."}
      </div>
      
      {/* Boot Terminal UI */}
      <div className="bg-[#050B14]/90 border border-white/10 rounded-xl p-3 sm:p-5 h-[140px] sm:h-[160px] flex flex-col relative shadow-[inset_0_2px_20px_rgba(0,0,0,0.5)] backdrop-blur-md">
        <div className="flex-1 overflow-hidden flex flex-col justify-end relative z-0 mb-3">
          <div className="absolute top-0 left-0 w-full h-10 bg-gradient-to-b from-[#050B14] to-transparent z-10 pointer-events-none" />
          
          <div className="space-y-1.5 font-mono text-[9px] sm:text-[11px] text-[#A9B9D6] leading-relaxed">
            {logs.map((log, i) => (
              <div key={i} className="flex gap-2 sm:gap-3 animate-in fade-in slide-in-from-bottom-1 duration-300">
                <span className="text-white/20 shrink-0">[{new Date().toISOString().substring(11, 19)}]</span>
                <span className="text-[#18C29C] shrink-0">{(i === BOOT_LOGS.length - 1 && bootComplete) ? "🟩" : "🟨"}</span>
                <span className={i === BOOT_LOGS.length - 1 ? "text-[#18C29C] font-semibold" : "text-white/70"}>{log}</span>
              </div>
            ))}
            {!bootComplete && (
              <div className="flex gap-2 sm:gap-3 mt-1.5">
                <span className="text-white/20 shrink-0">[{new Date().toISOString().substring(11, 19)}]</span>
                <span className="text-[#D4AF37] shrink-0">⬜</span>
                <span className="animate-pulse w-2 h-3 sm:h-3.5 bg-[#A9B9D6]" />
              </div>
            )}
            {bootComplete && (
              <div className="flex gap-2 sm:gap-3 mt-2 pt-2 border-t border-white/10 opacity-80 animate-in fade-in">
                <span className="text-white/20 shrink-0">[{new Date().toISOString().substring(11, 19)}]</span>
                <span className="text-[#0B4AA2] shrink-0">ℹ️</span>
                <span className="text-[#A9B9D6] font-semibold tracking-wide animate-pulse">{cycleMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden shrink-0">
          <div 
            className="h-full bg-[#18C29C] transition-all duration-300 shadow-[0_0_8px_#18C29C]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
