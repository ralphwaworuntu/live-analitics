"use client";

import React, { useState, useEffect } from "react";
import { 
  Map, 
  Plus, 
  Settings, 
  Bell, 
  ChevronDown,
  X,
  BellRing,
  Menu,
  LogOut,
  User as UserIcon
} from "lucide-react";
import { useAppStore } from "@/store";
import { motion, AnimatePresence } from "framer-motion";
import NotificationSheet from "./NotificationSheet";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

interface TopHeaderProps {
  onOpenSidebar?: () => void;
}

/**
 * TopHeader Component for Sentinel-AI Dashboard
 */
export default function TopHeader({ onOpenSidebar }: TopHeaderProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);
  
  const { incomingPublicReport, clearPublicReport, executeAction, toggleSettings, toggleNotifications } = useAppStore();
  const unreadCount = useAppStore(state => state.notifications?.filter((n: { read: boolean }) => !n.read).length || 0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    setIsProfileOpen(false);
    logout();
  };

  return (
    <>
      <header className="sticky top-0 z-[100] w-full h-14 md:h-16 bg-[#0B1B32] border-b border-white/5 flex items-center justify-between px-3 sm:px-4 md:px-8 shadow-2xl gap-2">
        
        {/* SISI KIRI */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6 min-w-0 animate-in fade-in slide-in-from-left duration-500">
          {/* Hamburger — mobile only */}
          {onOpenSidebar && (
            <button 
              onClick={onOpenSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer shrink-0"
            >
              <Menu size={22} />
            </button>
          )}

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="p-1.5 sm:p-2 bg-yellow-500/10 rounded-lg">
              <Map size={16} className="sm:w-[18px] sm:h-[18px] text-yellow-500" />
            </div>
            <span className="hidden sm:inline text-sm font-medium text-slate-200 tracking-wide">Radar Operasional</span>
          </div>

          {/* CITIZEN REPORT NOTIFICATION (Animated) */}
          <AnimatePresence>
            {incomingPublicReport && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0, x: -20 }}
                animate={{ scale: 1, opacity: 1, x: 0 }}
                exit={{ scale: 0.8, opacity: 0, x: -20 }}
                className="hidden sm:flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600/20 border border-red-500/30 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.2)]"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-ping" />
                  <BellRing size={14} className="text-red-500 relative z-10" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter leading-none">Incoming Report</span>
                  <span className="text-[9px] font-bold text-white uppercase italic tracking-widest truncate max-w-[120px] sm:max-w-none">{incomingPublicReport.locationName}</span>
                </div>
                <button 
                  onClick={clearPublicReport}
                  className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors ml-1 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SISI KANAN */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6 shrink-0 animate-in fade-in slide-in-from-right duration-500">
          
          {/* Button "+ Baru" - Hidden for MEMBER */}
          {user?.role !== "MEMBER" && (
            <button 
              onClick={() => executeAction("NEW_DATA")}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg border border-white/5 transition-all cursor-pointer min-h-[44px]"
            >
              <Plus size={14} />
              <span className="hidden md:inline">BARU</span>
            </button>
          )}

          {/* Action Icons */}
          <div className="flex items-center gap-1 sm:gap-3">
            {user?.role !== "MEMBER" && (
              <button 
                onClick={() => toggleSettings()}
                className="hidden sm:flex text-slate-500 hover:text-white transition-all transform hover:scale-110 active:scale-95 cursor-pointer min-h-[44px] min-w-[44px] items-center justify-center"
              >
                <Settings size={20} />
              </button>
            )}
            
            <button 
              onClick={() => toggleNotifications()}
              className="relative text-slate-500 hover:text-white transition-all transform hover:scale-110 active:scale-95 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 sm:-top-1.5 sm:-right-1.5 flex items-center justify-center min-w-[16px] h-4 px-1 bg-red-600 text-[10px] font-bold text-white rounded-full border-2 border-[#0B1B32]">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="hidden sm:block h-8 w-px bg-white/5" />

          {/* User Profile */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 sm:gap-3 group transition-all cursor-pointer min-h-[44px]"
            >
              <div className="w-8 h-8 rounded-full bg-slate-700 border border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-yellow-500/50 shrink-0">
                <span className="text-[10px] font-black text-white italic">
                  {user?.name?.split(' ').map(n => n[0]).slice(0,2).join('') || "U"}
                </span>
              </div>
              <div className="hidden lg:flex flex-col items-start translate-y-[1px]">
                <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                  {!isMounted ? "Loading..." : (user?.name || "Initializing...")}
                </span>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">
                  {!isMounted ? "..." : (user?.role?.replace("_", " ") || "AUTHENTICATING")}
                </span>
              </div>
              <ChevronDown size={14} className="hidden sm:block text-slate-500 group-hover:text-slate-200 group-hover:translate-y-0.5 transition-all" />
            </button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {isProfileOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsProfileOpen(false)} 
                  />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-[#0B1B32] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-white/10 bg-white/[0.02] flex flex-col">
                      <span className="font-bold text-white text-sm">{user?.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono mt-1">ID: {user?.nrp}</span>
                    </div>
                    <div className="p-2 flex flex-col gap-1">
                      <button className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                        <UserIcon size={16} className="text-slate-500" />
                        My Profile
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer mt-1"
                      >
                        <LogOut size={16} />
                        Logout & Clear Cache
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

        </div>
      </header>
      
      {/* GLOBAL SHEETS */}
      <NotificationSheet />
    </>
  );
}
