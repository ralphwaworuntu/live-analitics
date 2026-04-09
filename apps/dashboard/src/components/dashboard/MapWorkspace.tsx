"use client";

import GoogleMap from "@/components/map/GoogleMap";
import { getSelectedPolres, useAppStore } from "@/store";

export default function MapWorkspace() {
  const selectedPolres = useAppStore(getSelectedPolres);
  const heatmapEnabled = useAppStore((state) => state.heatmapEnabled);
  const liveMode = useAppStore((state) => state.liveMode);
  const heatPoints = useAppStore((state) => state.heatPoints);
  const emergency = useAppStore((state) => state.emergency);

  return (
    <div className="space-y-6 animate-[tactical-rise_0.35s_ease]">
      <section className="glass-card px-5 py-5 sm:px-6 sm:py-6">
        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div>
            <div className="eyebrow">Geo Command</div>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[var(--color-text)] sm:text-4xl">
              Peta sebagai pusat tindakan, bukan sekadar widget.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
              Workspace ini memusatkan pemetaan situasi, intensitas heat layer, posture wilayah, dan alarm darurat ke satu bidang kerja yang mudah dibaca operator.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="command-chip">
                <strong>{liveMode ? "Live Mode" : "Playback Mode"}</strong>
                <span>Operator dapat beralih antara situasi langsung dan histori.</span>
              </div>
              <div className="command-chip">
                <strong>{heatmapEnabled ? "Heat Layer On" : "Markers Focused"}</strong>
                <span>Lapisan panas mengikuti filter waktu dan wilayah.</span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <MapStat label="Focused Area" value={selectedPolres ? selectedPolres.name : "All Jurisdictions"} />
            <MapStat label="Hot Points" value={`${heatPoints.length}`} />
            <MapStat label="Crisis Layer" value={emergency.active ? "Active" : "Standby"} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.45fr_0.55fr]">
        <div className="glass-card overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
            <div>
              <div className="eyebrow">Operational Canvas</div>
              <h2 className="mt-3 text-lg font-semibold text-[var(--color-text)]">Situational Awareness Map</h2>
            </div>
            <div className="text-right text-xs text-[var(--color-muted)]">
              <div>{selectedPolres ? selectedPolres.name : "Regional scope"}</div>
              <div>{liveMode ? "Realtime telemetry" : "Historical playback"}</div>
            </div>
          </div>
          <div className="h-[540px] sm:h-[680px]">
            <GoogleMap />
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-5">
            <div className="eyebrow">Territory Focus</div>
            <h3 className="mt-3 text-base font-semibold">Current Selection</h3>
            <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
              {selectedPolres ? (
                <>
                  <div className="text-lg font-semibold text-[var(--color-text)]">{selectedPolres.name}</div>
                  <div className="mt-2 text-sm text-[var(--color-muted)]">
                    Pulau {selectedPolres.island} • Koordinat {selectedPolres.lat.toFixed(4)}, {selectedPolres.lng.toFixed(4)}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Tag>{selectedPolres.status}</Tag>
                    <Tag>{heatmapEnabled ? "heatmap" : "markers"}</Tag>
                  </div>
                </>
              ) : (
                <div className="text-sm text-[var(--color-muted)]">
                  Pilih marker atau polres dari sidebar untuk mengunci peta ke wilayah tertentu.
                </div>
              )}
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="eyebrow">Heat Priority</div>
            <h3 className="mt-3 text-base font-semibold">Hotspot Queue</h3>
            <div className="mt-4 space-y-3">
              {heatPoints.slice(0, 5).map((point: any) => (
                <div key={point.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3">
                  <div className="text-sm font-medium text-[var(--color-text)]">{point.title}</div>
                  <div className="mt-1 text-sm text-[var(--color-muted)]">
                    Severity {point.severity} • Weight {point.weight}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="eyebrow">Legend</div>
            <div className="mt-4 space-y-3 text-sm text-[var(--color-muted)]">
              <LegendItem color="bg-[var(--color-success)]" label="Kondusif" />
              <LegendItem color="bg-[var(--color-brand-gold)]" label="Waspada" />
              <LegendItem color="bg-[var(--color-danger)]" label="Kontinjensi / Emergency" />
              <LegendItem color="bg-[var(--color-info)]" label="System / telemetry" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function MapStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
      <div className="text-[10px] uppercase tracking-[0.24em] text-[var(--color-subtle)]">{label}</div>
      <div className="mt-3 text-lg font-semibold text-[var(--color-text)]">{value}</div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
      {children}
    </span>
  );
}

function LegendItem({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className={`h-3 w-3 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  );
}
