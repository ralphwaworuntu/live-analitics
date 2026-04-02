import DashboardShell from "@/components/layout/DashboardShell";
import FloatingWindowsProvider from "@/components/layout/FloatingWindowsManager";
import VisualHijackWrapper from "@/components/layout/VisualHijackWrapper";
import { SocketProvider } from "@/lib/socket";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SocketProvider>
      <FloatingWindowsProvider>
        <VisualHijackWrapper>
          <DashboardShell>{children}</DashboardShell>
        </VisualHijackWrapper>
      </FloatingWindowsProvider>
    </SocketProvider>
  );
}
