"use client";

import React, { useState } from "react";
import { 
  TrendingUp, 
  Clock, 
  Zap, 
  Shield, 
  Calendar, 
  Download,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  Legend 
} from "recharts";
import { cn } from "@/lib/utils";

// --- TYPES ---

interface KPICardProps {
  title: string;
  value: string;
  unit: string;
  trend: "up" | "down";
  icon: React.ElementType;
  trendValue: string;
}

// --- MOCK DATA ---

const crimeTrendData = [
  { day: "01", value: 45 }, { day: "05", value: 52 }, { day: "10", value: 38 },
  { day: "15", value: 65 }, { day: "20", value: 48 }, { day: "25", value: 55 },
  { day: "30", value: 42 }
];

const categoryData = [
  { name: "Curanmor", value: 35, color: "#3B82F6" },
  { name: "Laka Lantas", value: 25, color: "#D4AF37" },
  { name: "Pencurian", value: 20, color: "#60A5FA" },
  { name: "Narkoba", value: 15, color: "#B8962F" },
  { name: "Lainnya", value: 5, color: "#1D4ED8" }
];

const performanceRanking = [
  { polres: "Kupang Kota", response: 4.2, pci: 94 },
  { polres: "Belu", response: 6.8, pci: 88 },
  { polres: "Sikka", response: 7.5, pci: 85 },
  { polres: "Ende", response: 8.1, pci: 82 },
  { polres: "Manggarai", response: 9.4, pci: 79 },
  { polres: "Alor", response: 10.2, pci: 75 }
];

const KPICard = ({ title, value, unit, trend, icon: Icon, trendValue }: KPICardProps) => (
  <div className="bg-[#0B1B32]/60 border border-white/5 backdrop-blur-xl rounded-[24px] p-6 flex flex-col gap-4 relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
      <Icon size={64} className="text-[#D4AF37]" />
    </div>
    <div className="flex items-center justify-between">
      <div className="p-3 bg-white/5 rounded-2xl">
        <Icon size={20} className="text-[#D4AF37]" />
      </div>
      <div className={cn(
        "flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-full",
        trend === "up" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
      )}>
        {trend === "up" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {trendValue}
      </div>
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-black text-white tracking-tighter">{value}</span>
        <span className="text-xs font-bold text-slate-400 uppercase">{unit}</span>
      </div>
    </div>
  </div>
);

export default function StatisticsView() {
  const [timeframe, setTimeframe] = useState("Monthly");

  return (
    <div className="flex flex-col h-full bg-[#07111F] overflow-hidden p-8 gap-8">
      {/* HEADER */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Operational Stats Anev</h2>
            <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black text-emerald-500 uppercase">Live Intelligence Data</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.3em]">Sentinel-AI Command Center Evaluation Engine</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-[#0B1B32] border border-white/10 rounded-2xl px-4 py-2.5 gap-3">
            <Calendar size={18} className="text-[#D4AF37]" />
            <select 
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-transparent border-none outline-none text-white text-xs font-black uppercase appearance-none pr-6 cursor-pointer"
            >
              <option value="Weekly">Weekly Recap</option>
              <option value="Monthly">Monthly Analysis</option>
              <option value="Yearly">Annual Report</option>
            </select>
          </div>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-[#D4AF37] hover:bg-[#B8962F] text-black rounded-2xl text-xs font-black uppercase transition-all shadow-lg shadow-[#D4AF37]/20">
            <Download size={18} /> Export Analytics
          </button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-4 gap-6 shrink-0">
        <KPICard 
          title="Total Kejadian (Month)" 
          value="1,244" 
          unit="Incidents" 
          trend="down" 
          trendValue="8.2%" 
          icon={Activity} 
        />
        <KPICard 
          title="Avg Response Time" 
          value="04:52" 
          unit="Min:Sec" 
          trend="up" 
          trendValue="1.4 Min" 
          icon={Clock} 
        />
        <KPICard 
          title="Efisiensi BBM Regional" 
          value="94.8" 
          unit="%" 
          trend="up" 
          trendValue="4.2%" 
          icon={Zap} 
        />
        <KPICard 
          title="Patrol Compliance (PCI)" 
          value="88.5" 
          unit="Score" 
          trend="up" 
          trendValue="12 pts" 
          icon={Shield} 
        />
      </div>

      {/* CHARTS GRID */}
      <div className="flex-1 grid grid-cols-12 grid-rows-2 gap-6 min-h-0">
        {/* CRIME TREND Area Chart */}
        <div className="col-span-8 bg-[#0B1B32]/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-md flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <TrendingUp className="text-[#3B82F6]" size={20} />
               <span className="text-xs font-black uppercase tracking-widest text-slate-200">Crime Trend Dynamics</span>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase">
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#3B82F6]" /> Real-time</div>
               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#D4AF37]" /> Target</div>
            </div>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={crimeTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="day" 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#64748b', fontWeight: 'bold' }} 
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#64748b', fontWeight: 'bold' }} 
                />
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B1B32', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#E2E8F0', fontWeight: '900' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3B82F6" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART Category */}
        <div className="col-span-4 bg-[#0B1B32]/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-md flex flex-col gap-6">
          <div className="flex items-center gap-3">
             <PieChartIcon className="text-[#D4AF37]" size={20} />
             <span className="text-xs font-black uppercase tracking-widest text-slate-200">Incident Distribution</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <span className="text-2xl font-black text-white leading-none">1.2K</span>
              <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Total Case</span>
            </div>
          </div>
          <div className="space-y-2">
             {categoryData.slice(0, 3).map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-[10px] font-bold text-slate-400">{item.name}</span>
                   </div>
                   <span className="text-[10px] font-black text-slate-200">{item.value}%</span>
                </div>
             ))}
          </div>
        </div>

        {/* POLRES RANKING Bar Chart */}
        <div className="col-span-12 row-start-2 bg-[#0B1B32]/40 border border-white/5 rounded-[32px] p-8 backdrop-blur-md flex flex-col gap-6">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <BarChart3 className="text-[#3B82F6]" size={20} />
                 <span className="text-xs font-black uppercase tracking-widest text-slate-200">Polres Performance Ranking (Top 6)</span>
              </div>
           </div>
           <div className="flex-1">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceRanking} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                   <XAxis 
                     dataKey="polres" 
                     stroke="#475569" 
                     fontSize={10} 
                     tickLine={false} 
                     axisLine={false} 
                     tick={{ fill: '#64748b', fontWeight: '900' }} 
                   />
                   <YAxis hide />
                   <Tooltip 
                     cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                     contentStyle={{ backgroundColor: '#0B1B32', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                   />
                   <Bar 
                     dataKey="pci" 
                     fill="#3B82F6" 
                     radius={[10, 10, 0, 0]} 
                     barSize={50} 
                     name="Compliance Score (%)"
                   />
                   <Bar 
                     dataKey="response" 
                     fill="#D4AF37" 
                     radius={[10, 10, 0, 0]} 
                     barSize={50} 
                     name="Response Speed (Min)"
                   />
                   <Legend 
                     verticalAlign="top" 
                     align="right" 
                     iconType="circle" 
                     wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', paddingBottom: '20px' }} 
                   />
                </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
}
