"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { mockComparisonData, PolresComparisonId } from "@/lib/mockComparisonData";

interface ComparisonProps {
  polresA: PolresComparisonId | string;
  polresB: PolresComparisonId | string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-[var(--color-border)] bg-[rgba(11,27,50,0.9)] p-3 shadow-lg backdrop-blur-md">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[var(--color-brand-gold)]">{label}</p>
        <div className="flex flex-col gap-2 mt-2">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between text-[11px] text-white gap-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="font-mono opacity-80">{entry.name}:</span>
              </div>
              <span className="font-bold">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function ComparisonWindow({ polresA, polresB }: ComparisonProps) {
  const [activeTab, setActiveTab] = useState<"crime" | "personnel" | "response">("crime");

  // Fallback to defaults if the IDs don't match our dummy set
  const dataA = mockComparisonData[polresA as PolresComparisonId] || mockComparisonData["kupang-kota"];
  const dataB = mockComparisonData[polresB as PolresComparisonId] || mockComparisonData["manggarai-barat"];

  const combinedCrime = useMemo(() => {
    return dataA.crimeTrend.map((a, i) => ({
      month: a.month,
      PolresA: a.count,
      PolresB: dataB.crimeTrend[i]?.count || 0,
    }));
  }, [dataA, dataB]);

  const combinedResponse = useMemo(() => {
    return dataA.responseTime.map((a, i) => ({
      month: a.month,
      PolresA: a.avgMinutes,
      PolresB: dataB.responseTime[i]?.avgMinutes || 0,
    }));
  }, [dataA, dataB]);

  const combinedPersonnel = useMemo(() => {
    return dataA.personnelStrength.map((a, i) => ({
      category: a.category,
      PolresA: a.count,
      PolresB: dataB.personnelStrength[i]?.count || 0,
    }));
  }, [dataA, dataB]);


  return (
    <div className="flex h-full w-full flex-col bg-[var(--color-bg)]/50">
      <div className="flex border-b border-[var(--color-border)] bg-[var(--color-panel)] px-2">
        <button
          onClick={() => setActiveTab("crime")}
          className={`border-b-2 px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] transition-colors ${
            activeTab === "crime" ? "border-[var(--color-brand-gold)] text-[var(--color-brand-gold)]" : "border-transparent text-[var(--color-muted)] hover:text-white"
          }`}
        >
          Kriminalitas
        </button>
        <button
          onClick={() => setActiveTab("response")}
          className={`border-b-2 px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] transition-colors ${
            activeTab === "response" ? "border-[var(--color-brand-gold)] text-[var(--color-brand-gold)]" : "border-transparent text-[var(--color-muted)] hover:text-white"
          }`}
        >
          Response Time
        </button>
        <button
          onClick={() => setActiveTab("personnel")}
          className={`border-b-2 px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] transition-colors ${
            activeTab === "personnel" ? "border-[var(--color-brand-gold)] text-[var(--color-brand-gold)]" : "border-transparent text-[var(--color-muted)] hover:text-white"
          }`}
        >
          Personil
        </button>
      </div>

      <div className="flex-1 p-4">
        {activeTab === "crime" && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedCrime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A384A" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
              <Line type="monotone" name={dataA.name} dataKey="PolresA" stroke="#D4AF37" strokeWidth={2} dot={{ r: 3, fill: "#D4AF37" }} activeDot={{ r: 5 }} />
              <Line type="monotone" name={dataB.name} dataKey="PolresB" stroke="#4880C8" strokeWidth={2} dot={{ r: 3, fill: "#4880C8" }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        )}

        {activeTab === "response" && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={combinedResponse} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D84F5F" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D84F5F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A384A" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
              <Area type="monotone" name={dataA.name} dataKey="PolresA" stroke="#D4AF37" fillOpacity={1} fill="url(#colorA)" />
              <Area type="monotone" name={dataB.name} dataKey="PolresB" stroke="#D84F5F" fillOpacity={1} fill="url(#colorB)" />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeTab === "personnel" && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={combinedPersonnel} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A384A" vertical={false} />
              <XAxis dataKey="category" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
              <Bar name={dataA.name} dataKey="PolresA" fill="#D4AF37" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar name={dataB.name} dataKey="PolresB" fill="#18C29C" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
