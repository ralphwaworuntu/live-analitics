"use client";

import { useAppStore } from "@/store";

export default function SettingsWorkspace() {
  const liveMode = useAppStore((state) => state.liveMode);
  const heatmapEnabled = useAppStore((state) => state.heatmapEnabled);
  const timeRangeHours = useAppStore((state) => state.timeRangeHours);
  const setLiveMode = useAppStore((state) => state.setLiveMode);
  const setHeatmapEnabled = useAppStore((state) => state.setHeatmapEnabled);
  const setTimeRangeHours = useAppStore((state) => state.setTimeRangeHours);

  return (
    <div className="space-y-6 animate-[tactical-rise_0.35s_ease]">
      <section className="glass-card px-6 py-6">
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div>
            <div className="eyebrow">Control Settings</div>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[var(--color-text)]">
              Pengaturan bukan hanya kosmetik, tetapi kendali perilaku dashboard.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
              Halaman ini mengatur mode live, heat layer, dan jangkauan waktu yang memengaruhi bagaimana operator membaca situasi. Di tahap berikutnya, area ini bisa diperluas ke alert thresholds, AI defaults, dan role preferences.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <SettingStat label="Live Mode" value={liveMode ? "Enabled" : "Disabled"} />
            <SettingStat label="Heat Layer" value={heatmapEnabled ? "Shown" : "Hidden"} />
            <SettingStat label="History Range" value={`${timeRangeHours} jam`} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <div className="glass-card p-5">
          <div className="eyebrow">Operational Preferences</div>
          <div className="mt-4 space-y-4">
            <ToggleRow
              label="Realtime dashboard mode"
              description="Jika aktif, dashboard lebih memprioritaskan data live dibanding playback."
              checked={liveMode}
              onToggle={() => setLiveMode(!liveMode)}
            />
            <ToggleRow
              label="Heat layer visibility"
              description="Menampilkan pola intensitas kejadian langsung di peta."
              checked={heatmapEnabled}
              onToggle={() => setHeatmapEnabled(!heatmapEnabled)}
            />
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="eyebrow">Temporal Defaults</div>
          <div className="mt-4 space-y-4">
            {[6, 12, 24].map((hours) => (
              <button
                key={hours}
                onClick={() => setTimeRangeHours(hours)}
                className={`block w-full rounded-2xl border px-4 py-4 text-left transition-colors ${
                  timeRangeHours === hours
                    ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/12"
                    : "border-[var(--color-border)] bg-[var(--color-panel)] hover:border-[var(--color-brand-primary)]/30"
                }`}
              >
                <div className="text-sm font-medium text-[var(--color-text)]">{hours} jam</div>
                <div className="mt-1 text-sm text-[var(--color-muted)]">
                  Gunakan sebagai jendela histori default untuk peta dan evaluasi situasi.
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function SettingStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
      <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">{label}</div>
      <div className="mt-3 text-lg font-semibold text-[var(--color-text)]">{value}</div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onToggle,
}: {
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-[var(--color-text)]">{label}</div>
          <div className="mt-1 text-sm text-[var(--color-muted)]">{description}</div>
        </div>
        <button
          onClick={onToggle}
          className={`rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] ${
            checked
              ? "bg-[var(--color-success)]/14 text-[var(--color-success)]"
              : "bg-[var(--color-surface-2)] text-[var(--color-muted)]"
          }`}
        >
          {checked ? "On" : "Off"}
        </button>
      </div>
    </div>
  );
}
