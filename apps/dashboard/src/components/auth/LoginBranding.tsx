"use client";

import { SystemStatus } from "./SystemStatus";

export function LoginBranding() {
  return (
    <div className="flex flex-col justify-center h-full relative lg:pt-0 pt-6">
      <div className="absolute left-0 top-0 w-px h-[100px] bg-gradient-to-b from-transparent via-[#D4AF37]/50 to-transparent hidden lg:block" />
      <div className="lg:pl-6 lg:border-l border-white/5">
        
        {/* Logo and Dept */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 animate-in fade-in slide-in-from-left-4 duration-500 delay-100 fill-mode-both">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-[#0B4AA2] to-[#07111F] border border-white/10 shadow-[0_0_24px_rgba(11,74,162,0.4)] flex items-center justify-center relative group">
            <div className="absolute inset-0 rounded-xl ring-2 ring-[#D4AF37]/20 group-hover:ring-[#D4AF37]/50 transition-all duration-500" />
            {/* Placeholder Shield Icon for Polda Logo */}
            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-widest text-[#D4AF37] uppercase">Polda NTT</h2>
              <p className="text-[10px] sm:text-xs text-white/50 uppercase tracking-[0.2em] font-medium mt-0.5">Biro Operasi</p>
          </div>
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold leading-[1.1] mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/60 tracking-tight animate-in fade-in slide-in-from-left-4 duration-500 delay-200 fill-mode-both">
          TACTICAL<br className="hidden sm:block" /> COMMAND<br className="hidden sm:block" /> CENTER
        </h1>
        
        <p className="text-[#A9B9D6] text-sm sm:text-base lg:text-lg max-w-md mb-8 lg:mb-12 leading-relaxed animate-in fade-in slide-in-from-left-4 duration-500 delay-300 fill-mode-both hidden sm:block">
          Sistem Intelligence dan Tracking Terpadu untuk monitoring dan pengambilan keputusan taktis yang presisi, aman, dan real-time.
        </p>

        <div className="hidden lg:flex gap-10 animate-in fade-in slide-in-from-left-4 duration-500 delay-500 fill-mode-both">
            <div className="space-y-1">
              <div className="text-3xl font-mono text-[#D4AF37] font-semibold">24/7</div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/50 font-semibold">Monitoring</div>
            </div>
            <div className="w-px bg-gradient-to-t from-transparent via-white/20 to-transparent" />
            <div className="space-y-1">
              <div className="text-3xl font-mono text-[#18C29C] font-semibold flex items-center gap-2">
                <div className="relative flex items-center justify-center">
                  <span className="absolute w-4 h-4 rounded-full bg-[#18C29C] opacity-40 animate-ping" />
                  <span className="relative w-2 h-2 rounded-full bg-[#18C29C] shadow-[0_0_8px_#18C29C]" />
                </div>
                LIVE
              </div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/50 font-semibold">Data Stream</div>
            </div>
        </div>

        {/* Live Status Indicators (Hidden on very small screens to save space) */}
        <div className="hidden sm:block animate-in fade-in slide-in-from-left-4 duration-500 delay-700 fill-mode-both">
          <SystemStatus />
        </div>
      </div>
    </div>
  );
}
