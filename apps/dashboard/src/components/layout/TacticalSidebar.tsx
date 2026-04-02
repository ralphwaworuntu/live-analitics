"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  Map as MapIcon, 
  BrainCircuit, 
  Shield, 
  Settings, 
  HardDrive
} from "lucide-react";
import { navGroups } from "@/lib/nav";
import { cn } from "@/lib/utils";

export default function TacticalSidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-full flex flex-col bg-slate-950/40 backdrop-blur-md border-r border-white/5 relative overflow-hidden">
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
                      className={cn(
                        "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 relative overflow-hidden",
                        isActive 
                          ? "bg-[#D4AF37]/10 text-white border border-[#D4AF37]/20 shadow-[0_0_20px_rgba(212,175,55,0.05)]" 
                          : "text-white/40 hover:bg-white/[0.03] hover:text-white/70"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-300",
                        isActive 
                          ? "bg-[#D4AF37]/20 border-[#D4AF37]/40 text-[#D4AF37]" 
                          : "bg-white/[0.02] border-white/5 text-white/20 group-hover:border-white/10 group-hover:text-white/40"
                      )}>
                        {getIconForCategory(item.id, item.label)}
                      </div>
                      <span className="text-[13px] font-medium tracking-wide flex-1">{item.label}</span>
                      {isActive && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-[#D4AF37] rounded-l-full shadow-[0_0_10px_#D4AF37]" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer System Status */}
      <div className="p-4 border-t border-white/5 bg-slate-950/30">
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
