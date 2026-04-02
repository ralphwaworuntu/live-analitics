"use client";

import { Send, Bot, Sparkles, AlertCircle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function IntelligencePanel() {
  const [messages] = useState([
    { 
      role: "bot", 
      text: "Sistem Sentinel-AI aktif. Menunggu instruksi strategis untuk wilayah hukum Polda NTT.",
      time: "22:55:01 WITA"
    },
    { 
      role: "bot", 
      text: "Laporan Intelijen: Terdeteksi konsentrasi massa di Labuan Bajo menjelang KTT. Tingkatkan pemantauan personil di sektor 4.",
      time: "22:55:12 WITA"
    }
  ]);

  return (
    <div className="h-full flex flex-col bg-slate-950/40 backdrop-blur-md border-l border-white/5 relative overflow-hidden">
      {/* Tactical HUD Header */}
      <div className="p-5 border-b border-white/5 bg-[#0B1B32]/40 relative">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#D4AF37]/5 border border-[#D4AF37]/20 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.05)]">
            <Bot className="w-5 h-5 text-[#D4AF37]" strokeWidth={1} />
          </div>
          <div>
            <div className="text-[12px] font-extrabold tracking-[0.25em] text-[#D4AF37] uppercase">INTELLIGENCE UNIT</div>
            <div className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-mono leading-none mt-1">SENTINEL-AI STREAM</div>
          </div>
        </div>
        {/* HUD Elements */}
        <div className="absolute top-0 right-0 w-8 h-8 opacity-20 hud-corner-tr" />
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 scrollbar-hide">
        {messages.map((m, i) => (
          <div key={i} className={cn(
            "flex flex-col gap-2 max-w-[85%]",
            m.role === "bot" ? "items-start" : "items-end ml-auto"
          )}>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]/60">
                {m.role === "bot" ? "A.I. SENTINEL" : "COMMANDER"}
              </span>
              <span className="text-[8px] font-mono text-white/10">{m.time}</span>
            </div>
            
            <div className={cn(
              "p-4 rounded-2xl text-[13px] leading-relaxed border transition-all",
              m.role === "bot" 
                ? "bg-[#0B1B32]/40 border-white/5 text-white/70 rounded-tl-none shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]" 
                : "bg-[#D4AF37]/10 border-[#D4AF37]/30 text-white rounded-tr-none"
            )}>
              {m.text}
            </div>
            
            {m.role === "bot" && (
              <div className="flex gap-2">
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-10 h-1 bg-white/[0.03] rounded-full" />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-5 border-t border-white/5 bg-slate-950/20">
        <div className="relative group">
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-[#D4AF37]/20 via-transparent to-transparent opacity-0 group-focus-within:opacity-100 transition-all" />
          <input 
            type="text" 
            placeholder="Ketik perintah taktis..."
            className="w-full bg-[#0B1B32]/80 border border-white/10 rounded-2xl h-14 pl-6 pr-14 text-sm text-white focus:outline-none focus:border-[#D4AF37]/40 placeholder:text-white/10 transition-all font-mono"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-[#D4AF37] hover:bg-[#B8962E] text-[#07111F] flex items-center justify-center transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center justify-center gap-6 mt-4 opacity-30 group">
          <div className="flex gap-1.5 items-center">
            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
            <span className="text-[9px] uppercase tracking-widest font-bold">Vector Analysis</span>
          </div>
          <div className="flex gap-1.5 items-center">
            <AlertCircle className="w-3 h-3 text-red-500" />
            <span className="text-[9px] uppercase tracking-widest font-bold">Threat Monitor</span>
          </div>
        </div>
      </div>
    </div>
  );
}
