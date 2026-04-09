"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/store";
import { ShieldCheck, History, Search, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AuditLogTable() {
  const auditLogs = useAppStore((state) => state.auditLogs);
  const clearOperationalData = useAppStore((state) => state.clearOperationalData);
  const [isHydrated, setIsHydrated] = useState(false);
  const [filter, setFilter] = useState("");

  // Persist hydration check to avoid SSR mismatch
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) return null;

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.action.toLowerCase().includes(filter.toLowerCase()) ||
      log.actor.toLowerCase().includes(filter.toLowerCase())
  );

  const formatWITA = (isoString: string) => {
    return new Date(isoString).toLocaleString("id-ID", {
      timeZone: "Asia/Makassar",
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Cari aktor atau aksi log..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-[#0B1B32] border border-white/10 rounded-xl px-10 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]/50 transition-all"
          />
        </div>

        <button
          onClick={() => {
            if (confirm("KONFIRMASI KEAMANAN: Hapus seluruh data operasional dan log dari terminal ini?")) {
              clearOperationalData();
            }
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600/10 border border-red-500/20 rounded-xl text-[10px] font-black text-red-500 hover:bg-red-600 hover:text-white transition-all uppercase tracking-widest cursor-pointer"
        >
          <Trash2 size={14} /> Clear Security Cache
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-[#0B1B32] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Waktu (WITA)</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Aktor</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Aksi</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">ID Objek</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic text-sm">
                    Belum ada riwayat aktivitas yang tercatat.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-[10px] text-emerald-500 bg-emerald-500/5 px-2 py-1 rounded">
                        {formatWITA(log.timestamp)}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-200 text-xs">{log.actor}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-white uppercase tracking-tight">{log.action}</span>
                        <span className="text-[10px] text-slate-500 line-clamp-1">{log.details}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 w-fit">
                        <ShieldCheck size={10} className="text-blue-500" />
                        <span className="text-[10px] font-black text-blue-500 uppercase">Success</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-[10px] text-slate-500 group-hover:text-slate-300 transition-colors">
                        {log.target}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* FOOTER STATS */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2 text-slate-500">
           <History size={14} />
           <span className="text-[10px] font-bold uppercase tracking-widest">Total Logs: {filteredLogs.length}</span>
        </div>
        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">SENTINEL-TACTICAL-SEC V2.4</span>
      </div>
    </div>
  );
}
