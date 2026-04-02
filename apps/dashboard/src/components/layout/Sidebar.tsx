"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

import { UserMenu } from "@/components/layout/UserMenu";
import { navGroups } from "@/lib/nav";
import { useAppStore } from "@/store";

export default function Sidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(true);
  const searchQuery = useAppStore((state) => state.searchQuery);
  const selectedPolresId = useAppStore((state) => state.selectedPolresId);

  const visibleGroups = useMemo(() => {
    if (!searchQuery.trim()) {
      return navGroups;
    }

    const query = searchQuery.toLowerCase();
    return navGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.label.toLowerCase().includes(query)),
      }))
      .filter((group) => group.items.length > 0);
  }, [searchQuery]);

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      style={{
        width: expanded ? "var(--sidebar-expanded)" : "var(--sidebar-collapsed)",
        transition: "width var(--transition-base)",
      }}
      className="fixed left-0 top-0 z-40 flex h-screen flex-col overflow-hidden"
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#ffffff,#f8fbff)]" />
      <div className="absolute inset-y-0 right-0 w-px bg-[linear-gradient(180deg,transparent,rgba(24,50,77,0.12),transparent)]" />

      <div className="relative z-10 flex h-full flex-col">
        <div
          className="border-b border-[var(--color-border)] px-4 py-4"
          style={{ minHeight: "var(--topbar-height)" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(31,103,204,1),rgba(185,139,0,0.7))] text-sm font-black tracking-[0.18em] text-white shadow-[var(--shadow-soft)]">
              SNT
            </div>
            {expanded ? (
              <div className="min-w-0 animate-[fade-in_0.2s_ease] overflow-hidden whitespace-nowrap">
                <div className="text-sm font-semibold text-[var(--color-text)]">SENTINEL</div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-[var(--color-muted)]">
                  Command Grid Polda NTT
                </div>
              </div>
            ) : null}
          </div>
          {expanded ? (
            <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-3 text-[11px] text-[var(--color-muted)]">
              <div className="eyebrow">Focus</div>
              <div className="mt-2 text-xs font-semibold text-[var(--color-text)]">
                {selectedPolresId ? `Wilayah aktif: ${selectedPolresId}` : "NTT Regional Overview"}
              </div>
              <div className="mt-1">Navigasi, AI, dan peta mengikuti context yang sama.</div>
            </div>
          ) : null}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {visibleGroups.map((group) => (
            <div key={group.title} className="mb-5">
              {expanded ? (
                <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--color-subtle)]">
                  {group.title}
                </div>
              ) : null}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  const isSelectedPolres = item.href.startsWith("/polres/") && item.id === selectedPolresId;

                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className={`group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-all duration-200 ${
                          isActive
                            ? "bg-[rgba(31,103,204,0.08)] text-[var(--color-text)] shadow-[var(--shadow-soft)]"
                            : "text-[var(--color-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
                        }`}
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-[13px] font-semibold transition-colors ${
                            isActive || isSelectedPolres
                              ? "border-[var(--color-brand-primary)]/18 bg-[rgba(31,103,204,0.1)] text-[var(--color-brand-primary)]"
                              : "border-[var(--color-border)] bg-white text-[var(--color-subtle)] group-hover:text-[var(--color-text)]"
                          }`}
                        >
                          {item.label
                            .split(" ")
                            .slice(0, 2)
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                        {expanded ? (
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium">{item.label}</div>
                            <div className="truncate text-[10px] uppercase tracking-[0.16em] text-[var(--color-subtle)]">
                              {item.id.replace(/-/g, " ")}
                            </div>
                          </div>
                        ) : null}
                        {expanded && (isActive || isSelectedPolres) ? (
                          <div className="h-9 w-1 rounded-full bg-[linear-gradient(180deg,var(--color-brand-primary),transparent)]" />
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-[var(--color-border)] p-3">
          {expanded ? (
            <UserMenu />
          ) : (
            <div className="relative mx-auto h-10 w-10 rounded-2xl border border-[var(--color-border)] bg-white">
              <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-[var(--color-text)]">
                SP
              </div>
              <div className="status-dot status-dot--online absolute -bottom-0.5 -right-0.5 border-2 border-white" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
