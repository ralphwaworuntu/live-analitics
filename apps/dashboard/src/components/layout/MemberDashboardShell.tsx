"use client";

import React, { Suspense } from "react";
import DashboardErrorBoundary from "@/components/shared/ErrorBoundary";
import TopHeader from "./TopHeader";
export default function MemberDashboardShell({ children }: { children?: React.ReactNode }) {
  return (
    <div className="h-screen w-full bg-[#000000] text-[#EAF2FF] overflow-hidden flex flex-col">
      <TopHeader />
      
      <main className="flex-1 w-full relative overflow-hidden bg-[var(--color-bg)]">
        <DashboardErrorBoundary fallbackTitle="Member Portal Processor">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center h-full bg-[#000000]">
              <div className="w-12 h-12 border-4 border-t-[#D4AF37] border-r-transparent border-b-[#D4AF37] border-l-transparent rounded-full animate-spin" />
              <span className="mt-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Connecting to Command...</span>
            </div>
          }>
            {children}
          </Suspense>
        </DashboardErrorBoundary>
      </main>
    </div>
  );
}
