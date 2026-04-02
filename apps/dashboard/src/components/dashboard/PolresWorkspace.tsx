"use client";

import Link from "next/link";
import { useMemo } from "react";

import AIWorkspace from "@/components/dashboard/AIWorkspace";
import MapWorkspace from "@/components/dashboard/MapWorkspace";
import { getSelectedPolres, useAppStore } from "@/store";

export default function PolresWorkspace() {
  const selectedPolres = useAppStore(getSelectedPolres);
  const activities = useAppStore((state) => state.activities);
  const heatPoints = useAppStore((state) => state.heatPoints);

  const localActivities = useMemo(() => activities.slice(0, 4), [activities]);
  const localHeat = useMemo(
    () => (selectedPolres ? heatPoints.filter((item) => item.polresId === selectedPolres.id) : heatPoints),
    [heatPoints, selectedPolres],
  );

  if (!selectedPolres) {
    return (
      <div className="glass-card p-6">
        <div className="eyebrow">Polres Detail</div>
        <h1 className="mt-4 text-3xl font-semibold text-[var(--color-text)]">Wilayah belum dipilih</h1>
        <p className="mt-3 text-sm text-[var(--color-muted)]">
          Pilih polres dari sidebar atau marker pada peta untuk membuka halaman wilayah yang lebih berguna.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-[tactical-rise_0.35s_ease]">
      <section className="glass-card px-6 py-6">
        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <div>
            <div className="eyebrow">Polres Brief</div>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[var(--color-text)]">
              {selectedPolres.name} sebagai titik fokus operasional.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
              Halaman ini menyatukan situasi wilayah, hotspot, aktivitas terakhir, dan ruang AI dalam satu tempat. Tujuannya agar operator tidak harus bolak-balik antar modul untuk memahami satu wilayah.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <BriefStat label="Status" value={selectedPolres.status} />
            <BriefStat label="Online" value={`${selectedPolres.online ?? 0}/${selectedPolres.personnel ?? 0}`} />
            <BriefStat label="Laporan 24H" value={`${selectedPolres.reports24h ?? 0}`} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <div className="glass-card p-5">
          <div className="eyebrow">Quick Brief</div>
          <div className="mt-4 space-y-3">
            <InfoBlock title="Kondisi wilayah" value={`Pulau ${selectedPolres.island} • koordinat ${selectedPolres.lat.toFixed(4)}, ${selectedPolres.lng.toFixed(4)}`} />
            <InfoBlock title="Aktivitas terakhir" value={localActivities[0]?.title ?? "Belum ada aktivitas baru"} />
            <InfoBlock title="Hotspot fokus" value={localHeat[0]?.title ?? "Belum ada hotspot spesifik untuk wilayah ini"} />
          </div>
          <div className="mt-4">
            <Link
              href="/reports"
              className="inline-flex rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text)] transition-colors hover:border-[var(--color-brand-primary)]/40"
            >
              Open Reports
            </Link>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="eyebrow">Activity Snapshot</div>
          <div className="mt-4 space-y-3">
            {localActivities.map((item) => (
              <div key={item.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
                <div className="text-sm font-medium text-[var(--color-text)]">{item.title}</div>
                <div className="mt-1 text-sm text-[var(--color-muted)]">{item.location}</div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[var(--color-subtle)]">{item.time}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MapWorkspace />
      <AIWorkspace />
    </div>
  );
}

function BriefStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
      <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">{label}</div>
      <div className="mt-3 text-lg font-semibold capitalize text-[var(--color-text)]">{value}</div>
    </div>
  );
}

function InfoBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
      <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-subtle)]">{title}</div>
      <div className="mt-2 text-sm text-[var(--color-text)]">{value}</div>
    </div>
  );
}
