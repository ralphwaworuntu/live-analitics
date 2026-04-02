"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from "@/components/ui/resizable";
import TacticalSidebar from "@/components/layout/TacticalSidebar";
import IntelligencePanel from "@/components/ai/IntelligencePanel";
import TacticalMap from "@/components/map/TacticalMap";

export default function DashboardShell({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();

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
          <ResizablePanelGroup direction="horizontal" className="h-full w-full items-stretch">
            
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

            {/* GIS Map Container (Tengah) */}
            <ResizablePanel defaultSize={55} minSize={40} className="relative z-10">
              <div className="h-full w-full relative">
                {/* Home case includes child pages, but let's prioritize the TacticalMap as the core */}
                {pathname === "/" ? (
                   <TacticalMap />
                ) : (
                   <main className="h-full w-full bg-[#07111F] p-6 overflow-auto">
                     {children}
                   </main>
                )}
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle className="z-40" />

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
