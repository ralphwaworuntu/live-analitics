"use client";

import React from "react";
import { Settings } from "lucide-react";

import AuditLogTable from "@/components/analytics/AuditLogTable";

export default function AnevView() {
  return (
    <div className="p-3 sm:p-6 md:p-10 h-full flex flex-col w-full bg-[#07111F] overflow-y-auto custom-scrollbar">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter italic">Tactical Audit & Anev</h2>
        <p className="text-slate-500 text-xs sm:text-sm uppercase font-bold tracking-[0.2em] mt-1">Operational Security Logging System • BIRO OPS POLDA NTT</p>
      </div>
      
      <div className="flex-1">
        <AuditLogTable />
      </div>
    </div>
  );
}
