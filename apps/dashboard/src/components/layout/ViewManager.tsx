"use client";

import React, { useEffect } from "react";
import DashboardView from "@/components/views/DashboardView";
import OperationsView from "@/components/views/OperationsView";
import IntelligenceView from "@/components/views/IntelligenceView";
import PatrolIntelView from "@/components/views/PatrolIntelView";
import AnevView from "@/components/views/AnevView";
import CoreDataView from "@/components/views/CoreDataView";
import StatisticsView from "@/components/views/StatisticsView";
import MemberTacticalPortal from "@/components/views/MemberTacticalPortal";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/lib/useAuth";

export default function ViewManager() {
  const { user, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") || "dashboard";

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#07111F]">
        <div className="w-12 h-12 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin" />
        <span className="mt-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Validating Identity...</span>
      </div>
    );
  }

  // If user is MEMBER, they ONLY get the Tactical Portal
  if (user?.role === "MEMBER") {
    return (
      <div className="flex-1 h-full overflow-hidden relative bg-[#07111F]">
        <AnimatePresence mode="wait">
          <motion.div
            key="member-portal"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full w-full"
          >
            <MemberTacticalPortal />
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // If user is SUPER_ADMIN or OPERATOR, they get the standard Command Center switcher
  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardView />;
      case "core-data":
        return <CoreDataView />;
      case "statistics":
        return <StatisticsView />;
      case "operasi":
        return <OperationsView />;
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
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="h-full w-full"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
