"use client";

import React from "react";
import DashboardView from "../../components/views/DashboardView";
import MissionView from "../../components/views/MissionView";
import IntelligenceView from "../../components/views/IntelligenceView";
import PatrolIntelView from "../../components/views/PatrolIntelView";
import AnevView from "../../components/views/AnevView";
import CoreDataView from "../../components/views/CoreDataView";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function DashboardContent() {
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") || "dashboard";

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardView />;
      case "core-data":
        return <CoreDataView />;
      case "statistics":
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 animate-in fade-in zoom-in duration-500">
            <h2 className="text-xl font-bold uppercase tracking-widest font-mono">Polda NTT • Statistics Anev</h2>
            <p className="mt-2 text-sm text-slate-600">Sinkronisasi Laporan Operasional Sektor NTT</p>
          </div>
        );
      case "operasi":
        return <MissionView />;
      case "patrol":
        return <PatrolIntelView />;
      case "intelijen":
        return <IntelligenceView />;
      case "sistem":
        return <AnevView />;
      case "wilayah":
        return (
          <div className="flex items-center justify-center h-full text-slate-400">
            Peta Wilayah NTT (Menunggu Integrasi Map Engine)
          </div>
        );
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex-1 h-full overflow-hidden relative bg-[#07111F]">
      {renderContent()}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="h-full w-full bg-[#07111F]" />}>
      <DashboardContent />
    </Suspense>
  );
}
