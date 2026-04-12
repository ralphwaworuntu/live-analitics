"use client";

import { useState } from "react";
import { useAppStore } from "@/store";
import { X, Siren, MapPin, Clock, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SmartDispatchModal() {
  const dispatchModal = useAppStore((s) => s.dispatchModal);
  const setDispatchModal = useAppStore((s) => s.setDispatchModal);
  const dispatchMission = useAppStore((s) => s.dispatchMission);
  const setDispatchMission = useAppStore((s) => s.setDispatchMission);

  if (!dispatchModal.open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[#0B1B32] border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
                <Siren size={20} className="text-[#D4AF37]" />
              </div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight">
                Smart Dispatch
              </h2>
            </div>
            <button
              onClick={() => setDispatchModal(false)}
              className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <X size={16} className="text-slate-400" />
            </button>
          </div>

          {dispatchModal.report && (
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User size={14} className="text-[#D4AF37]" />
                  <span className="text-sm font-bold text-white">
                    {dispatchModal.report.personnelName}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={14} className="text-slate-500" />
                  <span className="text-xs font-mono text-slate-400">
                    {dispatchModal.report.lat.toFixed(6)}, {dispatchModal.report.lng.toFixed(6)}
                  </span>
                </div>
                <p className="text-sm text-slate-300 mt-2">
                  {dispatchModal.report.textReport}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setDispatchModal(false)}
                  className="flex-1 py-3 bg-white/5 text-slate-400 rounded-xl font-black text-xs uppercase hover:bg-white/10 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    setDispatchMission({
                      title: `Dispatch ke ${dispatchModal.report?.personnelName}`,
                      type: "Patroli",
                      description: dispatchModal.report?.textReport || "",
                      locationName: "Target Location",
                      priority: "Medium",
                      status: "pending",
                      assignedPersonnelId: dispatchModal.report?.personnelId || "",
                      unitName: dispatchModal.report?.personnelName || "",
                      targetLat: dispatchModal.report?.lat || 0,
                      targetLng: dispatchModal.report?.lng || 0,
                      etaMinutes: 5,
                    });
                    setDispatchModal(false);
                  }}
                  className="flex-1 py-3 bg-[#D4AF37] text-black rounded-xl font-black text-xs uppercase hover:bg-[#D4AF37]/90 transition-colors"
                >
                  Kirim Unit
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}