"use client";

import React, { useRef } from "react";
import { 
  TrendingUp, 
  Clock, 
  Zap, 
  Shield, 
  Download,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  FileDown,
  BrainCircuit,
  Users,
  MessageSquare,
  Car,
  BellRing,
  MoreVertical,
  Send,
  ChevronRight
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  Line,
  ComposedChart,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { cn } from "@/lib/utils";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { motion } from "framer-motion";
import { useAppStore } from "@/store";
import { playTacticalSound } from "@/lib/tactical-feedback";
import { ReportService } from "@/lib/ReportService";

// --- TYPES ---

interface KPICardProps {
  title: string;
  value: string;
  unit: string;
  trend: "up" | "down";
  icon: React.ElementType;
  trendValue: string;
  pciScore?: number;
}

interface TacticalAlert {
  id: string;
  type: "SOS" | "BBM" | "SENTIMENT";
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  location: string;
  message: string;
  detail: string;
  timestamp: string;
}

// --- MOCK DATA ---

const criticalAlerts: TacticalAlert[] = [
  {
    id: "AL-001",
    type: "SOS",
    severity: "CRITICAL",
    location: "Kupang Kota • Sektor 3",
    message: "High Priority Response Lag (>12m)",
    detail: "Unit P-04 gagal mencapai TKP Laka Lantas dalam target waktu operasional.",
    timestamp: "2 mins ago"
  },
  {
    id: "AL-002",
    type: "BBM",
    severity: "HIGH",
    location: "Polres Belu • Unit Frontier",
    message: "Logistics Integrity Anomaly Found",
    detail: "Unit Frontier-9 menunjukkan konsumsi BBM habis (0%) dengan jarak tempuh minimal (<5KM).",
    timestamp: "5 mins ago"
  },
  {
    id: "AL-003",
    type: "SENTIMENT",
    severity: "HIGH",
    location: "Manggarai Barat • Labuan Bajo",
    message: "Public Sentiment Negative Spike",
    detail: "Lonjakan isu negatif terkait pelayanan publik di media sosial lokal (+45% surge).",
    timestamp: "12 mins ago"
  }
];

const fatigueData = [
  { name: "Regu A", hours: 14, risk: "High" },
  { name: "Regu B", hours: 9, risk: "Low" },
  { name: "Regu C", hours: 13, risk: "High" },
  { name: "Regu D", hours: 8, risk: "Low" },
  { name: "Regu E", hours: 11, risk: "Med" }
];

const assetReadiness = [
  { name: "Active (GPS)", value: 840, color: "#10B981" },
  { name: "Offline/Inactive", value: 160, color: "#EF4444" }
];

const aiAccuracyData = [
  { day: "Senin", predicted: 42, actual: 40, low: 35, high: 49 },
  { day: "Selasa", predicted: 38, actual: 41, low: 30, high: 46 },
  { day: "Rabu", predicted: 55, actual: 52, low: 48, high: 62 },
  { day: "Kamis", predicted: 48, actual: 48, low: 40, high: 56 },
  { day: "Jumat", predicted: 62, actual: 65, low: 55, high: 72 },
  { day: "Sabtu", predicted: 85, actual: 82, low: 78, high: 92 },
  { day: "Minggu", predicted: 70, actual: 68, low: 62, high: 78 }
];

const topImprovedPolres = [
  { polres: "Sikka", reduction: "24%", currentStatus: "Emerald" },
  { polres: "Alor", reduction: "18%", currentStatus: "Emerald" },
  { polres: "SBD", reduction: "15%", currentStatus: "Lime" },
  { polres: "Malaka", reduction: "12%", currentStatus: "Lime" },
  { polres: "TTS", reduction: "9%", currentStatus: "Slate" }
];

// --- COMPONENTS ---

const AlertCard = ({ alert }: { alert: TacticalAlert }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className={cn(
      "group relative overflow-hidden flex flex-col p-5 rounded-[24px] border transition-all duration-300",
      alert.severity === "CRITICAL" 
        ? "bg-red-500/10 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]" 
        : "bg-orange-500/10 border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.1)]"
    )}
  >
    {alert.severity === "CRITICAL" && (
      <div className="absolute inset-0 bg-red-500/5 animate-pulse-slow pointer-events-none" />
    )}
    
    <div className="flex items-start justify-between relative z-10">
       <div className="flex items-center gap-3">
          <div className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center",
            alert.severity === "CRITICAL" ? "bg-red-500 text-[#07111F]" : "bg-orange-500 text-[#07111F]"
          )}>
             {alert.type === "SOS" && <BellRing size={20} className="animate-bounce" />}
             {alert.type === "BBM" && <Zap size={20} />}
             {alert.type === "SENTIMENT" && <MessageSquare size={20} />}
          </div>
          <div className="flex flex-col text-left">
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{alert.location}</span>
                <div className="h-1 w-1 rounded-full bg-slate-700" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">{alert.timestamp}</span>
             </div>
             <h4 className="text-sm font-black text-white uppercase italic leading-tight mt-1">{alert.message}</h4>
          </div>
       </div>
       <button className="text-slate-500 hover:text-white transition-colors"><MoreVertical size={16} /></button>
    </div>

    <div className="mt-4 relative z-10 text-left">
       <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase italic">
          {alert.detail}
       </p>
    </div>

    <div className="mt-5 flex items-center gap-3 relative z-10 no-export">
       <button className={cn(
         "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
         alert.severity === "CRITICAL" 
           ? "bg-red-500 text-[#07111F] hover:brightness-110" 
           : "bg-orange-500 text-[#07111F] hover:brightness-110"
       )}>
          <Send size={14} /> Direct Command
       </button>
       <button className="px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
          <ChevronRight size={14} className="text-white" />
       </button>
    </div>
  </motion.div>
);

const KPICard = ({ title, value, unit, trend, icon: Icon, trendValue, pciScore }: KPICardProps) => {
  const isTargetAchieved = pciScore && pciScore > 90;
  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative overflow-hidden transition-all duration-500 h-full bg-[#0B1B32] border border-white/5 rounded-[24px] p-6 shadow-2xl hover:border-[#D4AF37]/30 hover:shadow-[#D4AF37]/5",
        isTargetAchieved && "border-yellow-500/50 shadow-[0_0_20px_rgba(212,175,55,0.1)] bg-gradient-to-br from-[#0B1B32] to-[#1A2C44]"
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">{title}</CardTitle>
        <div className={cn("p-2 rounded-xl transition-colors", isTargetAchieved ? "bg-yellow-500/10" : "bg-white/5")}>
          <Icon className={cn("h-4 w-4", isTargetAchieved ? "text-yellow-500" : "text-slate-400")} />
        </div>
      </CardHeader>
      <CardContent className="text-left">
        <div className="flex items-baseline gap-2">
          <div className="text-xl md:text-2xl lg:text-3xl font-black font-mono tracking-tighter text-white">{value}</div>
          <p className="text-[10px] font-black text-slate-500 uppercase font-mono">{unit}</p>
        </div>
        <div className="flex items-center gap-1.5 mt-2 font-mono">
          <div className={cn("flex items-center text-[10px] font-black uppercase rounded-full px-1.5 py-0.5", trend === "up" ? "text-emerald-500 bg-emerald-500/10" : "text-red-500 bg-red-500/10")}>
            {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {trendValue}
          </div>
          <span className="text-[9px] font-black text-slate-600 uppercase">Trend Performance</span>
        </div>
      </CardContent>
    </motion.div>
  );
};

export default function StatisticsView() {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const { executeAction, activeMissions, auditLogs } = useAppStore();

  const exportDashboard = async (format: "png" | "pdf" | "report") => {
    if (!dashboardRef.current) return;
    
    if (format === "report") {
       await ReportService.generateSmartAnev(activeMissions, auditLogs);
       executeAction("EXPORT_ANEV");
       playTacticalSound("click");
       return;
    }

    const canvas = await html2canvas(dashboardRef.current, { backgroundColor: "#07111F", scale: 2 });
    if (format === "png") {
      const link = document.createElement("a");
      link.download = `SENTINEL_ANEV_NTT_${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } else {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`SENTINEL_ANEV_NTT_${Date.now()}.pdf`);
    }

    executeAction("EXPORT_ANEV");
    playTacticalSound("click");
  };

  return (
    <div ref={dashboardRef} className="flex flex-col h-full w-full bg-[#07111F] overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-10 gap-4 md:gap-6 lg:gap-10 custom-scrollbar text-white relative">
      
      {/* HEADER TACTICAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between no-export shrink-0 pb-6 lg:pb-10 gap-4 max-h-[30vh]">
         <div className="flex flex-col">
            <div className="flex items-center gap-3 lg:gap-4">
               <div className="h-10 w-10 lg:h-14 lg:w-14 rounded-2xl bg-[#D4AF37] flex items-center justify-center shadow-lg shadow-yellow-500/10 border border-yellow-500/20 shrink-0">
                  <Activity size={28} className="text-[#07111F]" />
               </div>
                <div className="text-left">
                  <h1 className="text-xl md:text-3xl lg:text-5xl font-black uppercase tracking-tighter italic leading-none text-white text-balance">Sentinel Anev Insights</h1>
                  <p className="text-[10px] lg:text-[11px] font-black text-slate-500 uppercase tracking-widest leading-none mt-1 lg:mt-2 text-balance">Strategic Intelligence Forensics • BIRO OPS POLDA NTT</p>
                </div>
            </div>
         </div>
         <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button onClick={() => exportDashboard("png")} title="Save PNG" className="h-10 w-10 lg:h-12 lg:w-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all border border-white/5"><Download size={20} /></button>
            <button 
                onClick={() => exportDashboard("report")} 
                className="bg-[#D4AF37] text-[#07111F] h-10 lg:h-12 px-4 lg:px-8 rounded-2xl text-[10px] lg:text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2 lg:gap-3 shadow-lg shadow-yellow-500/20 border border-yellow-500/20 whitespace-nowrap"
            >
               <FileDown size={18} /> <span className="hidden sm:inline">Unduh Laporan Shift (Anev)</span><span className="sm:hidden">Export</span>
            </button>
         </div>
      </div>

      {/* NEW: CRITICAL ALERT PANEL (Top, Ordered by Severity) */}
      <div className="flex flex-col gap-6 no-export text-left">
         <div className="flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-red-500 italic">Threat Intelligent Detection Active</h3>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {criticalAlerts.map((alert) => (
               <AlertCard key={alert.id} alert={alert} />
            ))}
         </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-8 shrink-0">
        <KPICard title="Total Incidents" value="1,492" unit="Case" trend="down" trendValue="12%" icon={Activity} />
        <KPICard title="Tactical Response" value="04m" unit="Avg" trend="up" trendValue="1.2m" icon={Clock} />
        <KPICard title="Logistics Readiness" value="96.2" unit="%" trend="up" trendValue="2.1%" icon={Zap} />
        <KPICard title="Patrol PCI Index" value="92.4" unit="Idx" trend="up" trendValue="4.5pt" icon={Shield} pciScore={92.4} />
      </div>

      {/* MAIN ANALYTICS GRID */}
      <div className="grid grid-cols-12 gap-4 lg:gap-10">
        
        {/* Crime Clock */}
        <Card className="col-span-12 h-[240px] lg:h-[320px] overflow-hidden bg-transparent border-white/5">
           <CardHeader className="py-6 px-10 text-left">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-[#D4AF37] flex items-center gap-3"><Clock size={16} /> Operational Crime Load Analysis</CardTitle>
           </CardHeader>
           <CardContent className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={[{t: "00h", v: 45}, {t: "04h", v: 22}, {t: "08h", v: 88}, {t: "12h", v: 65}, {t: "16h", v: 120}, {t: "20h", v: 95}, {t: "23h", v: 50}]}>
                    <defs><linearGradient id="clockGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3B82F6" stopOpacity={0.6}/><stop offset="95%" stopColor="#EF4444" stopOpacity={0.05}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="t" stroke="#475569" fontSize={11} fontWeight="black" axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{backgroundColor: "#0B1B32", border: "1px solid #ffffff10", borderRadius: "16px"}} />
                    <Area type="monotone" dataKey="v" stroke="#3B82F6" strokeWidth={4} fill="url(#clockGrad)" animationDuration={2000} />
                 </AreaChart>
              </ResponsiveContainer>
           </CardContent>
        </Card>

        {/* AI ACCURACY TRACKER */}
        <Card className="col-span-12 lg:col-span-8 bg-[#0B1B32]/40 border-white/5 h-[480px] relative">
           <CardHeader className="text-left">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-3 text-blue-500"><BrainCircuit size={18} /> Turangga AI Accuracy Index</CardTitle>
           </CardHeader>
           <CardContent className="h-[360px] relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none flex flex-col items-center text-center">
                 <div className="text-4xl md:text-6xl lg:text-[72px] font-black font-mono leading-none text-white tracking-tighter">94.2%</div>
                 <div className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.4em] mt-2 bg-[#D4AF37]/10 px-4 py-1 rounded-full border border-yellow-500/20">AI Precision Verified</div>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                 <ComposedChart data={aiAccuracyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="day" stroke="#475569" fontSize={11} fontWeight="black" axisLine={false} tickLine={false} />
                    <YAxis stroke="#475569" fontSize={11} fontWeight="black" axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{backgroundColor: "#0B1B32", border: "1px solid #ffffff10", borderRadius: "16px"}} />
                    <Area type="monotone" dataKey="low" stroke="none" fill="#3B82F6" fillOpacity={0.05} />
                    <Area type="monotone" dataKey="high" stroke="none" fill="#3B82F6" fillOpacity={0.05} />
                    <Line type="monotone" dataKey="predicted" stroke="#3B82F6" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                    <Line type="monotone" dataKey="actual" stroke="#FFD700" strokeWidth={4} dot={{r: 4, fill: "#FFD700"}} />
                    <Legend verticalAlign="top" align="right" />
                 </ComposedChart>
              </ResponsiveContainer>
           </CardContent>
        </Card>

        {/* MOST IMPROVED POLRES */}
        <Card className="col-span-12 lg:col-span-4 bg-[#0B1B32]/40 border-white/5 h-[480px]">
           <CardHeader className="text-left">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-[#10B981] flex items-center gap-3"><TrendingUp size={18} /> Strategic Most Improved</CardTitle>
           </CardHeader>
           <CardContent className="px-8 pt-4">
              <div className="space-y-6">
                 {topImprovedPolres.map((p, i) => (
                    <div key={i} className="flex items-center justify-between group">
                       <div className="flex items-center gap-4">
                          <div className="text-xl font-black font-mono text-slate-700 italic">0{i+1}</div>
                          <div className="flex flex-col text-left">
                             <span className="text-sm font-black uppercase text-slate-200">{p.polres}</span>
                             <div className="flex items-center gap-2">
                                <div className={cn("w-2 h-2 rounded-full", p.currentStatus === "Emerald" ? "bg-emerald-500 shadow-[0_0_8px_#10B981]" : "bg-lime-500")} />
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Stable Trend</span>
                             </div>
                          </div>
                       </div>
                       <div className="flex flex-col items-end text-right">
                          <div className="text-lg font-black text-emerald-400 font-mono italic">-{p.reduction}</div>
                          <div className="text-[8px] font-black text-slate-600 uppercase">Case Load</div>
                       </div>
                    </div>
                 ))}
              </div>
           </CardContent>
        </Card>

        {/* STRATEGIC INSIGHT PANEL (BENTO) */}
        <div className="col-span-12 grid grid-cols-12 gap-4 lg:gap-8 mt-4 no-export">
           <Card className="col-span-12 lg:col-span-4 bg-white/5 border-white/5">
              <CardHeader className="pb-2 text-left">
                 <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-3"><Users size={16} /> Personnel Fatigue</CardTitle>
              </CardHeader>
              <CardContent className="h-[220px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={fatigueData}>
                      <XAxis dataKey="name" stroke="#475569" fontSize={9} fontWeight="black" axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{backgroundColor: "#0B1B32", border: "1px solid #ffffff10", borderRadius: "12px"}} />
                      <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                        {fatigueData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.hours > 12 ? "#EF4444" : "#3B82F6"} />
                        ))}
                      </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </CardContent>
           </Card>

           <Card className="col-span-12 lg:col-span-4 bg-[#0B1B32]/60 border-white/10 shadow-xl overflow-hidden relative group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><MessageSquare size={60} /></div>
               <CardHeader className="text-left">
                  <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-[#D4AF37] flex items-center gap-3">
                     <MessageSquare size={16} /> Social Pulse Tracker
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-6">
                  <div className="flex flex-col gap-6">
                     <div className="flex items-end justify-between">
                        <div>
                           <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Current State</div>
                           <span className="text-3xl font-black text-white italic tracking-tighter">VOLATILE</span>
                        </div>
                        <div className="text-right">
                           <div className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Negative surge</div>
                           <span className="text-xl font-black font-mono text-red-500 tracking-tighter">+42.8%</span>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <div className="space-y-2">
                           <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-400">
                              <span>Positive Sentiment</span>
                              <span>32%</span>
                           </div>
                           <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" style={{width: '32%'}} />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-400">
                              <span>Negative Sentiment</span>
                              <span>68%</span>
                           </div>
                           <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" style={{width: '68%'}} />
                           </div>
                        </div>
                     </div>

                     <div className="pt-4 border-t border-white/5">
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Critical Keyword Watchlist</div>
                        <div className="flex flex-wrap gap-2">
                           {[
                              { tag: "begal", count: 124, trend: "up" },
                              { tag: "bentrok", count: 42, trend: "down" },
                              { tag: "demo", count: 15, trend: "stable" }
                           ].map(k => (
                              <div key={k.tag} className="px-2 py-1 bg-white/5 border border-white/10 rounded flex items-center gap-2 group/tag cursor-pointer hover:border-red-500/50 transition-all">
                                 <span className="text-[10px] font-black text-slate-300">#{k.tag}</span>
                                 <span className={cn("text-[9px] font-mono", k.trend === "up" ? "text-red-500" : "text-emerald-500")}>
                                    {k.trend === "up" ? "↑" : k.trend === "down" ? "↓" : "•"} {k.count}
                                 </span>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </CardContent>
            </Card>

           <Card className="col-span-12 lg:col-span-4 bg-white/5 border-white/5">
              <CardHeader className="text-left">
                 <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-3"><Car size={16} /> Asset Readiness</CardTitle>
              </CardHeader>
              <CardContent className="h-[220px] relative flex items-center justify-center">
                 <div className="absolute text-center"><div className="text-4xl font-black text-white font-mono">84%</div></div>
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie data={assetReadiness} cx="50%" cy="50%" innerRadius={70} outerRadius={85} paddingAngle={8} dataKey="value" stroke="none">
                          {assetReadiness.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                       </Pie>
                    </PieChart>
                 </ResponsiveContainer>
              </CardContent>
           </Card>

           <div className="col-span-12 bg-[#D4AF37]/5 border border-yellow-500/10 rounded-[24px] lg:rounded-[32px] p-4 sm:p-6 lg:p-10 flex flex-col gap-4 lg:gap-6 relative overflow-hidden text-left">
              <p className="text-sm font-bold text-slate-400 uppercase leading-relaxed italic border-l-4 border-[#D4AF37] pl-8">
                 &quot;Analisis korelasi menemukan bahwa kenaikan angka <span className="text-white italic underline decoration-[#D4AF37]">Pencurian Malam Hari</span> di Wilayah Sektor 4 Kupang sangat berkorelasi dengan jadwal <span className="text-red-500 italic underline decoration-red-500/20">Pemadaman Listrik Terencana</span>. Antisipasi dilakukan via penebalan patroli.&quot;
              </p>
           </div>
        </div>

      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #07111F; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 12px; }
        @media print { .no-export { display: none; } }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.4; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
      
      <div className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between pt-6 lg:pt-10 border-t border-white/5 no-export opacity-50 px-4 lg:px-10 pb-4 lg:pb-6 text-left gap-2">
         <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Polda NTT Sentinel • Enterprise Insights Engine v6.1</span>
         <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Confidential Operational Intelligence</span>
      </div>
    </div>
  );
}
