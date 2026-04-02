"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useFloatingWindows } from "@/components/layout/FloatingWindowsManager";
import GoogleMap from "@/components/map/GoogleMap";
import { sendAIMessage } from "@/lib/api";
import { getSelectedPolres, useAppStore } from "@/store";

export default function CommandCenter() {
  const router = useRouter();
  const { addWindow } = useFloatingWindows();
  const [prompt, setPrompt] = useState("");
  const [sending, setSending] = useState(false);

  const selectedPolres = useAppStore(getSelectedPolres);
  const kpis = useAppStore((state) => state.kpis);
  const activities = useAppStore((state) => state.activities);
  const aiMessages = useAppStore((state) => state.aiMessages);
  const notifications = useAppStore((state) => state.notifications);
  const emergency = useAppStore((state) => state.emergency);
  const polres = useAppStore((state) => state.polres);
  const searchQuery = useAppStore((state) => state.searchQuery);
  const setSelectedPolres = useAppStore((state) => state.setSelectedPolres);
  const addAIMessage = useAppStore((state) => state.addAIMessage);
  const pushNotification = useAppStore((state) => state.pushNotification);
  const heatmapEnabled = useAppStore((state) => state.heatmapEnabled);
  const setHeatmapEnabled = useAppStore((state) => state.setHeatmapEnabled);
  const liveMode = useAppStore((state) => state.liveMode);
  const setLiveMode = useAppStore((state) => state.setLiveMode);

  const filteredPolres = useMemo(() => {
    if (!searchQuery.trim()) {
      return polres;
    }

    const normalizedQuery = searchQuery.toLowerCase();
    return polres.filter((item) => item.name.toLowerCase().includes(normalizedQuery));
  }, [polres, searchQuery]);

  const visibleActivities = useMemo(() => activities.slice(0, 5), [activities]);
  const visibleMessages = useMemo(() => aiMessages.slice(-3), [aiMessages]);
  const priorityNotifications = useMemo(() => notifications.slice(0, 3), [notifications]);

  const handleOpenCompare = (polresId: string) => {
    const polresItem = filteredPolres.find((item) => item.id === polresId);
    if (!polresItem) {
      return;
    }

    setSelectedPolres(polresItem.id);
    router.push(`/polres/${polresItem.id}`);
    addWindow(
      `compare-${polresItem.id}`,
      `Tactical Brief: ${polresItem.name}`,
      <div className="space-y-4 text-sm text-[var(--color-text)]">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
          <div className="eyebrow">Situation</div>
          <p className="mt-3 text-[var(--color-muted)]">
            Wilayah ini sekarang menjadi fokus utama. Semua data panel, AI, dan map mengikuti konteks yang sama.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <BriefTile label="Personnel Online" value={`${polresItem.online ?? 0}`} />
          <BriefTile label="Reports 24H" value={`${polresItem.reports24h ?? 0}`} />
          <BriefTile label="Island" value={polresItem.island} />
          <BriefTile label="Status" value={polresItem.status} />
        </div>
      </div>,
    );
  };

  const handleSendPrompt = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || !selectedPolres) {
      return;
    }

    addAIMessage({
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmedPrompt,
      createdAt: new Date().toISOString(),
    });
    setPrompt("");
    setSending(true);

    try {
      const response = await sendAIMessage({
        polresId: selectedPolres.id,
        message: trimmedPrompt,
      });

      addAIMessage(response);
      pushNotification({
        title: "AI brief updated",
        description: `Rekomendasi taktis baru untuk ${selectedPolres.name}.`,
        level: "info",
      });
    } catch {
      addAIMessage({
        id: `assistant-fallback-${Date.now()}`,
        role: "assistant",
        content:
          "TURANGGA-AI belum dapat dijangkau. Gunakan heatmap dan activity feed sebagai rujukan taktis sementara.",
        references: ["Fallback Frontend"],
        createdAt: new Date().toISOString(),
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-[tactical-rise_0.45s_ease]">
      <section className="glass-card tactical-grid overflow-hidden px-5 py-5 sm:px-6 sm:py-6">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(31,103,204,0.35),transparent)]" />
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <div className="eyebrow">Command Center</div>
            <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.04em] text-[var(--color-text)] sm:text-4xl">
              Tactical operating picture untuk seluruh wilayah hukum Polda NTT.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-muted)] sm:text-[15px]">
              Dashboard ini kini diposisikan sebagai workspace operasional: situasi wilayah, peta, AI,
              incident feed, dan posture command bergerak sebagai satu sistem yang saling terhubung.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="command-chip">
                <strong>{selectedPolres ? selectedPolres.name : "Regional View"}</strong>
                <span>{selectedPolres ? "Focused jurisdiction" : "All jurisdictions visible"}</span>
              </div>
              <div className="command-chip">
                <strong>{liveMode ? "Live grid" : "Historical mode"}</strong>
                <span>{heatmapEnabled ? "Heat layer armed" : "Marker prioritization"}</span>
              </div>
              <div className="command-chip">
                <strong>{emergency.active ? "Emergency active" : "Normal posture"}</strong>
                <span>{priorityNotifications.length} priority alerts</span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <StatusTile
              label="Posture"
              value={selectedPolres ? selectedPolres.status.toUpperCase() : emergency.active ? "EMERGENCY" : "KONDUSIF"}
              tone={emergency.active ? "danger" : selectedPolres?.status === "kontinjensi" ? "danger" : selectedPolres?.status === "waspada" ? "warning" : "success"}
            />
            <StatusTile label="Alerts" value={`${priorityNotifications.length}`} tone="info" />
            <StatusTile label="Sync" value="ONLINE" tone="success" />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.45fr_0.95fr_0.7fr]">
        <div className="space-y-4 xl:col-span-2">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
            {kpis.map((kpi) => (
              <MetricCard key={kpi.id} {...kpi} />
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.45fr_0.55fr]">
            <div className="glass-card overflow-hidden p-0">
              <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] px-5 py-4">
                <div>
                  <div className="eyebrow">Geo Command</div>
                  <h2 className="mt-3 text-lg font-semibold text-[var(--color-text)]">Peta Operasi NTT</h2>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    Marker command, heat intensity, dan emergency overlay disinkronkan langsung ke konteks wilayah.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={() => setHeatmapEnabled(!heatmapEnabled)}
                    className={`rounded-2xl border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors ${
                      heatmapEnabled
                        ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)] text-white"
                        : "border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-muted)]"
                    }`}
                  >
                    Heat Layer
                  </button>
                  <button
                    onClick={() => setLiveMode(!liveMode)}
                    className={`rounded-2xl border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors ${
                      liveMode
                        ? "border-[var(--color-success)] bg-[var(--color-success)]/18 text-[var(--color-success)]"
                        : "border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-muted)]"
                    }`}
                  >
                    {liveMode ? "Live Grid" : "Playback"}
                  </button>
                </div>
              </div>
              <div className="h-[520px] sm:h-[560px]">
                <GoogleMap />
              </div>
            </div>

            <div className="space-y-4">
              <div className="glass-card p-5">
                <div className="eyebrow">Live Feed</div>
                <h3 className="mt-3 text-base font-semibold">Incident Timeline</h3>
                <div className="mt-4 space-y-4">
                  {visibleActivities.map((item) => (
                    <EventItem key={item.id} {...item} />
                  ))}
                </div>
              </div>

              <div className="glass-card p-5">
                <div className="eyebrow">Attention Queue</div>
                <h3 className="mt-3 text-base font-semibold">Priority Alerts</h3>
                <div className="mt-4 space-y-3">
                  {priorityNotifications.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3"
                    >
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-brand-primary)]">
                        {item.level}
                      </div>
                      <div className="mt-2 text-sm font-medium text-[var(--color-text)]">{item.title}</div>
                      <div className="mt-1 text-sm text-[var(--color-muted)]">{item.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-5">
            <div className="eyebrow">AI Cell</div>
            <div className="mt-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-[var(--color-text)]">TURANGGA Strategic Assistant</h3>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  {selectedPolres
                    ? `Brief terfokus ke ${selectedPolres.name}.`
                    : "Pilih wilayah untuk menghasilkan rekomendasi taktis yang kontekstual."}
                </p>
              </div>
              <div className="rounded-full border border-[var(--color-success)]/24 bg-[var(--color-success)]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-success)]">
                Online
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {visibleMessages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-2xl border px-4 py-4 text-sm ${
                    message.role === "assistant"
                      ? "border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-text)]"
                      : "border-[var(--color-brand-primary)]/30 bg-[var(--color-brand-primary)]/12 text-[var(--color-text)]"
                  }`}
                >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-brand-primary)]">
                    {message.role === "assistant" ? "AI Brief" : "Operator Query"}
                  </div>
                  <div className="mt-2 leading-6 text-[var(--color-muted)]">{message.content}</div>
                  {message.references?.length ? (
                    <div className="mt-3 text-[11px] uppercase tracking-[0.18em] text-[var(--color-info)]">
                      {message.references.join(" | ")}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <form onSubmit={handleSendPrompt} className="mt-4 space-y-3">
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                rows={4}
                disabled={!selectedPolres || sending}
                placeholder={
                  selectedPolres
                    ? `Bangun brief atau rekomendasi tindakan untuk ${selectedPolres.name}`
                    : "Pilih polres untuk mengaktifkan prompt AI"
                }
                className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition-colors placeholder-[var(--color-muted)] focus:border-[var(--color-brand-primary)] disabled:opacity-60"
              />
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <QuickPrompt label="Ringkas 24 jam" onClick={() => setPrompt("Ringkas situasi 24 jam terakhir dan prioritas tindak lanjut.")} />
                  <QuickPrompt label="Prioritas patroli" onClick={() => setPrompt("Berikan prioritas patroli berikut alasan operasional.")} />
                </div>
                <button
                  type="submit"
                  disabled={!selectedPolres || sending}
                  className="rounded-2xl bg-[var(--color-brand-primary)] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-[var(--color-brand-primary-hover)] disabled:opacity-60"
                >
                  {sending ? "Sending" : "Dispatch AI"}
                </button>
              </div>
            </form>
          </div>

          <div className="glass-card p-5">
            <div className="eyebrow">Jurisdiction Matrix</div>
            <h3 className="mt-3 text-base font-semibold">Status Polres</h3>
            <div className="mt-4 space-y-2">
              {filteredPolres.slice(0, 6).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleOpenCompare(item.id)}
                  className="w-full text-left"
                >
                  <PolresStatus
                    name={item.name}
                    personnel={item.personnel ?? 0}
                    online={item.online ?? 0}
                    level={item.status}
                    active={selectedPolres?.id === item.id}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  title,
  value,
  change,
  changeType,
  subtitle,
}: {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  subtitle: string;
}) {
  const tone = {
    positive: "text-[var(--color-success)]",
    negative: "text-[var(--color-danger)]",
    neutral: "text-[var(--color-info)]",
  }[changeType];

  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-subtle)]">{title}</div>
          <div className="metric mt-3 text-4xl font-semibold text-[var(--color-text)]">{value}</div>
        </div>
        <div className={`rounded-full px-3 py-1 text-[11px] font-semibold ${tone} bg-[var(--color-panel)]`}>
          {change}
        </div>
      </div>
      <div className="mt-3 text-sm text-[var(--color-muted)]">{subtitle}</div>
    </div>
  );
}

function StatusTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "success" | "warning" | "danger" | "info";
}) {
  const accent = {
    success: "text-[var(--color-success)] border-[var(--color-success)]/26",
    warning: "text-[var(--color-brand-gold)] border-[var(--color-brand-gold)]/26",
    danger: "text-[var(--color-danger)] border-[var(--color-danger)]/26",
    info: "text-[var(--color-info)] border-[var(--color-info)]/26",
  }[tone];

  return (
      <div className={`rounded-2xl border bg-white p-4 ${accent}`}>
        <div className="text-[10px] uppercase tracking-[0.24em] text-[var(--color-subtle)]">{label}</div>
        <div className="mt-3 text-lg font-semibold">{value}</div>
      </div>
  );
}

function EventItem({
  time,
  title,
  location,
  status,
}: {
  time: string;
  title: string;
  location: string;
  status: "success" | "info" | "danger" | "warning";
}) {
  const statusColors = {
    success: "bg-[var(--color-success)]",
    info: "bg-[var(--color-info)]",
    danger: "bg-[var(--color-danger)]",
    warning: "bg-[var(--color-brand-gold)]",
  };

  return (
    <div className="flex gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3">
      <div className="mt-1 flex flex-col items-center">
        <div className={`h-2.5 w-2.5 rounded-full ${statusColors[status]}`} />
        <div className="mt-1 h-full w-px bg-[var(--color-border)]" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="text-sm font-medium text-[var(--color-text)]">{title}</div>
          <div className="metric text-[11px] uppercase tracking-[0.18em] text-[var(--color-subtle)]">{time}</div>
        </div>
        <div className="mt-1 text-sm text-[var(--color-muted)]">{location}</div>
      </div>
    </div>
  );
}

function PolresStatus({
  name,
  personnel,
  online,
  level,
  active,
}: {
  name: string;
  personnel: number;
  online: number;
  level: "kondusif" | "waspada" | "kontinjensi";
  active: boolean;
}) {
  const levelConfig = {
    kondusif: { color: "text-[var(--color-success)]", bg: "bg-[var(--color-success)]" },
    waspada: { color: "text-[var(--color-brand-gold)]", bg: "bg-[var(--color-brand-gold)]" },
    kontinjensi: { color: "text-[var(--color-danger)]", bg: "bg-[var(--color-danger)]" },
  };

  const config = levelConfig[level];
  const percentage = personnel > 0 ? Math.round((online / personnel) * 100) : 0;

  return (
    <div
      className={`rounded-2xl border px-4 py-3 transition-colors ${
        active
          ? "border-[var(--color-brand-gold)]/34 bg-[var(--color-brand-gold-soft)]"
          : "border-[var(--color-border)] bg-[var(--color-panel)] hover:border-[var(--color-border-hover)]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-[var(--color-text)]">{name}</div>
          <div className={`mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${config.color}`}>
            {level}
          </div>
        </div>
        <div className="metric text-[11px] uppercase tracking-[0.16em] text-[var(--color-subtle)]">
          {online}/{personnel}
        </div>
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-[var(--color-surface-2)]">
        <div className={`h-full rounded-full ${config.bg}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function BriefTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
      <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">{label}</div>
      <div className="metric mt-3 text-2xl font-semibold text-[var(--color-text)]">{value}</div>
    </div>
  );
}

function QuickPrompt({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)] transition-colors hover:border-[var(--color-brand-primary)]/40 hover:text-[var(--color-text)]"
    >
      {label}
    </button>
  );
}
