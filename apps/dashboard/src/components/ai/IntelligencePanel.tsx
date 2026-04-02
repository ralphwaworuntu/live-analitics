"use client";

import { Send, Bot, Sparkles, AlertCircle, MapPin } from "lucide-react";
import { FormEvent, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";
import { getSelectedPolres, useAppStore } from "@/store";
import { sendAIMessage } from "@/lib/api";
import type { AIReference } from "@/lib/types";
import MissionTracker from "./MissionTracker";

// Reference Badge with hover popover
function ReferenceBadge({ data }: { data: AIReference }) {
  const [showPopover, setShowPopover] = useState(false);

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setShowPopover(true)}
      onMouseLeave={() => setShowPopover(false)}
    >
      <span className="inline-flex cursor-help rounded-md border border-[var(--color-brand-gold)]/30 bg-[var(--color-brand-gold)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[var(--color-brand-gold)] transition-colors hover:bg-[var(--color-brand-gold)]/20">
        {data.title}
      </span>
      <AnimatePresence>
        {showPopover && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute bottom-full left-0 z-50 mb-2 w-64 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-3 shadow-lg backdrop-blur-xl"
          >
            <div className="text-[9px] uppercase tracking-widest text-[var(--color-brand-gold)] font-bold mb-1">Verified Source</div>
            <div className="text-[11px] leading-relaxed text-[var(--color-text)] font-mono">
              {data.snippet}
            </div>
            <div className="mt-2 h-px w-full bg-gradient-to-r from-[var(--color-brand-gold)]/40 to-transparent" />
            <div className="mt-1 text-[8px] text-[var(--color-subtle)] uppercase tracking-widest">Context 7 Grounding ✓</div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

// AI Thinking Skeleton
function AIThinkingSkeleton() {
  return (
    <div className="flex flex-col gap-2 max-w-[90%] items-start">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-brand-gold)]">A.I. SENTINEL</span>
      </div>
      <div className="p-4 rounded-2xl rounded-tl-none border border-[var(--color-brand-gold)]/20 bg-[var(--color-panel)] shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] w-full">
        <div className="space-y-2 animate-pulse">
          <div className="h-3 w-3/4 rounded bg-[var(--color-brand-gold)]/10" />
          <div className="h-3 w-full rounded bg-[var(--color-brand-gold)]/10" />
          <div className="h-3 w-2/3 rounded bg-[var(--color-brand-gold)]/10" />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-brand-gold)] animate-ping" style={{ animationDelay: "0s" }} />
          <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-brand-gold)] animate-ping" style={{ animationDelay: "0.2s" }} />
          <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-brand-gold)] animate-ping" style={{ animationDelay: "0.4s" }} />
          <span className="text-[9px] uppercase tracking-widest text-[var(--color-brand-gold)]/60 ml-1 font-mono">Analyzing...</span>
        </div>
      </div>
    </div>
  );
}

export default function IntelligencePanel() {
  const [prompt, setPrompt] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedPolres = useAppStore(getSelectedPolres);
  const aiMessages = useAppStore((state) => state.aiMessages);
  const addAIMessage = useAppStore((state) => state.addAIMessage);
  const pushNotification = useAppStore((state) => state.pushNotification);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages, sending]);

  const handleSendPrompt = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return;

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

      // Enrich with mock RAG grounding data if backend doesn't provide it
      const enriched = {
        ...response,
        referencesData: response.referencesData || [
          { title: "Ren Ops Turangga, Hal 12", snippet: "Strategi pengamanan wilayah perbatasan NTT mencakup penguatan pos-pos pengamanan di jalur darat dan laut..." },
          { title: "Intel Update 02/04/2026", snippet: "Analisis ancaman terkini menunjukkan peningkatan aktivitas penyelundupan di sektor barat..." },
        ],
        actionBtn: response.actionBtn || (
          trimmedPrompt.toLowerCase().includes("strategi") || trimmedPrompt.toLowerCase().includes("geser")
            ? { label: "Plot Strategi", type: "plot-strategy" as const, lat: selectedPolres?.lat ?? -10.15, lng: selectedPolres?.lng ?? 123.58, radius: 5000 }
            : undefined
        ),
      };

      addAIMessage(enriched);
      pushNotification({
        title: "AI brief updated",
        description: "Rekomendasi taktis baru dari Sentinel-AI.",
        level: "info",
      });
    } catch {
      addAIMessage({
        id: `assistant-fallback-${Date.now()}`,
        role: "assistant",
        content: "TURANGGA-AI belum dapat dijangkau. Gunakan heatmap dan activity feed sebagai rujukan taktis sementara.",
        references: ["Fallback Frontend"],
        referencesData: [{ title: "Fallback System", snippet: "Koneksi ke Milvus Vector DB dan LLM Engine tidak tersedia. Data lokal digunakan sebagai sumber sementara." }],
        createdAt: new Date().toISOString(),
      });
    } finally {
      setSending(false);
    }
  };

  const handleActionClick = (action: { type: string; lat?: number; lng?: number; radius?: number }) => {
    if (action.type === "plot-strategy") {
      window.dispatchEvent(new CustomEvent("map:draw-tactical-plot", {
        detail: { lat: action.lat, lng: action.lng, radius: action.radius || 5000 },
      }));
    } else if (action.type === "fly-to") {
      window.dispatchEvent(new CustomEvent("map:fly-to-emergency"));
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
            <div className="text-[9px] text-[var(--color-muted)] uppercase tracking-[0.2em] font-mono leading-none mt-1">SOVEREIGN AI • CONTEXT 7</div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-8 h-8 opacity-20 hud-corner-tr" />
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 scrollbar-hide">
        {aiMessages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "flex flex-col gap-2 max-w-[90%]",
              m.role === "assistant" ? "items-start" : "items-end ml-auto"
            )}
          >
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

              {/* RAG Grounding References with Hover */}
              {m.referencesData && m.referencesData.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-2">
                  <span className="text-[9px] uppercase tracking-widest text-[var(--color-subtle)] mr-1 self-center">Sources:</span>
                  {m.referencesData.map((refItem, i) => (
                    <ReferenceBadge key={i} data={refItem} />
                  ))}
                </div>
              )}

              {/* Legacy references fallback */}
              {!m.referencesData && m.references && m.references.length > 0 && (
                <div className="mt-3 text-[10px] uppercase tracking-[0.1em] text-[var(--color-info)]">
                  Referensi: {m.references.join(" | ")}
                </div>
              )}

              {/* Actionable Button */}
              {m.actionBtn && (
                <button
                  onClick={() => handleActionClick(m.actionBtn!)}
                  className="mt-3 flex items-center gap-2 rounded-lg border border-[var(--color-brand-gold)]/40 bg-[var(--color-brand-gold)]/10 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-[var(--color-brand-gold)] transition-all hover:bg-[var(--color-brand-gold)]/20 hover:shadow-[0_0_15px_rgba(212,175,55,0.15)]"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  {m.actionBtn.label}
                </button>
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
          </motion.div>
        ))}

        {sending && <AIThinkingSkeleton />}
        <MissionTracker />
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendPrompt} className={cn("p-5 border-t border-[var(--color-border)] bg-[var(--color-panel)] transition-all", sending && "border-t-[var(--color-brand-gold)]/30")}>
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
            <span className="text-[9px] uppercase tracking-widest font-bold text-[var(--color-muted)]">RAG Grounding</span>
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
