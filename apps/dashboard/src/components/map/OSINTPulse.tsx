"use client";

import { useAppStore } from "@/store";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, MessageSquare, TrendingUp, Newspaper } from "lucide-react";

export default function OSINTPulse() {
  const osintSignals = useAppStore((state) => state.osintSignals);
  const osintEnabled = useAppStore((state) => state.osintEnabled);

  if (!osintEnabled) return null;

  const trends = ["#DemoKupang", "Blokade Soe", "Brimob BKO", "Panen Gagal", "NTT Melawan"];

  return (
    <div className="absolute bottom-24 left-80 z-20 w-64 pointer-events-none">
      <div className="pointer-events-auto rounded-2xl border border-orange-500/30 bg-slate-950/80 p-3 shadow-[0_0_20px_rgba(249,115,22,0.15)] backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-3 px-1">
          <Radio className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-orange-400 font-bold">OSINT Intelligence Pulse</span>
        </div>

        {/* Viral Trends */}
        <div className="mb-4">
          <div className="text-[8px] uppercase tracking-widest text-white/40 mb-2 font-mono">Trending NTT Keywords</div>
          <div className="flex flex-wrap gap-1.5">
            {trends.map((t, i) => (
              <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/70 hover:border-orange-500/30 hover:text-orange-400 transition-colors cursor-default">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Signals List */}
        <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-hide">
          {osintSignals.map((sig) => (
            <motion.div
              key={sig.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-2 rounded-lg border leading-tight ${
                sig.sentiment === "provocative" || sig.sentiment === "negative"
                  ? "border-orange-500/40 bg-orange-500/10"
                  : "border-white/5 bg-white/5"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-bold text-orange-400 uppercase flex items-center gap-1">
                  {sig.source === "X" ? <MessageSquare className="w-2.5 h-2.5" /> : <Newspaper className="w-2.5 h-2.5" />}
                  {sig.source} Signal
                </span>
                <span className="text-[8px] font-mono text-white/30">{new Date(sig.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <p className="text-[10px] text-white/80 line-clamp-2">{sig.content}</p>
              <div className="mt-1 flex items-center justify-between">
                 <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden mr-2">
                    <div className="h-full bg-orange-500" style={{ width: `${sig.viralScore}%` }} />
                 </div>
                 <span className="text-[8px] text-orange-400/70 font-bold uppercase">{sig.sentiment}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
