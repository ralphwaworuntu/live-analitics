"use client";

import React from "react";
import { Settings } from "lucide-react";

export default function AnevView() {
  return (
    <div className="p-6 h-full flex flex-col w-full">
      <h2 className="text-2xl font-bold text-white mb-2">Sistem & Anev</h2>
      <p className="text-slate-400 mb-6">Analisa dan Evaluasi / Konfigurasi Sistem Utama.</p>
      
      <div className="flex-1 bg-[#0B1B32] border border-white/10 rounded-xl flex items-center justify-center p-8 text-center flex-col shadow-lg">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-[#D4AF37]">
          <Settings size={32} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Modul Anev Sedang Dalam Pengembangan</h3>
        <p className="text-slate-400 max-w-md">
          Dashboard konfigurasi sistem kepolisian dan upload dokumen Anev tahunan sedang disiapkan oleh tim.
        </p>
      </div>
    </div>
  );
}
