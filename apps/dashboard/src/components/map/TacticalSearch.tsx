"use client";

import * as React from "react";
import { useAppStore } from "@/store";
import { Search, MapPin, User, ShieldAlert, Command } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TacticalSearch() {
  const [open, setOpen] = React.useState(false);
  const searchQuery = useAppStore((state) => state.searchQuery);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  const searchResults = useAppStore((state) => state.searchResults);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (result: any) => {
    // If location, trigger store select
    if (result.type === "location") {
      useAppStore.getState().setSelectedPolres(result.id);
      window.dispatchEvent(new CustomEvent('map:draw-tactical-plot', { 
        detail: { lat: result.lat, lng: result.lng, radius: 2000 } 
      }));
    }
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <>
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <button
          onClick={() => setOpen(true)}
          className="pointer-events-auto flex items-center gap-6 rounded-full border border-white/10 bg-slate-950/60 pl-4 pr-3 py-2.5 backdrop-blur-xl shadow-2xl group transition-all hover:bg-slate-950/80 hover:border-white/20"
        >
          <div className="flex items-center gap-3">
            <Search className="w-4 h-4 text-white/40 group-hover:text-white/70" />
            <span className="text-[13px] text-white/40 group-hover:text-white/60 tracking-wide font-medium pr-8">
              Cari NRP, Insiden, atau Koordinat...
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
            <Command className="w-3 h-3 text-white/30" />
            <span className="text-[10px] font-bold text-white/30">K</span>
          </div>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-24 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-slate-950/90 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 px-6 py-5 border-b border-white/5">
                <Search className="w-5 h-5 text-blue-400/60" />
                <input
                  autoFocus
                  placeholder="Ketik perintah taktis atau cari entitas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-lg text-white placeholder-white/20 outline-none font-medium"
                />
              </div>

              <div className="max-h-[420px] overflow-y-auto p-2 scrollbar-hide">
                {searchResults.length === 0 ? (
                  <div className="px-6 py-10 text-center">
                    <p className="text-sm text-white/30 font-medium">
                      {searchQuery.length < 2 ? "Ketik minimal 2 karakter untuk memulai..." : "Tidak ada hasil ditemukan."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {searchResults.map((res) => (
                      <button
                        key={res.id}
                        onClick={() => handleSelect(res)}
                        className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2.5 rounded-lg border flex items-center justify-center ${
                             res.type === "location" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                             res.type === "personnel" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                             res.type === "command" ? "bg-purple-500/10 border-purple-500/20 text-purple-400" :
                             "bg-white/5 border-white/10 text-white/50"
                          }`}>
                            {res.type === "location" && <MapPin className="w-4.5 h-4.5" />}
                            {res.type === "personnel" && <User className="w-4.5 h-4.5" />}
                            {res.type === "command" && <Command className="w-4.5 h-4.5" />}
                            {res.type === "incident" && <ShieldAlert className="w-4.5 h-4.5" />}
                          </div>
                          <div className="text-left">
                            <div className="text-[14px] font-bold text-white uppercase tracking-tight">{res.title}</div>
                            <div className="text-[11px] text-white/40 uppercase tracking-widest font-mono mt-0.5">{res.subtitle}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-2 py-1 rounded bg-white/5 group-hover:text-white/40">
                           {res.type}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-5 py-3 bg-slate-900/50 border-t border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                       <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/50 font-bold">ESC</span>
                       <span className="text-[10px] text-white/30 uppercase font-bold">TUTUP</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                       <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/50 font-bold">ENTER</span>
                       <span className="text-[10px] text-white/30 uppercase font-bold">PILIH</span>
                    </div>
                 </div>
                 <div className="text-[9px] text-[var(--color-brand-gold)] font-bold uppercase tracking-widest opacity-60">
                    Tactical Search Dashboard 4.0
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
