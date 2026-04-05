"use client";

import React from "react";
import DashboardView from "../../components/views/DashboardView";
import MissionView from "../../components/views/MissionView";
import IntelligenceView from "../../components/views/IntelligenceView";
import PatrolIntelView from "../../components/views/PatrolIntelView";
import AnevView from "../../components/views/AnevView";
import CoreDataView from "../../components/views/CoreDataView";
import StatisticsView from "../../components/views/StatisticsView";
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
        return <StatisticsView />;
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
