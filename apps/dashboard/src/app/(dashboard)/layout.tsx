"use client";

import DashboardShell from "@/components/layout/DashboardShell";
import MemberDashboardShell from "@/components/layout/MemberDashboardShell";
import FloatingWindowsProvider from "@/components/layout/FloatingWindowsManager";
import VisualHijackWrapper from "@/components/layout/VisualHijackWrapper";
import { SocketProvider } from "@/lib/socket";
import PersonnelTelemetryProvider from "@/components/providers/PersonnelTelemetryProvider";
import { useAuth } from "@/lib/useAuth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  
  const Shell = user?.role === "MEMBER" ? MemberDashboardShell : DashboardShell;

  return (
    <SocketProvider>
      <FloatingWindowsProvider>
        <VisualHijackWrapper>
          <PersonnelTelemetryProvider />
          <Shell>{children}</Shell>
        </VisualHijackWrapper>
      </FloatingWindowsProvider>
    </SocketProvider>
  );
}
