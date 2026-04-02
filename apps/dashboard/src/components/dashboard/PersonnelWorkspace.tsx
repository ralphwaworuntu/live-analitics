"use client";

import { useMemo } from "react";

import { getSelectedPolres, useAppStore } from "@/store";

export default function PersonnelWorkspace() {
  const selectedPolres = useAppStore(getSelectedPolres);
  const polres = useAppStore((state) => state.polres);

  const roster = useMemo(
    () =>
      polres.map((item, index) => ({
        id: `PRS-${(index + 1).toString().padStart(2, "0")}`,
        unit: item.name,
        online: item.online ?? 0,
        total: item.personnel ?? 0,
        standby: Math.max((item.personnel ?? 0) - (item.online ?? 0), 0),
        task: item.status === "kontinjensi" ? "escalation support" : item.status === "waspada" ? "heightened patrol" : "routine patrol",
      })),
    [polres],
  );

  const focusedRoster = selectedPolres ? roster.filter((item) => item.unit === selectedPolres.name) : roster;

  return (
    <div className="space-y-6 animate-[tactical-rise_0.35s_ease]">
      <section className="glass-card px-6 py-6">
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div>
            <div className="eyebrow">Personnel Grid</div>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[var(--color-text)]">
              Kesiapan personil harus terlihat sebagai kapasitas operasional.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
              Halaman ini menjawab pertanyaan penting: berapa personil online, siapa yang siap digerakkan, dan wilayah mana yang membutuhkan dukungan tambahan karena posture meningkat.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <Stat label="Focused Unit" value={selectedPolres ? selectedPolres.name : "All units"} />
            <Stat label="Online Total" value={`${focusedRoster.reduce((sum, item) => sum + item.online, 0)}`} />
            <Stat label="Standby Reserve" value={`${focusedRoster.reduce((sum, item) => sum + item.standby, 0)}`} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="glass-card p-5">
          <div className="eyebrow">Readiness Matrix</div>
          <div className="mt-4 space-y-3">
            {focusedRoster.map((item) => {
              const percentage = item.total > 0 ? Math.round((item.online / item.total) * 100) : 0;
              return (
                <div key={item.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium text-[var(--color-text)]">{item.unit}</div>
                      <div className="mt-1 text-sm text-[var(--color-muted)]">Task profile: {item.task}</div>
                    </div>
                    <div className="text-right">
                      <div className="metric text-xl font-semibold text-[var(--color-text)]">{item.online}/{item.total}</div>
                      <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-subtle)]">{percentage}% online</div>
                    </div>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-[var(--color-surface-2)]">
                    <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-brand-primary),var(--color-success))]" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-5">
            <div className="eyebrow">Use Case</div>
            <h3 className="mt-3 text-base font-semibold">Kenapa halaman ini penting</h3>
            <ul className="mt-4 space-y-3 text-sm text-[var(--color-muted)]">
              <li>Operator dapat melihat apakah sebuah wilayah siap merespons laporan baru.</li>
              <li>Komandan dapat membandingkan kebutuhan dukungan antar-polres.</li>
              <li>AI dan map bisa diinterpretasikan bersama dengan kapasitas personil nyata.</li>
            </ul>
          </div>

          <div className="glass-card p-5">
            <div className="eyebrow">Decision Support</div>
            <div className="mt-4 space-y-3">
              {focusedRoster.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
                  <div className="text-sm font-medium text-[var(--color-text)]">{item.unit}</div>
                  <div className="mt-1 text-sm text-[var(--color-muted)]">
                    {item.online >= Math.round(item.total * 0.75)
                      ? "Siap menopang operasi lanjutan."
                      : "Perlu perencanaan rotasi atau dukungan lintas wilayah."}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
      <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">{label}</div>
      <div className="mt-3 text-lg font-semibold text-[var(--color-text)]">{value}</div>
    </div>
  );
}
