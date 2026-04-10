"use client";

import React from "react";
import { Settings } from "lucide-react";

import AuditLogTable from "@/components/analytics/AuditLogTable";

export default function AnevView() {
  return (
    <div className="p-3 sm:p-6 md:p-10 h-full flex flex-col w-full bg-[#07111F] overflow-y-auto custom-scrollbar">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter italic">Tactical Audit & Anev</h2>
          <p className="text-slate-500 text-xs sm:text-sm uppercase font-bold tracking-[0.2em] mt-1">Operational Security Logging System • BIRO OPS POLDA NTT</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl">
          <Settings size={16} className="text-[#D4AF37] animate-spin-slow" />
          <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-widest">AI Summary Active</span>
        </div>
      </div>

      <div className="mb-8 bg-[#0B1B32] border border-white/10 rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Settings size={120} />
        </div>
        <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37]" />
        
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
            AI Turangga 2.0 Core Briefing
          </h3>
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Digital Chain of Custody Verified</span>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed font-mono">
          [08:00 WITA] <span className="text-[#D4AF37]">COMMAND ANALYSIS:</span> Korelasi OSINT & Sentimen Sosial menemukan anomali &quot;Demonstrasi Damai&quot; yang berpotensi mendingin menjadi kontinjensi di Labuan Bajo. 
          <br /><br />
          <span className="text-emerald-400">REKOMENDASI PATROLI:</span> Fokus pada Sektor 1 & 5. Tambahkan 3 Unit R4 untuk perimeter pengamanan. 
          Audit integritas BBM mendeteksi 2 anomali di Polres Belu (Hash: SEC-HASH-8ABF-1240). Segera lakukan pengecekan fisik aset.
        </p>

        <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap gap-6">
          <div className="flex flex-col">
            <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Engine Version</span>
            <span className="text-[10px] text-white font-mono uppercase">Turangga 2.0 (Proactive)</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Integrity Hash</span>
            <span className="text-[10px] text-emerald-500 font-mono uppercase">SEC-HASH-TACT-90FF</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Confidence Index</span>
            <span className="text-[10px] text-white font-mono uppercase">96.8%</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1">
        <AuditLogTable />
      </div>
    </div>
  );
}
