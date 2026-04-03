"use client";

import React from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell 
} from "recharts";
import { 
  ShieldAlert, Car, Clock, Bot, AlertTriangle 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAppStore, getSelectedPolres } from "@/store";

export default function SummaryPanel() {
  const selectedPolres = useAppStore(getSelectedPolres);
  
  // Dummy data for the bar chart
  const crimeData = [
    { name: "Curanmor", count: selectedPolres ? Math.floor(selectedPolres.cases! * 0.4) : 45 },
    { name: "Pencurian", count: selectedPolres ? Math.floor(selectedPolres.cases! * 0.3) : 32 },
    { name: "Penganiayaan", count: selectedPolres ? Math.floor(selectedPolres.cases! * 0.2) : 18 },
  ];

  const responseTime = selectedPolres ? (7 + (selectedPolres.name.length % 3)).toFixed(1) : "7.3";

  return (
    <aside className="w-[400px] bg-[#0B1B32] border-l border-white/10 flex flex-col h-full overflow-y-auto custom-scrollbar">
      <div className="p-4 border-b border-white/10 bg-[#0B1B32]/50 backdrop-blur-md sticky top-0 z-20">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          {selectedPolres ? selectedPolres.name : "Ringkasan Regional NTT"}
        </h2>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
          {selectedPolres ? `Data Fokus: ${selectedPolres.island}` : "Data Agregat 21 Polres"}
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* KPI Section */}
        <div className="grid grid-cols-1 gap-3">
          <Card className="bg-white/5 border-white/5 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert size={16} className="text-red-400" />
                <span className="text-xs font-medium text-slate-400">Kamtibmas</span>
              </div>
              <span className="text-lg font-bold text-white font-mono">
                {selectedPolres ? selectedPolres.cases : 124}
              </span>
            </div>
          </Card>
          
          <Card className="bg-white/5 border-white/5 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car size={16} className="text-yellow-400" />
                <span className="text-xs font-medium text-slate-400">Laka Lantas</span>
              </div>
              <span className="text-lg font-bold text-white font-mono">
                {selectedPolres ? Math.floor(selectedPolres.cases! * 0.3) : 38}
              </span>
            </div>
          </Card>

          <Card className="bg-white/5 border-white/5 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-emerald-400" />
                <span className="text-xs font-medium text-slate-400">Respon Time</span>
              </div>
              <span className="text-lg font-bold text-white font-mono">
                {responseTime} mnt
              </span>
            </div>
          </Card>
        </div>

        {/* Chart Section */}
        <div className="bg-white/5 rounded-xl border border-white/5 p-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Jenis Kejahatan Dominan</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={crimeData} layout="vertical" margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0B1B32', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {crimeData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.name === "Curanmor" ? "#D4AF37" : "#3b82f6"} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Briefing Section */}
        <div className="bg-[#0B1B32]/40 rounded-xl border border-[#D4AF37]/20 p-4 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
             <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                <Bot size={14} className="text-[#D4AF37]" />
             </div>
             <h3 className="text-xs font-bold text-white uppercase tracking-widest">Turangga-AI Briefing</h3>
          </div>
          
          <p className="text-xs text-slate-300 leading-relaxed italic">
            {selectedPolres 
              ? `Situasi di wilayah hukum ${selectedPolres.name} saat ini berstatus ${selectedPolres.crimeStatus}. Terjadi tren peningkatan Curanmor di titik-titik keramaian. Disarankan peningkatan personil di lapangan.`
              : "Situasi NTT pagi ini secara umum kondusif, namun terpantau kenaikan kasus Curanmor di wilayah hukum Polres Belu dalam 3 jam terakhir. Disarankan peningkatan patroli di perbatasan."
            }
          </p>

          <div className="mt-3 flex items-center gap-1">
             <AlertTriangle size={10} className="text-[#D4AF37]" />
             <span className="text-[9px] text-[#D4AF37] uppercase font-bold tracking-tighter">Verified Source: Command Center Live</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
