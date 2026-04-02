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
}

const FloatingWindowsContext = createContext<FloatingWindowsContextType | null>(null);

export function useFloatingWindows() {
  const context = useContext(FloatingWindowsContext);
  if (!context) {
    throw new Error("useFloatingWindows must be used within FloatingWindowsProvider");
  }
  return context;
}

export default function FloatingWindowsProvider({ children }: { children: React.ReactNode }) {
  const [windows, setWindows] = useState<WindowData[]>([]);

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

  return (
    <FloatingWindowsContext.Provider value={{ addWindow, closeWindow }}>
      {children}
      {windows.map((window) => (
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
              <button
                className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--color-muted)] transition-colors hover:bg-[var(--color-danger)]/20 hover:text-[var(--color-danger)]"
                onClick={(event) => {
                  event.stopPropagation();
                  closeWindow(window.id);
                }}
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4">{window.content}</div>
          </div>
        </Rnd>
      ))}
    </FloatingWindowsContext.Provider>
  );
}
