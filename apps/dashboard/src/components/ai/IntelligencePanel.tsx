"use client";

import { Send, Bot, Sparkles, AlertCircle } from "lucide-react";
import { FormEvent, useState } from "react";

import { cn } from "@/lib/utils";
import { getSelectedPolres, useAppStore } from "@/store";
import { sendAIMessage } from "@/lib/api";

export default function IntelligencePanel() {
  const [prompt, setPrompt] = useState("");
  const [sending, setSending] = useState(false);

  const selectedPolres = useAppStore(getSelectedPolres);
  const aiMessages = useAppStore((state) => state.aiMessages);
  const addAIMessage = useAppStore((state) => state.addAIMessage);
  const pushNotification = useAppStore((state) => state.pushNotification);

  const handleSendPrompt = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      return;
    }

    addAIMessage({
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmedPrompt,
      createdAt: new Date().toISOString(),
    });
    setPrompt("");
    setSending(true);

    try {
      const response = await sendAIMessage({
        polresId: selectedPolres?.id ?? "all",
        message: trimmedPrompt,
      });

      addAIMessage(response);
      pushNotification({
        title: "AI brief updated",
        description: `Rekomendasi taktis baru dari Sentinel-AI.`,
        level: "info",
      });
    } catch {
      addAIMessage({
        id: `assistant-fallback-${Date.now()}`,
        role: "assistant",
        content:
          "TURANGGA-AI belum dapat dijangkau. Gunakan heatmap dan activity feed sebagai rujukan taktis sementara.",
        references: ["Fallback Frontend"],
        createdAt: new Date().toISOString(),
      });
    } finally {
      setSending(false);
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return new Date().toLocaleTimeString("id", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " WITA";
    const date = new Date(isoString);
    return date.toLocaleTimeString("id", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " WITA";
  };

  return (
    <div className="h-full flex flex-col bg-[var(--color-bg-elevated)] backdrop-blur-md border-l border-white/5 relative overflow-hidden">
      {/* Tactical HUD Header */}
      <div className="p-5 border-b border-[var(--color-border)] bg-[var(--color-panel)] relative">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[var(--color-brand-gold)]/10 border border-[var(--color-brand-gold)]/20 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.05)]">
            <Bot className="w-5 h-5 text-[var(--color-brand-gold)]" strokeWidth={1} />
          </div>
          <div>
            <div className="text-[12px] font-extrabold tracking-[0.25em] text-[var(--color-brand-gold)] uppercase">INTELLIGENCE UNIT</div>
            <div className="text-[9px] text-[var(--color-muted)] uppercase tracking-[0.2em] font-mono leading-none mt-1">SENTINEL-AI STREAM</div>
          </div>
        </div>
        {/* HUD Elements */}
        <div className="absolute top-0 right-0 w-8 h-8 opacity-20 hud-corner-tr" />
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 scrollbar-hide">
        {aiMessages.map((m) => (
          <div key={m.id} className={cn(
            "flex flex-col gap-2 max-w-[90%]",
            m.role === "assistant" ? "items-start" : "items-end ml-auto"
          )}>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-brand-gold)]">
                {m.role === "assistant" ? "A.I. SENTINEL" : "COMMANDER"}
              </span>
              <span className="text-[8px] font-mono text-[var(--color-subtle)]">{formatTime(m.createdAt)}</span>
            </div>
            
            <div className={cn(
              "p-4 rounded-2xl text-[13px] leading-relaxed border transition-all",
              m.role === "assistant" 
                ? "bg-[var(--color-panel)] border-[var(--color-border)] text-[var(--color-text)] rounded-tl-none shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]" 
                : "bg-[var(--color-brand-gold)]/10 border-[var(--color-brand-gold)]/30 text-white rounded-tr-none"
            )}>
              <div className="whitespace-pre-wrap">{m.content}</div>
              
              {m.references && m.references.length > 0 && (
                 <div className="mt-3 text-[10px] uppercase tracking-[0.1em] text-[var(--color-info)]">
                    Referensi: {m.references.join(" | ")}
                 </div>
              )}
            </div>
            
            {m.role === "assistant" && (
              <div className="flex gap-2">
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-10 h-1 bg-[var(--color-border)] rounded-full" />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendPrompt} className="p-5 border-t border-[var(--color-border)] bg-[var(--color-panel)]">
        <div className="relative group">
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-[var(--color-brand-gold)]/20 via-transparent to-transparent opacity-0 group-focus-within:opacity-100 transition-all" />
          <input 
            type="text" 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={sending}
            placeholder={
               selectedPolres
                 ? `Instruksi untuk ${selectedPolres.name}...`
                 : "Ketik perintah taktis..."
             }
            className="w-full bg-[var(--color-surface-2)]/80 border border-[var(--color-border)] rounded-2xl h-14 pl-6 pr-14 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-brand-gold)]/40 placeholder:text-[var(--color-subtle)] transition-all font-mono disabled:opacity-60"
          />
          <button 
            type="submit" 
            disabled={sending}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-[var(--color-brand-gold)] hover:bg-[#B8962E] text-[var(--color-bg)] flex items-center justify-center transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] disabled:opacity-60"
           >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center justify-center gap-6 mt-4 opacity-50 group">
          <div className="flex gap-1.5 items-center">
            <Sparkles className="w-3 h-3 text-[var(--color-brand-gold)]" />
            <span className="text-[9px] uppercase tracking-widest font-bold text-[var(--color-muted)]">Vector Analysis</span>
          </div>
          <div className="flex gap-1.5 items-center">
            <AlertCircle className="w-3 h-3 text-[var(--color-danger)]" />
            <span className="text-[9px] uppercase tracking-widest font-bold text-[var(--color-muted)]">Threat Monitor</span>
          </div>
        </div>
      </form>
    </div>
  );
}
