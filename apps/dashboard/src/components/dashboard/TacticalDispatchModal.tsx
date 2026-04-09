"use client";

import React, { useState } from "react";
import { useAppStore } from "@/store";
import { X, MapPin, ShieldAlert, Plus, Shield, Info, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { playTacticalSound, triggerHaptic } from "@/lib/tactical-feedback";
import { cn } from "@/lib/utils";
import { NTT_REGIONS_MAPPING, ALL_NTT_SECTORS } from "@/lib/ntt-regions";

interface TacticalDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLocation?: string;
}

export default function TacticalDispatchModal({ isOpen, onClose, initialLocation = "" }: TacticalDispatchModalProps) {
  const dispatchMission = useAppStore(state => state.dispatchMission);
  const pushNotification = useAppStore(state => state.pushNotification);
  const executeAction = useAppStore(state => state.executeAction);
  const polres = useAppStore(state => state.polres);
  const selectedPolresId = useAppStore(state => state.selectedPolresId);
  
  const currentPolres = polres.find(p => p.id === selectedPolresId);
  const sectors = currentPolres ? NTT_REGIONS_MAPPING[currentPolres.name] || [] : ALL_NTT_SECTORS;

  const [form, setForm] = useState({
    title: "",
    location: initialLocation || (sectors.length > 0 ? sectors[0] : "Pilih Wilayah Sektor"),
    category: "Kamtibmas",
    unit: "PATROLI-SABHARA-01"
  });

  // Reset form location if sectors change or modal opens
  React.useEffect(() => {
    if (isOpen) {
      setForm(prev => ({
        ...prev,
        location: initialLocation || (sectors.length > 0 ? sectors[0] : "Pilih Wilayah Sektor")
      }));
    }
  }, [isOpen, selectedPolresId, initialLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title || form.location === "Pilih Wilayah Sektor") {
      pushNotification({
        title: "Manual Dispatch Gagal",
        description: "Mohon isi uraian kejadian dan tentukan lokasi wilayah.",
        level: "warning"
      });
      return;
    }

    // TACTICAL FEEDBACK
    if (typeof window !== "undefined" && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
    playTacticalSound("beep");
    triggerHaptic([20, 40, 20]);

    dispatchMission({
      title: form.title,
      type: form.category,
      description: `[TACTICAL DISPATCH] ${form.category}: ${form.title}`,
      locationName: form.location,
      priority: "High",
      status: "en-route",
      assignedPersonnelId: "P" + Math.floor(Math.random() * 900) + 100,
      unitName: form.unit,
      targetLat: -10.158,
      targetLng: 123.606,
      etaMinutes: 12
    });

    executeAction("DISPATCH_MISSION", {
      unitName: form.unit,
      locationName: form.location
    });

    onClose();
    setForm({ title: "", location: "Pilih Wilayah Sektor", category: "Kamtibmas", unit: "PATROLI-SABHARA-01" });
    
    pushNotification({
       title: "Dispatch Operasional Berhasil",
       description: `Unit ${form.unit} dikerahkan ke ${form.location}.`,
       level: "success"
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          {/* BACKDROP */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#07111F]/80 backdrop-blur-xl"
          />

          {/* CARD MODAL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-[#0B1B32] border border-white/10 rounded-[30px] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-500/20 rounded-xl border border-red-500/30">
                  <ShieldAlert size={20} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">Input Kejadian Taktis</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">SENTINEL-AI Command Module</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors"
                aria-label="Tutup"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                {/* Nama Kejadian */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nama Kejadian / Uraian</label>
                  <input 
                    autoFocus
                    value={form.title}
                    onChange={e => setForm({...form, title: e.target.value})}
                    placeholder="Contoh: Gangguan Kamtibmas Sektor A..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 focus:bg-white/[0.08] transition-all"
                  />
                </div>

                {/* Lokasi Wilayah */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex justify-between">
                    <span>Lokasi Wilayah Sektor</span>
                    {currentPolres && <span className="text-[#D4AF37]">Wilayah: {currentPolres.name}</span>}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-[#D4AF37]/60" size={16} />
                    <select 
                      value={form.location}
                      onChange={e => setForm({...form, location: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 appearance-none font-medium cursor-pointer"
                    >
                      {sectors.length === 0 ? (
                        <option disabled value="Pilih Wilayah Sektor" className="bg-[#0B1B32]">Tidak ada sektor tersedia</option>
                      ) : (
                        sectors.map(s => (
                          <option key={s} value={s} className="bg-[#0B1B32]">{s}</option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                {/* Grid Category & Unit */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kategori Ops</label>
                    <div className="relative">
                      <Layers className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" size={14} />
                      <select 
                        value={form.category}
                        onChange={e => setForm({...form, category: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 appearance-none cursor-pointer"
                      >
                        <option value="Kamtibmas" className="bg-[#0B1B32]">Kamtibmas</option>
                        <option value="Lalin" className="bg-[#0B1B32]">Lalin</option>
                        <option value="Bencana" className="bg-[#0B1B32]">Bencana</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Pilih Unit</label>
                    <div className="relative">
                      <Shield className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" size={14} />
                      <select 
                        value={form.unit}
                        onChange={e => setForm({...form, unit: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 appearance-none cursor-pointer"
                      >
                        <option value="PATROLI-SABHARA-01" className="bg-[#0B1B32]">SABHARA-01</option>
                        <option value="PATROLI-LANTAS-04" className="bg-[#0B1B32]">LANTAS-04</option>
                        <option value="RAIMAS-PIONER-A" className="bg-[#0B1B32]">RAIMAS-PIONER</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-4 rounded-2xl border border-white/10 text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all active:scale-95"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-[2] bg-[#D4AF37] hover:bg-[#EBC145] text-[#07111F] font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xl shadow-[#D4AF37]/10 uppercase tracking-widest text-xs italic"
                >
                  <Plus size={18} className="stroke-[3px]" />
                  + Dispatch Operasional
                </button>
              </div>
            </form>

            <div className="px-8 py-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-center gap-2">
               <Info size={12} className="text-[#D4AF37]" />
               <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">DATA LOKASI REAL-TIME AKAN DIKIRIM KE DASHBOARD UTAMA.</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
