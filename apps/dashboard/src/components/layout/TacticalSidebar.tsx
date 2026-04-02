"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  Map as MapIcon, 
  BrainCircuit, 
  Shield, 
  Settings, 
  HardDrive,
  FileText,
  Users,
  Car,
  Package,
  AlertCircle
} from "lucide-react";
import { navGroups } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { useFloatingWindows } from "@/components/layout/FloatingWindowsManager";
import { ComparisonWindow } from "@/components/dashboard/ComparisonWindow";

import { useAppStore } from "@/store";
import { useState } from "react";
import AnevReportDialog from "@/components/dashboard/AnevReportDialog";

export default function TacticalSidebar() {
  const pathname = usePathname();
  const setSelectedPolres = useAppStore((state) => state.setSelectedPolres);
  const polres = useAppStore((state) => state.polres);
  const { addWindow } = useFloatingWindows();
  const [anevOpen, setAnevOpen] = useState(false);

  const handleOpenComparison = () => {
    // Pick first two unique active polres or fallback to default
    const p1 = polres[0]?.id || "kupang-kota";
    const p2 = polres[1]?.id || "manggarai-barat";
    
    addWindow(
      "comparison-main",
      "Tactical Comparison Matrix",
      <ComparisonWindow polresA={p1} polresB={p2} />
    );
  };

  return (
    <>
    <aside className="h-full flex flex-col bg-[var(--color-bg-elevated)]/80 backdrop-blur-2xl border-r border-[var(--color-border)] relative overflow-hidden transition-all duration-300">
      {/* Tactical Glow Overlay */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent opacity-60" />
      
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-slate-950/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0B1B32] border border-[#D4AF37]/30 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.1)]">
            <Shield className="w-6 h-6 text-[#D4AF37]" strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-sm font-bold tracking-[0.2em] text-[#D4AF37] uppercase">SENTINEL</div>
            <div className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-mono leading-none mt-1">COMMAND GRID</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-8">
            <div className="flex items-center gap-2 mb-4 px-2">
              <div className="w-1 h-3 bg-[#D4AF37]/40 rounded-full" />
              <div className="text-[10px] font-extrabold uppercase tracking-[0.4em] text-[#D4AF37]/60">
                {group.title}
              </div>
            </div>
            
            <ul className="space-y-1.5">
              {group.items.map((item) => {
                const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={() => {
                        if (item.href.startsWith("/polres/")) {
                           setSelectedPolres(item.href.split("/").pop() ?? null);
                        } else if (item.href === "/") {
                           setSelectedPolres(null);
                        }
                      }}
                      className={cn(
                        "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 relative overflow-hidden",
                        isActive 
                          ? "bg-[var(--color-brand-gold)]/10 text-[var(--color-text)] border border-[var(--color-brand-gold)]/20 shadow-[0_0_20px_rgba(212,175,55,0.05)]" 
                          : "text-[var(--color-muted)] hover:bg-white/[0.03] hover:text-[var(--color-text)]"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-300",
                        isActive 
                          ? "bg-[var(--color-brand-gold)]/20 border-[var(--color-brand-gold)]/40 text-[var(--color-brand-gold)]" 
                          : "bg-[var(--color-panel)] border-[var(--color-border)] text-[var(--color-subtle)] group-hover:border-[var(--color-border-hover)] group-hover:text-[var(--color-muted)]"
                      )}>
                        {getIconForCategory(item.id, item.label)}
                      </div>
                      <span className="text-[13px] font-medium tracking-wide flex-1">{item.label}</span>
                      {isActive && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-[var(--color-brand-gold)] rounded-l-full shadow-[0_0_10px_var(--color-brand-gold)]" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {/* DSP Inventory (Logistics Hub) */}
        <div className="mx-4 mb-6">
          <div className="flex items-center gap-2 mb-4 px-1">
            <Package className="w-3.5 h-3.5 text-[var(--color-brand-gold)]" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-brand-gold)] font-bold">Logistics & DSP Hub</span>
          </div>
          
          <div className="space-y-3">
            {polres.slice(0, 3).map((p) => {
              const real = p.online || 0;
              const dsp = p.personnel || 0;
              const ratio = dsp > 0 ? real / dsp : 0;
              const isLow = ratio < 0.3; // Threshold for alert

              return (
                <div 
                  key={p.id}
                  className={`rounded-xl border p-3 transition-colors ${
                    isLow 
                      ? "border-yellow-500/40 bg-yellow-500/5 animate-pulse" 
                      : "border-white/5 bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider">{p.name}</span>
                    {isLow && <AlertCircle className="w-3 h-3 text-yellow-500" />}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[8px] text-[var(--color-muted)] uppercase tracking-widest mb-1">Personnel Strength</span>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-2.5 h-2.5 text-[var(--color-brand-gold)]/60" />
                        <span className="text-[11px] font-mono text-white">{real} / {dsp}</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] text-[var(--color-muted)] uppercase tracking-widest mb-1">Patrol Fleet</span>
                      <div className="flex items-center gap-1.5">
                        <Car className="w-2.5 h-2.5 text-blue-400/60" />
                        <span className="text-[11px] font-mono text-white">{Math.floor(real / 5)} Unit</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${isLow ? "bg-yellow-500" : "bg-[var(--color-success)]"}`}
                      style={{ width: `${ratio * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer System Status */}
      <div className="p-4 border-t border-white/5 bg-slate-950/30 flex flex-col gap-3">
        <button
          onClick={handleOpenComparison}
          className="w-full py-2.5 rounded-lg border border-[var(--color-brand-gold)]/40 bg-[var(--color-brand-gold)]/10 text-[xs] font-bold uppercase tracking-[0.2em] text-[var(--color-brand-gold)] hover:bg-[var(--color-brand-gold)]/20 transition-colors shadow-[0_0_10px_rgba(212,175,55,0.1)] flex items-center justify-center gap-2"
        >
          <BarChart3 className="w-4 h-4" />
          Bandingkan
        </button>

        <button
          onClick={() => setAnevOpen(true)}
          className="w-full py-2.5 rounded-lg border border-white/10 bg-white/5 text-[xs] font-bold uppercase tracking-[0.2em] text-[var(--color-text)] hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Generate Anev
        </button>

        <div className="bg-[#0B1B32]/50 rounded-xl p-3 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold">System Status</span>
            <div className="flex gap-0.5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#18C29C]/40 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
          <div className="text-[10px] font-mono text-[#D4AF37]/60 tracking-wider">SECURE CONNECTION: ESTABLISHED</div>
        </div>
      </div>
    </aside>
    
    <AnevReportDialog open={anevOpen} onClose={() => setAnevOpen(false)} />
    </>
  );
}

function getIconForCategory(id: string, label: string) {
  if (id === "dashboard") return <BarChart3 className="w-4 h-4" />;
  if (id === "map") return <MapIcon className="w-4 h-4" />;
  if (id === "ai-chat") return <BrainCircuit className="w-4 h-4" />;
  if (id === "reports") return <HardDrive className="w-4 h-4" />;
  if (id === "settings") return <Settings className="w-4 h-4" />;
  
  // For Polres items, return initials
  return (
    <span className="text-[8px] font-bold">
      {label.split(" ").slice(1).map(p => p[0]).join("") || "P"}
    </span>
  );
}
