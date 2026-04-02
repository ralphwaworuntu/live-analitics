"use client";

import { AnimatePresence } from "framer-motion";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#07111F] text-[#EAF2FF] flex flex-col items-center justify-between p-6 lg:p-12 font-sans relative overflow-hidden">
      
      {/* Background System: Dark Tactical Map Aesthetic (Remains absolute) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#07111F] opacity-100" />
        <div 
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.08) 1.5px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
        <div 
          className="absolute inset-0 opacity-40 mix-blend-screen"
          style={{
            background: 'radial-gradient(50% 50% at 50% 50%, rgba(11, 74, 162, 0.2) 0%, rgba(7, 17, 31, 0) 100%)'
          }}
        />
        <div className="absolute top-[20%] left-[5%] w-[40vw] h-[40vh] border-[1px] border-white/5 rounded-full blur-[2px] opacity-20" />
        <div className="absolute bottom-[10%] right-[10%] w-[35vw] h-[35vh] border-[1px] border-[#D4AF37]/5 rounded-full blur-[1px] opacity-20" />
        <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37]/10 to-transparent scan-line-anim shadow-[0_0_15px_#D4AF37] top-0 opacity-30" />
      </div>

      {/* Spacer for top alignment on mobile, center on desktop */}
      <div className="hidden lg:block h-10" />

      {/* Main Login Interface Section */}
      <main className="z-10 w-full max-w-[480px] my-auto">
        <AnimatePresence mode="wait">
          <LoginForm key="login-interface" />
        </AnimatePresence>
      </main>
      
      {/* Footer System Status (Now safely below the card) */}
      <footer className="z-10 opacity-30 text-center py-6 mt-8">
        <div className="text-[10px] uppercase font-mono tracking-[0.4em] text-[#A9B9D6]">
          Sentinel v1.0.0 — Secured Command Stream
        </div>
      </footer>
    </div>
  );
}
