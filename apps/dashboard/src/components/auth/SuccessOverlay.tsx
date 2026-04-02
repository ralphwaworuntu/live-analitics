"use client";


export function SuccessOverlay({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07111F] bg-opacity-[0.98] backdrop-blur-2xl transition-opacity animate-in fade-in duration-1000">
      
      {/* HUD Scanner lines mapping to CSS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="w-full h-2 bg-[#18C29C] shadow-[0_0_30px_#18C29C] opacity-70 scan-line-anim" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(24,194,156,0.05)_1px,transparent_1px)] bg-[size:100%_4px] opacity-40" />
      </div>
      
      <div className="flex flex-col items-center animate-in zoom-in-95 duration-700 delay-100 fill-mode-both relative z-10">
        
        {/* Animated Checkmark Circle */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#18C29C]/10 border border-[#18C29C]/50 flex items-center justify-center shadow-[0_0_50px_rgba(24,194,156,0.25)] mb-8 relative group">
          <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-[#18C29C] animate-spin [animation-duration:3s]" />
          <div className="absolute inset-2 rounded-full border-b-2 border-l-2 border-[#18C29C]/50 animate-spin [animation-duration:2s] [animation-direction:reverse]" />
          
          <svg className="w-10 h-10 sm:w-12 sm:h-12 text-[#18C29C] animate-in zoom-in duration-500 delay-300 fill-mode-both" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h2 className="text-[#18C29C] text-2xl sm:text-4xl font-bold font-mono tracking-[0.2em] mb-3 shadow-[0_0_10px_rgba(24,194,156,0.1)] text-center animate-in slide-in-from-bottom-4 duration-500 delay-500 fill-mode-both">
          ACCESS GRANTED
        </h2>
        
        <p className="text-[#A9B9D6] tracking-[0.3em] overflow-hidden whitespace-nowrap text-[10px] sm:text-xs uppercase font-mono bg-[#0B1B32] px-4 py-2 rounded-full border border-white/5 animate-in slide-in-from-bottom-4 duration-500 delay-700 fill-mode-both shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
          Initializing Dashboard...
        </p>
      </div>
    </div>
  );
}
