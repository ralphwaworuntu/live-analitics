"use client";

import React, { useState } from "react";
import { useAppStore } from "@/store";
import { X, MapPin, Shield, Plus, Info, AlertOctagon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { playTacticalSound, triggerHaptic } from "@/lib/tactical-feedback";
import { cn } from "@/lib/utils";

interface EventInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLocation?: string;
}

export default function EventInputModal({ isOpen, onClose, initialLocation = "" }: EventInputModalProps) {
  const dispatchMission = useAppStore(state => state.dispatchMission);
  const pushNotification = useAppStore(state => state.pushNotification);
  const executeAction = useAppStore(state => state.executeAction);
  
  const [form, setForm] = useState({
    title: "",
    category: "Kamtibmas",
    location: initialLocation,
    priority: "Medium" as "Low" | "Medium" | "High" | "Critical",
    unit: "PATROLI-SABHARA-01"
  });

  const getWitaTimestamp = () => {
    return new Date().toLocaleString("id-ID", { timeZone: "Asia/Makassar" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title || !form.location) {
      pushNotification({
        title: "Validasi Gagal",
        description: "Mohon lengkapi Nama Kejadian dan Lokasi Wilayah.",
        level: "warning"
      });
      return;
    }

    const wita = getWitaTimestamp();

    dispatchMission({
      title: form.title,
      type: form.category,
      description: `[WITA: ${wita}] ${form.category}: ${form.title}`,
      locationName: form.location,
      priority: form.priority,
      status: "en-route",
      assignedPersonnelId: "P" + Math.floor(Math.random() * 1000),
      unitName: form.unit,
      targetLat: -10.158 + (Math.random() - 0.5) * 0.05,
      targetLng: 123.606 + (Math.random() - 0.5) * 0.05,
      etaMinutes: 10
    });

    executeAction("DISPATCH_MISSION", {
      unitName: form.unit,
      locationName: form.location,
      timestamp: wita
    });

    playTacticalSound("beep");
    triggerHaptic([30, 60, 30]);
    onClose();
    setForm({ title: "", category: "Kamtibmas", location: initialLocation, priority: "Medium", unit: "PATROLI-SABHARA-01" });
    
    pushNotification({
       title: "Kejadian Berhasil Didispatch",
       description: `Unit ${form.unit} sedang menuju ${form.location}.`,
       level: "success"
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="relative w-full max-w-lg bg-[#0B1B32] border border-white/10 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-5 bg-white/5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#D4AF37]/20 rounded-xl border border-[#D4AF37]/30">
                  <AlertOctagon size={20} className="text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Input Kejadian Baru</h3>
                  <p className="text-[10px] text-[#D4AF37] font-black uppercase tracking-tighter opacity-80">Command Center Dispatch Terminal</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nama Kejadian</label>
                  <input 
                    autoFocus
                    value={form.title}
                    onChange={e => setForm({...form, title: e.target.value})}
                    placeholder="Masukkan uraian singkat kejadian..."
                    className="w-full bg-[#07111F] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 transition-all font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kategori</label>
                    <select 
                      value={form.category}
                      onChange={e => setForm({...form, category: e.target.value})}
                      className="w-full bg-[#07111F] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 appearance-none font-medium cursor-pointer"
                    >
                      <option value="Kamtibmas">Kamtibmas</option>
                      <option value="Lalin">Lalin</option>
                      <option value="Bencana">Bencana</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Prioritas</label>
                    <select 
                      value={form.priority}
                      onChange={e => setForm({...form, priority: e.target.value as any})}
                      className="w-full bg-[#07111F] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 appearance-none font-medium cursor-pointer"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical (SOS)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Lokasi Wilayah</label>
                  <div className="relative">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-[#D4AF37]/60" size={18} />
                    <input 
                      value={form.location}
                      onChange={e => setForm({...form, location: e.target.value})}
                      placeholder="Input lokasi atau unit polres..."
                      className="w-full bg-[#07111F] border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Unit Penanggung Jawab</label>
                  <select 
                    value={form.unit}
                    onChange={e => setForm({...form, unit: e.target.value})}
                    className="w-full bg-[#07111F] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 appearance-none font-medium cursor-pointer"
                  >
                    <option value="PATROLI-SABHARA-01">SABHARA 01</option>
                    <option value="PATROLI-LANTAS-04">LANTAS 04</option>
                    <option value="RAIMAS-PIONER-A">RAIMAS POINERA</option>
                    <option value="INTEL-OBS-02">INTEL OBS 02</option>
                  </select>
                </div>
              </div>

              <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/10 rounded-2xl p-5 flex gap-4">
                <Info size={18} className="text-[#D4AF37] shrink-0 mt-0.5" />
                <div className="space-y-1">
                   <p className="text-[10px] text-slate-300 font-black uppercase tracking-tight">AI Optimization Enabled</p>
                   <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-tighter">
                     SENTINEL akan menghitung rute tercepat dan memberikan estimasi waktu tiba berdasarkan data WITA saat ini.
                   </p>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-[#D4AF37] hover:bg-[#EBC145] text-[#07111F] font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-[#D4AF37]/10 uppercase tracking-widest text-xs italic"
              >
                <Plus size={20} className="stroke-[3px]" />
                Dispatch Operasional
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
