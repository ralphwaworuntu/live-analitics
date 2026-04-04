"use client";

import React, { useState } from "react";
import GoogleMap from "@/components/map/GoogleMap";
import ActionBar from "@/components/dashboard/ActionBar";

/**
 * SENTINEL Command Center View
 * Focus: Full-screen tactical GIS tracker for live patrol monitoring and tactical AI intel.
 */
export default function DashboardView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<"list" | "map">("map");

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[#07111F]">
      {/* ACTION BAR (TOP) */}
      <ActionBar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery}
        activeView={activeView}
        onToggleView={setActiveView}
      />

      {/* FULL-SCREEN TACTICAL MAP AREA */}
      <div className="flex-1 relative h-full">
        <div className="w-full h-full">
          <GoogleMap />
        </div>
      </div>
    </div>
  );
}
