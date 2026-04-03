"use client";

import React, { useState } from "react";
import SidebarNav from "@/components/layout/SidebarNav";
import DashboardView from "../../components/views/DashboardView";
import MissionView from "../../components/views/MissionView";
import IntelligenceView from "../../components/views/IntelligenceView";
import PatrolIntelView from "../../components/views/PatrolIntelView";
import AnevView from "../../components/views/AnevView";

export default function DashboardPage() {
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  const renderContent = () => {
    switch (activeMenu) {
      case "Dashboard":
        return <DashboardView />;
      case "Operasi":
        return <MissionView />;
      case "Patrol Analysis":
        return <PatrolIntelView />;
      case "Intelijen":
        return <IntelligenceView />;
      case "Sistem":
        return <AnevView />;
      case "Wilayah (21 Polres)":
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
    <div className="flex h-screen w-full bg-[#07111F] text-[#EAF2FF] overflow-hidden">
      <SidebarNav activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <main className="flex-1 overflow-auto bg-[#07111F] relative">
        {renderContent()}
      </main>
    </div>
  );
}
