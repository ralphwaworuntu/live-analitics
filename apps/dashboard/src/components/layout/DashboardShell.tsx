"use client";

import React, { useState, useCallback, useEffect } from "react";
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
import TacticalComms from "@/components/dashboard/TacticalComms";
import DashboardErrorBoundary from "@/components/shared/ErrorBoundary";
import { Suspense } from "react";
import { useAppStore } from "@/store";

function useBreakpoint(query: string) {
  const [matches, setMatches] = useState(() => false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

export default function DashboardShell({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isSidebarCollapsed = useAppStore((state) => state.isSidebarCollapsed ?? false);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);

  const isAboveLg = useBreakpoint("(min-width: 1024px)");
  const isAboveMd = useBreakpoint("(min-width: 768px)");

  useEffect(() => {
    if (!isMounted) return;
    if (isAboveMd && !isAboveLg) {
      toggleSidebar(true);
    }
  }, [isMounted, isAboveMd, isAboveLg, toggleSidebar]);

  const openSidebar = useCallback(() => setMobileSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setMobileSidebarOpen(false), []);
  const sidebarFallback = <div className="h-full w-[68px] shrink-0 border-r border-white/5 bg-[#0B1B32]" />;

  return (
    <div className="h-screen w-full bg-[#07111F] text-[#EAF2FF] overflow-hidden flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Suspense fallback={sidebarFallback}>
          <Sidebar collapsed={isSidebarCollapsed} />
        </Suspense>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-[200] md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={closeSidebar}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="absolute left-0 top-0 h-full w-[280px] shadow-2xl"
            >
              <Suspense fallback={<div className="h-full w-full border-r border-white/5 bg-[#0B1B32]" />}>
                <Sidebar onClose={closeSidebar} />
              </Suspense>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#07111F] min-w-0">
        <TopHeader onOpenSidebar={openSidebar} />
        <TacticalComms />
        
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
              {/* @ts-ignore - direction prop required by react-resizable-panels */}
              <ResizablePanelGroup direction="horizontal" className="h-full w-full items-stretch relative">
                <ResizablePanel defaultSize={75} minSize={40} className="relative z-10">
                  <main className="h-full w-full relative overflow-hidden overflow-y-auto">
                    <DashboardErrorBoundary fallbackTitle="Tactical View Processor">
                      <Suspense fallback={
                        <div className="flex flex-col items-center justify-center h-full bg-[#07111F]">
                          <div className="w-12 h-12 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin" />
                          <span className="mt-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Synchronizing Stream...</span>
                        </div>
                      }>
                        {children}
                      </Suspense>
                    </DashboardErrorBoundary>
                  </main>
                </ResizablePanel>

                <ResizableHandle withHandle className="z-40 border-l border-white/5 bg-slate-950 hidden md:flex" />

                <ResizablePanel
                  defaultSize={0}
                  minSize={0}
                  maxSize={35}
                  collapsible={true}
                  className="z-30 hidden md:block"
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
