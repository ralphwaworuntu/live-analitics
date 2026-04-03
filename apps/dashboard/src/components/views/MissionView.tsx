"use client";

import React, { useState } from "react";
import { Plus, MapPin, AlertTriangle, Shield } from "lucide-react";

const missionsData = [
  { id: "MSN-2026-001", type: "Laka Lantas", location: "Polresta Kupang Kota", unit: "Patroli 01", status: "En-route", priority: "High" },
  { id: "MSN-2026-002", type: "Curat", location: "Polres Tts", unit: "Resmob Alpha", status: "On-site", priority: "Medium" },
  { id: "MSN-2026-003", type: "Bentrokan Massa", location: "Polres Sikka", unit: "Dalmas Peleton 3", status: "SOS/Darurat", priority: "Critical" },
  { id: "MSN-2026-004", type: "Patroli Rutin", location: "Polres Ende", unit: "Patroli 05", status: "On-site", priority: "Low" },
];

export default function MissionView() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Pusat Misi & Dispatch</h2>
          <p className="text-slate-400 text-sm">Pantau dan kendalikan unit operasional di lapangan.</p>
        </div>
        <button 
          onClick={() => setIsDialogOpen(true)}
          className="bg-[#D4AF37] hover:bg-[#b8952b] text-slate-900 font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Plus size={18} />
          Buat Misi Baru
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-6 min-h-0">
        {/* Table Area */}
        <div className="xl:col-span-2 bg-[#0B1B32] border border-white/10 rounded-xl overflow-hidden flex flex-col">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-slate-300 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold whitespace-nowrap">ID Misi</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Jenis Kejadian</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Lokasi</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Unit Penanggung Jawab</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {missionsData.map((mission) => {
                  const isSOS = mission.status === "SOS/Darurat";
                  return (
                    <tr 
                      key={mission.id} 
                      className={`hover:bg-white/5 transition-colors ${
                        isSOS ? "bg-red-950/40 animate-[pulse_2s_ease-in-out_infinite]" : ""
                      }`}
                    >
                      <td className="p-4 font-medium text-white whitespace-nowrap">{mission.id}</td>
                      <td className="p-4 text-slate-300 flex items-center gap-2 whitespace-nowrap">
                        {isSOS && <AlertTriangle size={14} className="text-red-500" />}
                        {mission.type}
                      </td>
                      <td className="p-4 text-slate-300 whitespace-nowrap">{mission.location}</td>
                      <td className="p-4 text-slate-300 flex items-center gap-2 whitespace-nowrap">
                        <Shield size={14} className="text-[#D4AF37]" />
                        {mission.unit}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          isSOS 
                            ? "bg-red-500/20 text-red-500 border-red-500/30"
                            : mission.status === "On-site"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        }`}>
                          {mission.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Map Preview */}
        <div className="bg-[#0B1B32] border border-white/10 rounded-xl relative overflow-hidden flex flex-col">
          <div className="absolute inset-0 bg-slate-800/40">
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
          </div>
          <div className="relative z-10 p-4 border-b border-white/10 bg-[#0B1B32]/80 backdrop-blur-sm">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <MapPin size={18} className="text-[#D4AF37]" />
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
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37]" 
                  placeholder="Contoh: Pengamanan Demo" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Lokasi (Geotagging)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
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
                <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#D4AF37] appearance-none cursor-pointer">
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
                onClick={() => setIsDialogOpen(false)}
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
