"use client";

import { useState, useEffect, type ReactNode } from "react";

interface HydrationGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function HydrationGuard({ children, fallback }: HydrationGuardProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <>
        {fallback ?? (
          <div className="h-screen w-full bg-[#07111F] flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-t-[#D4AF37] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-t-transparent border-r-[#D4AF37]/30 border-b-transparent border-l-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }} />
            </div>
            <div className="mt-8 text-center">
              <h1 className="text-xl font-black tracking-[0.3em] text-[#D4AF37] uppercase">SENTINEL</h1>
              <p className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase mt-2">Initializing Command Center...</p>
            </div>
            <div className="mt-12 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-[#D4AF37] rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
}
