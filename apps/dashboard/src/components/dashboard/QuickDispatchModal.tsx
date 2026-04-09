"use client";

import React, { useState } from "react";
import { useAppStore } from "@/store";
import { X, MapPin, Shield, Plus, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { playTacticalSound, triggerHaptic } from "@/lib/tactical-feedback";

interface QuickDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLocation?: string;
}

export default function QuickDispatchModal({ isOpen, onClose, initialLocation = "" }: QuickDispatchModalProps) {
  const dispatchMission = useAppStore(state => state.dispatchMission);
  const pushNotification = useAppStore(state => state.pushNotification);
  const executeAction = useAppStore(state => state.executeAction);
  
  const [form, setForm] = useState({
    title: "",
    location: initialLocation,
    priority: "Medium" as "Low" | "Medium" | "High" | "Critical",
    unit: "PATROLI-SABHARA-01"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title || !form.location) {
      pushNotification({
        title: "Validasi Gagal",
        description: "Mohon lengkapi Nama Kejadian dan Lokasi.",
        level: "warning"
      });
      return;
    }

    dispatchMission({
      title: form.title,
      type: "FIELD_REPORT",
      description: `Quick Dispatch dari Dashboard: ${form.title}`,
      locationName: form.location,
      priority: form.priority,
      status: "en-route",
      assignedPersonnelId: "P" + Math.floor(Math.random() * 1000),
      unitName: form.unit,
      targetLat: -10.158 + (Math.random() - 0.5) * 0.05,
      targetLng: 123.606 + (Math.random() - 0.5) * 0.05,
      etaMinutes: 8
    });

    executeAction("DISPATCH_MISSION", {
      unitName: form.unit,
      locationName: form.location
    });

    playTacticalSound("beep");
    triggerHaptic([30, 60, 30]);
    onClose();
    setForm({ title: "", location: initialLocation, priority: "Medium", unit: "PATROLI-SABHARA-01" });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-[#0B1B32] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#D4AF37]/10 rounded-lg">
                  <Shield size={20} className="text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Input Kejadian Baru</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">SENTINEL Tactical Quick Dispatch</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nama Kejadian</label>
                  <input 
                    autoFocus
                    value={form.title}
                    onChange={e => setForm({...form, title: e.target.value})}
                    placeholder="Contoh: Lakalantas Simpang El Tari"
                    className="w-full bg-[#07111F] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Lokasi Wilayah</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                    <input 
                      value={form.location}
                      onChange={e => setForm({...form, location: e.target.value})}
                      placeholder="Input lokasi atau pilih di peta..."
                      className="w-full bg-[#07111F] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Prioritas</label>
                    <select 
                      value={form.priority}
                      onChange={e => setForm({...form, priority: e.target.value as any})}
                      className="w-full bg-[#07111F] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 appearance-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical (SOS)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Assign Unit</label>
                    <div className="relative">
                      <select 
                        value={form.unit}
                        onChange={e => setForm({...form, unit: e.target.value})}
                        className="w-full bg-[#07111F] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 appearance-none"
                      >
                        <option value="PATROLI-SABHARA-01">SABHARA 01</option>
                        <option value="PATROLI-LANTAS-04">LANTAS 04</option>
                        <option value="RAIMAS-PIONER-A">RAIMAS POINERA</option>
                        <option value="INTEL-OBS-02">INTEL OBS 02</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-xl p-4 flex gap-3">
                <Info size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed">
                  SENTINEL AI akan otomatis membuat lintasan patroli tercepat untuk unit yang dipilih berdasarkan kepadatan lalu lintas real-time.
                </p>
              </div>

              <button 
                type="submit"
                className="w-full bg-[#D4AF37] hover:bg-[#EBC145] text-[#07111F] font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-[#D4AF37]/10"
              >
                <Plus size={20} className="stroke-[3px]" />
                DISPATCH UNIT SEKARANG
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
