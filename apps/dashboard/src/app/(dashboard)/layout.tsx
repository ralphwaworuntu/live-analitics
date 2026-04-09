import DashboardShell from "@/components/layout/DashboardShell";
import FloatingWindowsProvider from "@/components/layout/FloatingWindowsManager";
import VisualHijackWrapper from "@/components/layout/VisualHijackWrapper";
import { SocketProvider } from "@/lib/socket";
import PersonnelTelemetryProvider from "@/components/providers/PersonnelTelemetryProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SocketProvider>
      <FloatingWindowsProvider>
        <VisualHijackWrapper>
          <PersonnelTelemetryProvider />
          <DashboardShell>{children}</DashboardShell>
        </VisualHijackWrapper>
      </FloatingWindowsProvider>
    </SocketProvider>
  );
}
