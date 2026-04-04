"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from "@/components/ui/resizable";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import TopHeader from "@/components/layout/TopHeader";
import IntelligencePanel from "@/components/ai/IntelligencePanel";

export default function DashboardShell({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="h-screen w-full bg-[#07111F] text-[#EAF2FF] overflow-hidden flex">
      {/* Sidebar - Fixed Width as requested (280px) */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#07111F]">
        <TopHeader />
        
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
            >
            {/* @ts-expect-error react-resizable-panels types missing direction prop in this version */}
            <ResizablePanelGroup direction="horizontal" className="h-full w-full items-stretch relative">
              
              {/* Center Container (Map or Main View) */}
              <ResizablePanel defaultSize={75} minSize={40} className="relative z-10 bg-[var(--color-bg)]">
                <main className="h-full w-full relative overflow-hidden">
                  {children}
                </main>
              </ResizablePanel>

              <ResizableHandle withHandle className="z-40 border-l border-white/5 bg-slate-950" />

              {/* Intelligence Panel (Right Sidebar) - Collapsed by default to keep it clean */}
              <ResizablePanel
                defaultSize={0}
                minSize={0}
                maxSize={35}
                collapsible={true}
                className="z-30"
              >
                <IntelligencePanel />
              </ResizablePanel>

            </ResizablePanelGroup>
          </motion.div>
        </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
