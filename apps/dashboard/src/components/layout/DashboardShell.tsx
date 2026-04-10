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
import TacticalAlertBridge from "@/components/dashboard/TacticalAlertBridge";
import TacticalComms from "@/components/dashboard/TacticalComms";

function useBreakpoint(query: string) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

export default function DashboardShell({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Breakpoints
  const isAboveLg = useBreakpoint("(min-width: 1024px)");  // lg
  const isAboveMd = useBreakpoint("(min-width: 768px)");   // md

  // Sidebar is collapsed when between md-lg or when window is between lg and xl
  const sidebarCollapsed = isAboveMd && !isAboveLg;

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="h-screen w-full bg-[#07111F] text-[#EAF2FF] overflow-hidden flex">

      {/* Desktop Sidebar — permanent, hidden on mobile (<768px) */}
      <div className="hidden md:block">
        <Sidebar collapsed={sidebarCollapsed} />
      </div>

      {/* Mobile Sidebar — off-canvas drawer overlay (<768px) */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-[200] md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={closeSidebar}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="absolute left-0 top-0 h-full w-[280px] shadow-2xl"
            >
              <Sidebar onClose={closeSidebar} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#07111F] min-w-0">
        <TopHeader onOpenSidebar={openSidebar} />
        <TacticalAlertBridge />
        
        {/* Independent scrollable main content area */}
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
                <main className="h-full w-full relative overflow-hidden overflow-y-auto">
                  {children}
                </main>
              </ResizablePanel>

              <ResizableHandle withHandle className="z-40 border-l border-white/5 bg-slate-950 hidden md:flex" />

              {/* Intelligence Panel — hidden on mobile */}
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
