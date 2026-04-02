import DashboardShell from "@/components/layout/DashboardShell";
import FloatingWindowsProvider from "@/components/layout/FloatingWindowsManager";
import VisualHijackWrapper from "@/components/layout/VisualHijackWrapper";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FloatingWindowsProvider>
      <VisualHijackWrapper>
        <DashboardShell>{children}</DashboardShell>
      </VisualHijackWrapper>
    </FloatingWindowsProvider>
  );
}
