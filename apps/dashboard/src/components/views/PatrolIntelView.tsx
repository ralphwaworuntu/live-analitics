"use client";

import React, { useState, useRef } from "react";
import { 
  FileUp, 
  ShieldAlert, 
  Clock, 
  Navigation, 
  TrendingUp,
  Bot,
  Wifi,
  WifiOff,
  Download,
  FileText,
  Zap,
  Droplets,
  Gauge,
  Siren,
  Activity
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAppStore } from "@/store";
import GoogleMap from "@/components/map/GoogleMap";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function PatrolIntelView() {
  const [activeTab, setActiveTab] = useState<"planning" | "monitoring" | "review">("monitoring");
  const isOnline = useAppStore((state) => state.isOnline);
  const setOnlineStatus = useAppStore((state) => state.setOnlineStatus);
  const activeShift = useAppStore((state) => state.activeShift);
  const setActiveShift = useAppStore((state) => state.setActiveShift);
  const selectedPolsekId = useAppStore((state) => state.selectedPolsekId);

  const pushNotification = useAppStore(state => state.pushNotification);
  const reportRef = useRef<HTMLDivElement>(null);

  const generateWeeklyReport = async () => {
    if (!reportRef.current) return;
    pushNotification({ title: "Generating ANEV", description: "Mengompilasi data taktikal ke PDF...", level: "info" });
    const canvas = await html2canvas(reportRef.current, { backgroundColor: "#07111F", scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("l", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`SENTINEL_PATROL_ANEV_${Date.now()}.pdf`);
    pushNotification({ title: "ANEV Berhasil", description: "Dokumen PDF telah diunduh.", level: "warning" });
  };

  return (
    <div ref={reportRef} className="h-full flex flex-col bg-[#07111F] text-slate-100 p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 overflow-hidden">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight italic">Sentinel Tactical Console</h1>
            <p className="text-xs sm:text-sm text-slate-400 hidden sm:block">Micro-Monitoring & SOS Emergency Dispatch</p>
          </div>
          
          <button 
            onClick={() => setOnlineStatus(!isOnline)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer min-h-[44px] shrink-0 ${
              isOnline 
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]" 
                : "bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
            }`}
          >
            {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
            <span className="hidden sm:inline">{isOnline ? "Live Telemetry" : "Network Blind"}</span>
          </button>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto hide-scrollbar pb-1">
          <div className="flex bg-[#0B1B32] p-1 rounded-xl border border-white/5 shadow-inner shrink-0">
             <button 
               onClick={() => setActiveShift("pagi")}
               className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-2 cursor-pointer min-h-[40px] ${activeShift === "pagi" ? "bg-amber-500 text-slate-950" : "text-slate-500 hover:text-slate-300"}`}
             >
                <Clock size={12} /> Pagi
             </button>
             <button 
               onClick={() => setActiveShift("malam")}
               className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-2 cursor-pointer min-h-[40px] ${activeShift === "malam" ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300"}`}
             >
                <Clock size={12} /> Malam
             </button>
          </div>

          <div className="h-8 w-px bg-white/10 hidden sm:block"></div>

          <div className="flex bg-[#0B1B32] p-1 rounded-xl border border-white/5 shrink-0">
            {[
              { id: "planning" as const, label: "Planning", icon: FileUp },
              { id: "monitoring" as const, label: "Tactical GIS", icon: Navigation },
              { id: "review" as const, label: "Audit Anev", icon: TrendingUp },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer min-h-[40px] whitespace-nowrap ${
                    activeTab === tab.id 
                      ? "bg-[#D4AF37] text-slate-950 shadow-lg shadow-[#D4AF37]/20" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        {activeTab === "planning" && <PrePatrolSection />}
        {activeTab === "monitoring" && <LivePatrolSection selectedPolsekId={selectedPolsekId} />}
        {activeTab === "review" && <PostPatrolSection onGenerate={generateWeeklyReport} />}
      </div>
    </div>
  );
}

function PrePatrolSection() {
  const [analysisActive, setAnalysisActive] = useState(false);
  const pushNotification = useAppStore(state => state.pushNotification);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 pb-10">
      <Card className="bg-[#0B1B32]/80 border-white/10 p-6 shadow-2xl">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2 text-[#D4AF37]">
          <FileUp size={20} /> Regional Hotspot Data
        </h2>
        <div className="border-2 border-dashed border-white/5 rounded-2xl p-10 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-[#D4AF37]/40 transition-all bg-white/2 relative">
          <input 
            type="file" 
            className="absolute inset-0 opacity-0 cursor-pointer" 
            onChange={(e) => {
              if (e.target.files?.length) {
                 pushNotification({ title: "GeoJSON Uploaded", description: `Memproses ${e.target.files[0].name} untuk analisis AI.`, level: "info" });
              }
            }} 
          />
          <div className="p-4 bg-white/5 rounded-full mb-4">
             <FileUp size={32} className="text-slate-500 group-hover:text-[#D4AF37] transition-all" />
          </div>
          <p className="text-sm font-medium text-slate-300 italic">Drop .geojson of Polsek Boundaries</p>
        </div>
        
        <div className="mt-8">
           <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.24em] mb-4">Polsek Performance Draft</h3>
           <div className="space-y-2">
              {[
                { name: 'Polsek Oebobo', status: 'UNVERIFIED' },
                { name: 'Polsek Alak', status: 'UNVERIFIED' },
              ].map(p => (
                <div key={p.name} className="bg-white/3 border border-white/5 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="h-2 w-2 rounded-full bg-slate-600"></div>
                     <span className="text-xs font-bold">{p.name}</span>
                  </div>
                  <button 
                    onClick={() => setAnalysisActive(true)}
                    className="px-3 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-600/30 text-[10px] font-black tracking-widest hover:bg-blue-600/40 rounded-lg transition-all cursor-pointer"
                  >VERIFIKASI TAKTIS</button>
                </div>
              ))}
           </div>
        </div>
      </Card>

      <Card className="bg-[#0B1B32]/80 border-white/10 p-6 flex flex-col justify-center text-center h-full min-h-[350px]">
        {!analysisActive ? (
          <div className="text-slate-500 flex flex-col items-center">
             <Bot size={48} className="mb-4 opacity-10" />
             <p className="text-sm italic font-medium">Turangga-AI Engine Standby.<br/>Waiting for regional boundary verification.</p>
          </div>
        ) : (
          <div className="w-full text-left animate-in zoom-in-95 duration-500">
             <div className="flex items-center gap-2 mb-4">
                <Bot size={24} className="text-[#D4AF37]" />
                <span className="font-black text-white uppercase tracking-widest text-xs">Analysis Complete</span>
             </div>
             <p className="text-sm text-slate-300 mb-6 p-4 bg-red-600/5 border-l-4 border-l-red-500 rounded-lg border border-red-500/10">
                <span className="font-bold text-red-500 uppercase block mb-1 text-[10px]">Anomali Deteksi:</span>
                Terdapat deviasi rute signifikan (Polsek Oebobo) yang tidak menyentuh zona rawan 3B (Curat/Curas/Curanmor).
             </p>
             <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setAnalysisActive(false)}
                  className="px-4 py-2 border border-white/10 rounded-lg text-xs font-bold hover:bg-white/5 cursor-pointer uppercase"
                >Revisi Manual</button>
                <button 
                  onClick={() => {
                    pushNotification({ title: 'Rute Diperbarui', description: 'Auto-realign selesai via rekomendasi AI.', level: 'info' });
                    setAnalysisActive(false);
                  }}
                  className="px-4 py-2 bg-[#D4AF37] text-slate-950 font-black rounded-lg text-xs hover:bg-[#b8952b] cursor-pointer uppercase"
                >Auto-Realign Route</button>
             </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function LivePatrolSection({ selectedPolsekId }: { selectedPolsekId: string | null }) {
  const handleSOS = useAppStore(state => state.handleSOS);
  const tracks = useAppStore(state => state.personnelTracks);

  return (
    <div className="h-full grid grid-cols-1 xl:grid-cols-4 gap-4 md:gap-6 animate-in slide-in-from-right-4 min-h-[400px] md:min-h-[600px] pb-10">
      <div className="xl:col-span-1 space-y-4 flex flex-col h-full">
         <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-black text-[#D4AF37] uppercase tracking-widest px-1">Unit Asset Telemetry</h2>
            {selectedPolsekId && <span className="text-[10px] bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full font-bold">Filtered: Polsek</span>}
         </div>
         
         <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-6">
          {tracks.map(unit => {
               const fuelEfficiency = (unit.odometer / (unit.fuelInputShift || 1)).toFixed(1);
               const isAnomaly = parseFloat(fuelEfficiency) < 8.0; // Simulated logic
               const isHighSpeed = unit.topSpeed > 80;
               const isLowBattery = unit.batteryLevel < 15;
               const isSignalLost = unit.signalStatus === "No Signal";
               const batteryColor = unit.batteryLevel > 50 
                 ? "text-emerald-500" 
                 : unit.batteryLevel > 15 
                   ? "text-yellow-500" 
                   : "text-red-500 animate-pulse";
               const batteryBg = unit.batteryLevel > 50
                 ? "bg-emerald-500"
                 : unit.batteryLevel > 15
                   ? "bg-yellow-500"
                   : "bg-red-500";

               return (
                  <div key={unit.id} className="bg-[#0B1B32]/95 border border-white/10 rounded-xl p-4 hover:border-red-500/50 transition-all cursor-pointer group relative overflow-hidden">
                     {isAnomaly && (
                        <div className="absolute top-0 right-0 p-1 bg-red-600 text-white font-black text-[8px] uppercase px-2 shadow-lg">Anomali BBM</div>
                     )}
                     
                     <div className="flex items-center justify-between mb-3">
                        <div className="flex flex-col">
                           <span className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">{unit.id}</span>
                           <span className="text-sm font-black text-white">{unit.name}</span>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleSOS(unit.id); }}
                          className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white p-2 rounded-lg transition-all shadow-inner border border-red-500/20"
                        >
                           <Siren size={16} />
                        </button>
                     </div>

                     {/* TELEMETRY BADGES ROW */}
                     <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {/* Battery Badge */}
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[9px] font-black uppercase ${
                          isLowBattery 
                            ? "bg-red-500/10 border-red-500/30 text-red-500" 
                            : "bg-white/5 border-white/10 text-slate-400"
                        }`}>
                           <Zap size={10} className={batteryColor} />
                           <span>{unit.batteryLevel}%</span>
                           <div className="w-8 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                             <div className={`h-full rounded-full transition-all ${batteryBg}`} style={{ width: `${unit.batteryLevel}%` }} />
                           </div>
                        </div>

                        {/* Speed Badge */}
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[9px] font-black uppercase ${
                          isHighSpeed 
                            ? "bg-orange-500/10 border-orange-500/30 text-orange-400 animate-pulse" 
                            : "bg-white/5 border-white/10 text-slate-400"
                        }`}>
                           <Gauge size={10} />
                           <span>{unit.topSpeed} km/h</span>
                        </div>

                        {/* Signal Badge */}
                        {isSignalLost ? (
                           <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-[9px] font-black uppercase text-red-500 animate-pulse">
                              <WifiOff size={10} /> LOST
                           </div>
                        ) : (
                           <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black uppercase text-slate-400">
                              <Wifi size={10} className="text-emerald-500" /> {unit.signalStatus}
                           </div>
                        )}

                        {/* High Speed Alert Label */}
                        {isHighSpeed && (
                           <div className="px-2 py-1 rounded-lg bg-orange-600 text-white text-[8px] font-black uppercase tracking-widest animate-bounce">
                              HIGH SPEED
                           </div>
                        )}
                     </div>

                     <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
                        <div className="flex flex-col">
                           <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-1"><Droplets size={10} className="text-blue-500" /> Status BBM</span>
                           <span className="text-xs font-bold text-slate-200">{unit.fuelStatus}%</span>
                           <div className="h-1 w-full bg-slate-800 rounded-full mt-1"><div className="h-full bg-blue-500" style={{ width: `${unit.fuelStatus}%` }} /></div>
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-1"><Gauge size={10} className="text-[#D4AF37]" /> Odometer</span>
                           <span className="text-xs font-bold text-slate-200">{unit.odometer.toFixed(1)} km</span>
                        </div>
                     </div>

                     <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${unit.health.engine > 90 ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'}`} />
                           <span className="text-[10px] font-bold text-slate-400 capitalize">Health: {unit.health.engine > 90 ? 'Optimal' : 'Needs Check'}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 italic">{fuelEfficiency} km/L</span>
                     </div>
                  </div>
               );
            })}
         </div>
      </div>

      <div className="xl:col-span-3 h-full relative rounded-3xl border border-white/10 bg-[#0B1B32] overflow-hidden flex flex-col min-h-[300px] md:min-h-[550px] shadow-2xl">
         <div className="flex-1">
            <GoogleMap />
         </div>
         
         {/* Map Overlay Stats */}
         <div className="absolute top-6 left-6 pointer-events-none">
            <div className="bg-slate-950/90 backdrop-blur-3xl border border-white/10 p-4 rounded-3xl shadow-3xl text-left border-l-4 border-l-[#D4AF37]">
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Activity size={12} className="text-[#D4AF37]" /> Tactical Telemetry Index
               </div>
               <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black font-mono text-white tracking-widest">98.2</span>
                  <span className="text-emerald-400 font-bold text-xs font-mono tracking-tighter">↑ 1.4% COMPLIANCE</span>
               </div>
               <div className="mt-2 text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Monitoring Hierarchy: 14 Polsek | 38 Pos Pol | 110 Units</div>
            </div>
         </div>
      </div>
    </div>
  );
}

function PostPatrolSection({ onGenerate }: { onGenerate: () => void }) {
  return (
    <div className="space-y-6 animate-in slide-in-from-top-6 pb-12">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
         <Card className="xl:col-span-2 bg-[#0B1B32]/70 border-white/10 overflow-hidden min-h-[450px] flex flex-col shadow-2xl backdrop-blur-md">
            <div className="p-5 border-b border-white/5 bg-[#0B1B32] flex items-center justify-between">
               <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2 text-white">
                  <Zap size={18} className="text-[#D4AF37]" />
                  Fuel Efficiency & Odometer Cross-Audit
               </h3>
               <div className="flex bg-slate-950/60 p-1 rounded-lg border border-white/10">
                  <button className="px-3 py-1 text-[10px] font-bold text-white bg-blue-600 rounded-md">Weekly</button>
                  <button className="px-3 py-1 text-[10px] font-bold text-slate-500">Monthly</button>
               </div>
            </div>
            
            <div className="flex-1 p-8">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { label: 'Total Jarak Riil', val: '12,450 km', color: 'text-white' },
                    { label: 'Total BBM Terpakai', val: '1,120 L', color: 'text-blue-400' },
                    { label: 'Odometer Gap', val: '0.02%', color: 'text-emerald-400' },
                  ].map(stat => (
                    <div key={stat.label} className="bg-white/3 p-6 border border-white/5 rounded-3xl relative overflow-hidden group hover:bg-white/5 transition-all">
                       <div className="absolute top-0 right-0 p-2 opacity-5 scale-150"><Gauge size={40} /></div>
                       <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{stat.label}</div>
                       <div className={`text-2xl font-black font-mono ${stat.color} tracking-tighter`}>{stat.val}</div>
                    </div>
                  ))}
               </div>

               <div className="mt-10 h-40 w-full relative group">
                  <div className="absolute inset-0 bg-blue-500/5 rounded-3xl border border-blue-500/10 overflow-hidden">
                     {/* Mock Chart Area */}
                     <div className="absolute bottom-0 left-0 right-0 h-full flex items-end">
                        {[40, 60, 50, 75, 85, 45, 90, 65, 55, 70].map((h, i) => (
                           <div key={i} className="flex-1 bg-gradient-to-t from-[#D4AF37]/40 to-transparent border-t-2 border-[#D4AF37]/60 mx-0.5" style={{ height: `${h}%` }}></div>
                        ))}
                     </div>
                     <div className="absolute top-4 left-4 text-[10px] font-black text-[#D4AF37]/50 uppercase">Visualisasi Efisiensi BBM per Polres (NTT Core)</div>
                  </div>
               </div>
            </div>
         </Card>

         <div className="flex flex-col gap-6">
            <Card className="bg-[#0B1B32]/90 border border-red-500/20 p-8 relative flex-1 flex flex-col shadow-[0_0_40px_rgba(239,68,68,0.05)]">
               <div className="flex items-center gap-3 mb-8">
                  <ShieldAlert size={28} className="text-red-500" />
                  <h3 className="font-black text-white uppercase tracking-tighter text-xl italic">Tactical ANEV System</h3>
               </div>
               
               <div className="space-y-4 flex-1">
                  <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4 group hover:border-[#D4AF37]/30 transition-all">
                     <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><FileText size={20} /></div>
                     <div>
                        <div className="text-xs font-black uppercase text-white tracking-widest">Compliance Audit Polsek</div>
                        <div className="text-[10px] text-slate-500 font-medium">Ready to compile (14 Polsek)</div>
                     </div>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4 group hover:border-[#D4AF37]/30 transition-all">
                     <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><Droplets size={20} /></div>
                     <div>
                        <div className="text-xs font-black uppercase text-white tracking-widest">Fuel Variance Report</div>
                        <div className="text-[10px] text-slate-500 font-medium">Auto-cross referenced with GPS</div>
                     </div>
                  </div>
               </div>

               <div className="mt-10 space-y-3">
                  <button 
                    onClick={onGenerate}
                    className="w-full py-5 bg-[#D4AF37] hover:bg-[#b8952b] text-slate-950 font-black text-xs rounded-2xl transition-all shadow-xl shadow-[#D4AF37]/30 uppercase tracking-[0.25em] flex items-center justify-center gap-3 cursor-pointer group"
                  >
                     <Download size={18} className="group-hover:translate-y-0.5 transition-transform" /> Generate Audit Portal
                  </button>
                  <p className="text-[9px] text-slate-500 text-center uppercase tracking-widest font-black opacity-50">Llama-3 Engine v4.1 Enhanced</p>
               </div>
            </Card>
         </div>
      </div>
    </div>
  );
}

/* End of Module */
