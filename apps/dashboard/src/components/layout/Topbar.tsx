"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { getSelectedPolres, getUnreadNotificationCount, useAppStore } from "@/store";

export default function Topbar() {
  const router = useRouter();
  const [searchFocused, setSearchFocused] = useState(false);
  const [time, setTime] = useState("--:--:-- WITA");
  const selectedPolres = useAppStore(getSelectedPolres);
  const unreadCount = useAppStore(getUnreadNotificationCount);
  const searchQuery = useAppStore((state) => state.searchQuery);
  const emergency = useAppStore((state) => state.emergency);
  const allNotifications = useAppStore((state) => state.notifications);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  const triggerEmergency = useAppStore((state) => state.triggerEmergency);
  const clearEmergency = useAppStore((state) => state.clearEmergency);

  const notifications = useMemo(() => allNotifications.slice(0, 3), [allNotifications]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setTime(getCurrentWITA()), 0);
    const interval = window.setInterval(() => setTime(getCurrentWITA()), 1000);
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, []);

  const toggleEmergency = () => {
    if (emergency.active) {
      clearEmergency();
      return;
    }

    triggerEmergency({
      message: "SOS Button ditekan",
      location: selectedPolres ? `Lokasi: ${selectedPolres.name}` : "Lokasi: Pasar Inpres (Polres Kupang Kota)",
      severity: "kritis",
    });
  };

  return (
    <header
      className="fixed top-0 right-0 z-30 border-b border-[var(--color-border)] bg-[rgba(255,255,255,0.9)] px-6 backdrop-blur-xl"
      style={{
        height: "var(--topbar-height)",
        left: "var(--sidebar-collapsed)",
        transition: "left var(--transition-base)",
      }}
    >
      <div className="flex h-full items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="hidden xl:flex command-chip">
            <span className={`status-dot ${emergency.active ? "status-dot--danger" : "status-dot--online"}`} />
            <strong>{selectedPolres ? selectedPolres.name : "NTT Region"}</strong>
            <span>{emergency.active ? "Emergency Mode" : "Operational Grid"}</span>
          </div>

          <div
            className={`flex max-w-xl flex-1 items-center gap-3 rounded-2xl border px-4 py-3 transition-all duration-200 ${
              searchFocused
                ? "border-[var(--color-brand-primary)] bg-white shadow-[0_0_0_4px_rgba(31,103,204,0.08)]"
                : "border-[var(--color-border)] bg-[var(--color-panel)]"
            }`}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--color-subtle)]">Cari</span>
            <input
              type="text"
              value={searchQuery}
              placeholder="Cari lokasi, personil, kejadian, atau laporan"
              className="flex-1 border-none bg-transparent text-sm text-[var(--color-text)] outline-none placeholder-[var(--color-muted)]"
              onChange={(event) => setSearchQuery(event.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <kbd className="hidden rounded-lg border border-[var(--color-border)] px-2 py-1 text-[10px] font-mono text-[var(--color-muted)] md:inline-flex">
              Ctrl+K
            </kbd>
          </div>
        </div>

        <div className="hidden items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3 lg:flex">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-[0.24em] text-[var(--color-subtle)]">Posture</div>
            <div className={`text-sm font-semibold ${emergency.active ? "text-[var(--color-danger)]" : "text-[var(--color-success)]"}`}>
              {selectedPolres ? selectedPolres.status.toUpperCase() : emergency.active ? "EMERGENCY" : "KONDUSIF"}
            </div>
          </div>
          <div className="h-8 w-px bg-[var(--color-border)]" />
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-[0.24em] text-[var(--color-subtle)]">Waktu Lokal</div>
            <div className="metric text-sm font-semibold text-[var(--color-text)]">{time}</div>
          </div>
        </div>

        <div className="ml-2 flex items-center gap-2">
          <button
            onClick={() => router.push("/audit")}
            className="relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text)] transition-colors hover:border-[var(--color-brand-primary)]/40 hover:bg-white"
            title={notifications.map((item) => item.title).join(" | ")}
          >
            Alerts
            {unreadCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-danger)] px-1 text-[10px] text-white">
                {unreadCount}
              </span>
            ) : null}
          </button>

          <button
            onClick={toggleEmergency}
            className={`rounded-2xl border px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
              emergency.active
                ? "border-[var(--color-danger)] bg-[var(--color-danger)]/10 text-[var(--color-danger)] shadow-[var(--shadow-glow-danger)]"
                : "border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-text)] hover:border-[var(--color-danger)]/30 hover:text-[var(--color-danger)]"
            }`}
            title="Toggle Emergency"
          >
            Crisis
          </button>
        </div>
      </div>
    </header>
  );
}

function getCurrentWITA(): string {
  const now = new Date();
  const wita = new Date(now.getTime() + 8 * 60 * 60 * 1000 - now.getTimezoneOffset() * 60 * 1000);
  const hours = wita.getUTCHours().toString().padStart(2, "0");
  const minutes = wita.getUTCMinutes().toString().padStart(2, "0");
  const seconds = wita.getUTCSeconds().toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds} WITA`;
}
