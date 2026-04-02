"use client";

import Link from "next/link";

import type { PolresItem } from "@/lib/types";
import { getSelectedPolres, useAppStore } from "@/store";

export default function ModulePage({
  eyebrow,
  title,
  description,
  selectedPolres,
}: {
  eyebrow: string;
  title: string;
  description: string;
  selectedPolres?: PolresItem | null;
}) {
  const selectedFromStore = useAppStore(getSelectedPolres);
  const activePolres = selectedPolres ?? selectedFromStore;

  return (
    <div className="space-y-6 animate-[tactical-rise_0.35s_ease]">
      <div className="glass-card px-6 py-6">
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[var(--color-text)]">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm text-[var(--color-muted)]">{description}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass-card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">Konteks Terpilih</h2>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            {activePolres
              ? `${activePolres.name} sedang menjadi fokus lintas modul. Buka peta, AI chat, dan dashboard untuk melihat data yang sudah tersinkron.`
              : "Belum ada polres yang dipilih. Pilih dari sidebar atau halaman dashboard untuk mengaktifkan konteks bersama."}
          </p>
          {activePolres ? (
            <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4 text-sm text-[var(--color-text)]">
              <div>{activePolres.name}</div>
              <div className="mt-1 text-[var(--color-muted)]">
                Pulau {activePolres.island} • Koordinat {activePolres.lat.toFixed(4)},{" "}
                {activePolres.lng.toFixed(4)}
              </div>
            </div>
          ) : null}
        </div>

        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">Navigasi Cepat</h2>
          <div className="mt-4 space-y-2 text-sm">
            <Link
              href="/"
              className="block rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3 text-[var(--color-text)] transition-colors hover:border-[var(--color-brand-primary)]/40 hover:bg-[var(--color-surface-2)]"
            >
              Buka Command Center
            </Link>
            <Link
              href="/map"
              className="block rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3 text-[var(--color-text)] transition-colors hover:border-[var(--color-brand-primary)]/40 hover:bg-[var(--color-surface-2)]"
            >
              Lanjut ke Peta Operasi
            </Link>
            <Link
              href="/ai-chat"
              className="block rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3 text-[var(--color-text)] transition-colors hover:border-[var(--color-brand-primary)]/40 hover:bg-[var(--color-surface-2)]"
            >
              Diskusi dengan TURANGGA
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
