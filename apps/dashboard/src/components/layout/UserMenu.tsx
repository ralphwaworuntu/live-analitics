"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function UserMenu() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <div className="flex w-full items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-white px-3 py-3">
      <div className="relative shrink-0">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(31,103,204,0.92),rgba(185,139,0,0.45))] text-sm font-semibold text-white shadow-[var(--shadow-soft)]">
          SP
        </div>
        <div className="status-dot status-dot--online absolute -bottom-0.5 -right-0.5 border-2 border-white" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-semibold text-[var(--color-text)]">AKBP Surya P.</div>
        <div className="truncate text-[10px] uppercase tracking-[0.2em] text-[var(--color-muted)]">
          Kasubbag Renops
        </div>
      </div>
      <button
        onClick={handleLogout}
        disabled={loggingOut}
        title="Logout"
        className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)] transition-colors hover:border-[var(--color-danger)]/40 hover:text-[var(--color-danger)]"
      >
        {loggingOut ? "Wait" : "Exit"}
      </button>
    </div>
  );
}
