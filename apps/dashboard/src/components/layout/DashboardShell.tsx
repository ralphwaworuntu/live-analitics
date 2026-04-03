"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from "@/components/ui/resizable";
import { usePathname } from "next/navigation";
import TacticalSidebar from "@/components/layout/TacticalSidebar";
import IntelligencePanel from "@/components/ai/IntelligencePanel";

export default function DashboardShell({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();

  // BYPASS FOR ABSOLUTE-ONLY HUD (HOME PAGE)
  if (pathname === "/") return <>{children}</>;

  return (
    <div className="h-screen w-full bg-[#07111F] text-[#EAF2FF] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key="dashboard-root"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full w-full"
        >
          {/* @ts-expect-error react-resizable-panels types missing direction prop in this version */}
          <ResizablePanelGroup direction="horizontal" className="h-[100dvh] w-full items-stretch relative">
            
            {/* Sidebar Taktis (Kiri) */}
            <ResizablePanel
              defaultSize={20}
              minSize={15}
              maxSize={25}
              className="z-30"
            >
               <TacticalSidebar />
            </ResizablePanel>

            <ResizableHandle withHandle className="z-40" />

            {/* Center Container */}
            <ResizablePanel defaultSize={55} minSize={40} className="relative z-10 bg-[var(--color-bg)]">
              <main className="h-full w-full relative overflow-hidden">
                {children}
              </main>
            </ResizablePanel>

            <ResizableHandle withHandle className="z-40 border-l border-white/5 bg-slate-950" />

            {/* Intelligence Panel (Kanan) */}
            <ResizablePanel
              defaultSize={25}
              minSize={20}
              maxSize={35}
              className="z-30"
            >
              <IntelligencePanel />
            </ResizablePanel>

          </ResizablePanelGroup>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
