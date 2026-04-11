"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import MemberDashboardShell from "@/components/layout/MemberDashboardShell";
import FloatingWindowsProvider from "@/components/layout/FloatingWindowsManager";
import VisualHijackWrapper from "@/components/layout/VisualHijackWrapper";
import { SocketProvider } from "@/lib/socket";
import PersonnelTelemetryProvider from "@/components/providers/PersonnelTelemetryProvider";
import { useAuth } from "@/lib/useAuth";
import TacticalAlertBridge from "@/components/dashboard/TacticalAlertBridge";
import PermissionGuard from "@/components/auth/PermissionGuard";

function useBreakpoint(query: string) {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);
  
  return matches;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const isAboveMd = useBreakpoint("(min-width: 768px)");
  
  const Shell = user?.role === "MEMBER" ? MemberDashboardShell : DashboardShell;

  return (
    <SocketProvider>
      <FloatingWindowsProvider>
        <VisualHijackWrapper>
          <PersonnelTelemetryProvider />
          <PermissionGuard>
            {/* TacticalAlertBridge: Only for non-members and width > 768px */}
            {user?.role !== "MEMBER" && isAboveMd && <TacticalAlertBridge />}
            <Shell>{children}</Shell>
          </PermissionGuard>
        </VisualHijackWrapper>
      </FloatingWindowsProvider>
    </SocketProvider>
  );
}
