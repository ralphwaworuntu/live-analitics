"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Plus, MapPin, AlertTriangle, Shield, ClipboardList } from "lucide-react";
import { useAppStore } from "@/store";
import { TableSkeleton } from "@/components/ui/skeleton";
import { playTacticalSound, triggerHaptic } from "@/lib/tactical-feedback";
import { motion, AnimatePresence } from "framer-motion";

export default function MissionView() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const activeMissions = useAppStore(state => state.activeMissions);
  const dispatchMission = useAppStore(state => state.dispatchMission);
  const pushNotification = useAppStore(state => state.pushNotification);
  const executeAction = useAppStore(state => state.executeAction);

  const [form, setForm] = useState({ title: "", locationOffset: "", unitName: "Auto-Assign (Rekomendasi AI)" });

  useEffect(() => {
     // Simulate initial loading
     const timer = setTimeout(() => setIsLoading(false), 1200);
     return () => clearTimeout(timer);
  }, []);

  const handleDispatch = () => {
    if (!form.title.trim() || !form.locationOffset.trim()) {
      pushNotification({
        title: "Validasi Gagal",
        description: "Nama Misi dan Lokasi wajib diisi untuk mendispatch unit.",
        level: "warning"
      });
      return;
    }

    dispatchMission({
      title: form.title,
      type: form.title,
      description: form.title,
      locationName: form.locationOffset,
      priority: "Medium",
      status: "en-route",
      assignedPersonnelId: "P00" + Math.floor(Math.random() * 9),
      unitName: form.unitName,
      targetLat: -10.158,
      targetLng: 123.606,
      etaMinutes: Math.floor(Math.random() * 15) + 5,
    });
    
    executeAction("DISPATCH_MISSION", { 
      unitName: form.unitName, 
      locationName: form.locationOffset 
    });
    
    setIsDialogOpen(false);
    setForm({ title: "", locationOffset: "", unitName: "Auto-Assign (Rekomendasi AI)" });

    // TACTICAL FEEDBACK
    playTacticalSound("beep");
    triggerHaptic([20, 50, 20]);
  };

  const [showRadial, setShowRadial] = useState(false);

  const quickReports = [
    { label: "Laka", color: "bg-blue-500", icon: <Shield size={16} /> },
    { label: "Kriminal", color: "bg-red-500", icon: <AlertTriangle size={16} /> },
    { label: "Bencana", color: "bg-amber-500", icon: <MapPin size={16} /> },
  ];

  return (
    <div className="p-3 sm:p-4 md:p-6 h-full flex flex-col relative overflow-hidden">
      
      {/* Neural Alerts Quick Radial Control (Mobile) */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {showRadial && (
            <div className="absolute bottom-0 right-0 w-48 h-48 pointer-events-none">
              {quickReports.map((report, i) => {
                const angle = (i * 60) + 210; // Position them in an arc
                const rad = (angle * Math.PI) / 180;
                const dist = 80;
                const x = Math.cos(rad) * dist;
                const y = Math.sin(rad) * dist;

                return (
                  <motion.button
                    key={report.label}
                    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                    animate={{ opacity: 1, scale: 1, x, y }}
                    exit={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                    className={cn(
                      "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full shadow-2xl flex flex-col items-center justify-center text-white p-0 pointer-events-auto border-2 border-white/20",
                      report.color
                    )}
                    onClick={() => {
                      pushNotification({ title: `Quick Report: ${report.label}`, description: "Draft report created via Neural Radial Menu.", level: "info" });
                      setShowRadial(false);
                      triggerHaptic([50]);
                    }}
                  >
                    {report.icon}
                    <span className="text-[6px] font-black uppercase tracking-tighter">{report.label}</span>
                  </motion.button>
                );
              })}
            </div>
          )}
        </AnimatePresence>
        
        <motion.button
          whileTap={{ scale: 0.9 }}
          onContextMenu={(e) => { e.preventDefault(); setShowRadial(!showRadial); }}
          onClick={() => setShowRadial(!showRadial)}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl border-2 transition-all duration-300",
            showRadial ? "bg-white text-slate-900 border-white rotate-45" : "bg-[#D4AF37] text-slate-900 border-[#D4AF37]"
          )}
        >
          <Plus size={28} />
        </motion.button>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 md:mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-1">Pusat Misi & Dispatch</h2>
          <p className="text-slate-400 text-xs sm:text-sm">Pantau dan kendalikan unit operasional di lapangan.</p>
        </div>
        <button 
          onClick={() => setIsDialogOpen(true)}
          className="bg-[#D4AF37] hover:bg-[#b8952b] text-slate-900 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer min-h-[44px] shrink-0 w-full sm:w-auto justify-center sm:justify-start shadow-lg shadow-black/40"
        >
          <Plus size={18} />
          Buat Misi Baru
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6 min-h-0">
        {/* Table Area */}
        <div className="xl:col-span-2 bg-[#0B1B32] border border-white/10 rounded-xl overflow-hidden flex flex-col relative">
          
          {isLoading ? (
            <TableSkeleton rows={8} cols={5} />
          ) : activeMissions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in duration-500">
               <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/5 shadow-inner">
                  <ClipboardList size={40} className="text-slate-600" />
               </div>
               <h3 className="text-lg font-black text-white uppercase tracking-tighter italic">Tidak Ada Misi Aktif</h3>
               <p className="text-slate-500 text-xs sm:text-sm max-w-xs mt-2 font-bold uppercase tracking-widest leading-relaxed">Saat ini wilayah terpantau kondusif. Seluruh unit stand-by di titik kumpul.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">ID</th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Kejadian</th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Lokasi</th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Unit</th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {activeMissions.map((mission) => {
                      const isSOS = mission.status === "SOS/Darurat";
                      return (
                        <tr 
                          key={mission.id} 
                          className={cn(
                            "hover:bg-white/5 transition-colors group",
                            isSOS && "bg-red-950/20 animate-sos-pulse border-y border-red-500/30"
                          )}
                        >
                          <td className="px-4 py-4 font-mono text-[10px] text-slate-500 group-hover:text-slate-300 transition-colors uppercase italic">{mission.id}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              {isSOS && <AlertTriangle size={14} className="text-red-500 animate-pulse" />}
                              <span className="text-xs font-bold text-slate-200 uppercase">{mission.type || mission.title}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-xs text-slate-400 group-hover:text-white transition-colors">{mission.locationName}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-[#D4AF37] uppercase">
                              <Shield size={12} /> {mission.unitName}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border",
                              isSOS 
                                ? "bg-red-500/20 text-red-500 border-red-500/30 animate-pulse" 
                                : mission.status === "on-site"
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                            )}>
                              {mission.status}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile: Stacked Cards */}
              <div className="md:hidden overflow-y-auto p-3 space-y-3">
                <AnimatePresence>
                  {activeMissions.map((mission) => {
                    const isSOS = mission.status === "SOS/Darurat";
                    return (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={mission.id} 
                        className={cn(
                          "bg-white/5 border border-white/10 rounded-xl p-4 transition-all",
                          isSOS && "border-red-500/40 bg-red-950/40 animate-sos-pulse"
                        )}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-mono text-[11px] text-slate-500 uppercase italic">{mission.id}</span>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                            isSOS 
                              ? "bg-red-500/20 text-red-500 border-red-500/30"
                              : mission.status === "on-site"
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          )}>
                            {mission.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-white uppercase italic flex items-center gap-1.5">
                          {isSOS && <AlertTriangle size={14} className="text-red-500 shrink-0 animate-pulse" />}
                          {mission.type || mission.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-tight">{mission.locationName}</p>
                        <div className="flex items-center gap-1.5 mt-2 text-[10px] font-black text-[#D4AF37] uppercase">
                          <Shield size={12} /> {mission.unitName}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>

        {/* Map Preview */}
        <div className="bg-[#0B1B32] border border-white/10 rounded-xl relative overflow-hidden flex flex-col min-h-[200px] md:min-h-0">
          <div className="absolute inset-0 bg-slate-800/40">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
          </div>
          <div className="relative z-10 p-3 sm:p-4 border-b border-white/10 bg-[#0B1B32]/80 backdrop-blur-sm">
            <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
              <MapPin size={16} className="text-[#D4AF37]" />
              Interactive Map Preview
            </h3>
          </div>
          <div className="flex-1 relative z-10 flex items-center justify-center p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center relative animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <div className="absolute -top-10 bg-[#0B1B32] border border-red-500/50 text-xs px-2 py-1 rounded text-red-400 whitespace-nowrap shadow-lg">
                SOS / Darurat
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dispatch Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDialogOpen(false)} />
          <div className="bg-[#0B1B32] border border-white/10 w-full max-w-lg rounded-xl shadow-2xl relative z-10 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Buat Misi Baru</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Nama Kejadian</label>
                <input 
                  type="text" 
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]" 
                  placeholder="Contoh: Pengamanan Demo" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Lokasi (Geotagging)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={form.locationOffset}
                    onChange={(e) => setForm({ ...form, locationOffset: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]" 
                    placeholder="Pilih Koordinat / Polsek..." 
                  />
                  <button className="bg-white/10 border border-white/10 rounded-lg px-3 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                     <MapPin size={18} className="text-slate-300" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Pilih Unit (Radius Terdekat)</label>
                <select 
                  value={form.unitName}
                  onChange={(e) => setForm({ ...form, unitName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37] appearance-none cursor-pointer"
                >
                  <option className="bg-[#0B1B32]">Auto-Assign (Rekomendasi AI)</option>
                  <option className="bg-[#0B1B32]">Patroli 01 (0.8 km)</option>
                  <option className="bg-[#0B1B32]">Dalmas Pleton 2 (2.1 km)</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">
              <button 
                onClick={() => setIsDialogOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button 
                onClick={handleDispatch}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-[#D4AF37] hover:bg-[#b8952b] text-slate-900 transition-colors shadow-lg shadow-[#D4AF37]/20 border border-[#D4AF37] cursor-pointer"
              >
                Kirim Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
