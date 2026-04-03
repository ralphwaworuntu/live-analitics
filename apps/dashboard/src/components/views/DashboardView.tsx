"use client";

import React from "react";
import GoogleMap from "@/components/map/GoogleMap";
import SummaryPanel from "@/components/views/SummaryPanel";

/**
 * Three-Column Split Dashboard:
 * 1. SidebarNav (already in app page.tsx)
 * 2. Google Maps area (Flex-1)
 * 3. Tactical Summary area (400px Right)
 */
export default function DashboardView() {
  return (
    <div className="flex flex-row h-full w-full overflow-hidden bg-[#07111F]">
      {/* AREA PETA (TENGAH) */}
      <div className="flex-1 relative h-full">
        <div className="absolute inset-x-0 top-0 z-20 p-4 bg-gradient-to-b from-[#07111F]/80 to-transparent flex items-center justify-between pointer-events-none">
           <div className="flex items-center gap-3 bg-slate-950/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse border border-emerald-400/50 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              <span className="text-xs uppercase font-bold tracking-widest text-slate-200">GIS Sentinel Engine Active</span>
           </div>
        </div>
        
        <GoogleMap />
      </div>

      {/* AREA SUMMARY (KANAN) */}
      <SummaryPanel />
    </div>
  );
}
