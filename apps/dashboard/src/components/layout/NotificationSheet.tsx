"use client";

import React from "react";
import { useAppStore } from "@/store";
import { X, CheckCircle2, Bell, ShieldAlert, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function NotificationSheet() {
  const { notifications, isNotificationsOpen, toggleNotifications, markNotificationRead } = useAppStore();

  if (!isNotificationsOpen) return null;

  const handleMarkAllRead = () => {
    notifications.forEach((n) => {
      if (!n.read) markNotificationRead(n.id);
    });
  };

  return (
    <AnimatePresence>
      {isNotificationsOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex justify-end"
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={() => toggleNotifications(false)} 
          />
          
          {/* Sheet */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="w-full max-w-sm h-full bg-[#0B1B32] border-l border-white/10 shadow-2xl relative z-10 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-[#D4AF37]" />
                <h2 className="text-sm font-black text-white uppercase tracking-widest">Notifikasi</h2>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleMarkAllRead}
                  className="text-[10px] uppercase font-black tracking-widest text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 size={14} /> Tandai Dibaca
                </button>
                <button 
                  onClick={() => toggleNotifications(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 transition-colors cursor-pointer ml-2"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-50">
                  <Bell size={40} className="mb-4 text-slate-500" />
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Belum ada notifikasi</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => markNotificationRead(n.id)}
                      className={cn(
                        "p-4 rounded-xl border transition-all cursor-pointer",
                        n.read ? "bg-white/5 border-transparent opacity-60" : "bg-white/10 border-white/10 hover:bg-white/15",
                        !n.read && n.level === "critical" && "border-red-500/50 bg-red-500/10",
                        !n.read && n.level === "success" && "border-emerald-500/30"
                      )}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                          {n.level === "critical" && <ShieldAlert size={14} className="text-red-500" />}
                          {n.level === "success" && <Check size={14} className="text-emerald-500" />}
                          <h4 className="text-xs font-black text-white uppercase tracking-wider">{n.title}</h4>
                        </div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-medium leading-relaxed">{n.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-3 border-t border-white/10 text-center bg-white/[0.01]">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">SENTINEL ALERT SYSTEM</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
