"use client";

import { createContext, useContext, useState } from "react";
import { Rnd } from "react-rnd";

interface WindowData {
  id: string;
  title: string;
  content: React.ReactNode;
  defaultX: number;
  defaultY: number;
}

interface FloatingWindowsContextType {
  addWindow: (id: string, title: string, content: React.ReactNode) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
}

const FloatingWindowsContext = createContext<FloatingWindowsContextType | null>(null);

export function useFloatingWindows() {
  const context = useContext(FloatingWindowsContext);
  if (!context) {
    throw new Error("useFloatingWindows must be used within FloatingWindowsProvider");
  }
  return context;
}

import { AnimatePresence, motion } from "framer-motion";

export default function FloatingWindowsProvider({ children }: { children: React.ReactNode }) {
  const [windows, setWindows] = useState<(WindowData & { minimized?: boolean })[]>([]);

  const addWindow = (id: string, title: string, content: React.ReactNode) => {
    setWindows((current) => {
      if (current.find((window) => window.id === id)) {
        return current;
      }

      return [
        ...current,
        {
          id,
          title,
          content,
          defaultX: 100 + current.length * 40,
          defaultY: 100 + current.length * 40,
        },
      ];
    });
  };

  const closeWindow = (id: string) => {
    setWindows((current) => current.filter((window) => window.id !== id));
  };

  const minimizeWindow = (id: string) => {
    setWindows((current) => current.map(w => w.id === id ? { ...w, minimized: true } : w));
  };

  const restoreWindow = (id: string) => {
    setWindows((current) => current.map(w => w.id === id ? { ...w, minimized: false } : w));
  };

  return (
    <FloatingWindowsContext.Provider value={{ addWindow, closeWindow, minimizeWindow, restoreWindow }}>
      {children}
      
      {/* Minimized Windows Dock */}
      <div className="fixed bottom-6 left-4 md:left-[88px] lg:left-[300px] z-50 flex flex-row flex-wrap gap-2 pointer-events-none">
        {windows.filter(w => w.minimized).map(window => (
          <button
            key={`min-${window.id}`}
            onClick={() => restoreWindow(window.id)}
            className="pointer-events-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-brand-gold)] shadow-lg backdrop-blur-md transition-all hover:border-[var(--color-brand-gold)] hover:bg-[var(--color-surface-2)] flex items-center justify-between min-w-[200px]"
          >
            <span className="truncate">{window.title}</span>
            <span className="ml-2">◱</span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {windows.filter(w => !w.minimized).map((window) => (
          <motion.div
            key={window.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{ position: 'fixed', zIndex: 100 }}
          >
            <Rnd
          key={window.id}
          default={{
            x: window.defaultX,
            y: window.defaultY,
            width: 400,
            height: 300,
          }}
          minWidth={320}
          minHeight={220}
          bounds="window"
          dragHandleClassName="drag-handle"
          className="z-50"
          style={{ position: "fixed" }}
        >
          <div className="glass-card flex h-full w-full flex-col overflow-hidden border-[var(--color-border-hover)] bg-[var(--color-bg)]/90 shadow-[var(--shadow-float)] backdrop-blur-2xl">
            <div className="drag-handle flex cursor-grab items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 active:cursor-grabbing">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[var(--color-brand-gold)]">■</span>
                <span className="max-w-[250px] truncate text-xs font-semibold text-white">
                  {window.title}
                </span>
              </div>
              <div className="flex items-center">
                <button
                  className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--color-muted)] transition-colors hover:bg-white/10 hover:text-white"
                  onClick={(event) => {
                    event.stopPropagation();
                    minimizeWindow(window.id);
                  }}
                  title="Minimize"
                >
                  –
                </button>
                <button
                  className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--color-muted)] transition-colors hover:bg-[var(--color-danger)]/20 hover:text-[var(--color-danger)]"
                  onClick={(event) => {
                    event.stopPropagation();
                    closeWindow(window.id);
                  }}
                  title="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4">{window.content}</div>
          </div>
        </Rnd>
          </motion.div>
        ))}
      </AnimatePresence>
    </FloatingWindowsContext.Provider>
  );
}
