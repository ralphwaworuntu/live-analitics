"use client";

import React, { useState, useEffect } from "react";
import { ShieldAlert, Lock } from "lucide-react";

export default function PermissionGuard({ children }: { children: React.ReactNode }) {
  const [permissionState, setPermissionState] = useState<PermissionState | "unknown">("unknown");

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.permissions) return;

    const checkPermission = async () => {
      try {
        const result = await navigator.permissions.query({ name: "geolocation" });
        setPermissionState(result.state);
        
        result.onchange = () => {
          setPermissionState(result.state);
        };
      } catch (error) {
        console.error("Permission query failed:", error);
        // Fallback: if browser doesn't support geolocation permission query, assume prompted or granted
        setPermissionState("granted");
      }
    };

    checkPermission();
  }, []);

  if (permissionState === "denied") {
    return (
      <div className="fixed inset-0 z-[10000] bg-[#07111F] flex items-center justify-center p-6 text-center select-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.1)_0%,transparent_70%)] animate-pulse" />
        
        <div className="max-w-md w-full bg-[#0B1B32] border-2 border-red-500/50 rounded-[32px] p-10 shadow-[0_0_50px_rgba(239,68,68,0.2)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse" />
          
          <div className="flex justify-center mb-8">
            <div className="relative">
              <ShieldAlert size={80} className="text-red-500 animate-bounce" />
              <div className="absolute -bottom-2 -right-2 bg-red-500 text-[#07111F] p-1.5 rounded-lg">
                <Lock size={20} />
              </div>
            </div>
          </div>
          
          <h1 className="text-2xl font-black uppercase tracking-tighter text-white mb-4 italic">
            Tactical Lockdown
          </h1>
          
          <div className="space-y-6">
            <p className="text-red-400 font-black text-sm uppercase tracking-widest leading-loose bg-red-500/10 p-4 rounded-xl border border-red-500/20">
              ⚠️ GPS SENSOR BLOCKED
            </p>
            
            <p className="text-slate-400 text-xs font-bold uppercase leading-relaxed tracking-wider px-4">
              Click the Lock Icon in the URL bar and select <span className="text-white">&apos;Allow&apos;</span> for Location to continue operation.
            </p>
            
            <div className="pt-6">
              <div className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.3em]">
                Waiting for Geolocation Protocol...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If loading or granted, show children
  return <>{children}</>;
}
