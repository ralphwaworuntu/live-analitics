"use client";

import { useMemo } from "react";

import { getSelectedPolres, useAppStore } from "@/store";

export default function AuditWorkspace() {
  const selectedPolres = useAppStore(getSelectedPolres);
  const notifications = useAppStore((state) => state.notifications);
  const aiMessages = useAppStore((state) => state.aiMessages);
  const emergency = useAppStore((state) => state.emergency);

  const auditRows = useMemo(
    () => [
      {
        time: "22:18",
        actor: "Operator Command Desk",
        action: "Context switched",
        detail: selectedPolres ? `Fokus wilayah dipindah ke ${selectedPolres.name}` : "Regional overview aktif",
      },
      {
        time: "22:12",
        actor: "TURANGGA-AI",
        action: "AI brief generated",
        detail: aiMessages[aiMessages.length - 1]?.content ?? "Belum ada brief terbaru",
      },
      {
        time: "22:05",
        actor: "System Notification",
        action: "Alert queue updated",
        detail: notifications[0]?.description ?? "Tidak ada notifikasi prioritas",
      },
      {
        time: "21:59",
        actor: "Emergency Bus",
        action: emergency.active ? "Emergency armed" : "Emergency standby",
        detail: emergency.active ? `${emergency.message} • ${emergency.location}` : "Tidak ada broadcast kritis aktif",
      },
    ],
    [aiMessages, emergency, notifications, selectedPolres],
  );

  return (
    <div className="space-y-6 animate-[tactical-rise_0.35s_ease]">
      <section className="glass-card px-6 py-6">
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div>
            <div className="eyebrow">Audit Trail</div>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[var(--color-text)]">
              Jejak aksi agar keputusan operasional bisa ditelusuri.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
              Halaman ini menunjukkan bagaimana sistem dipakai: kapan konteks wilayah berubah, kapan AI memberi brief, dan kapan alert atau emergency ikut memengaruhi keputusan operator.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <MiniStat label="Recent Entries" value={`${auditRows.length}`} />
            <MiniStat label="Unread Alerts" value={`${notifications.filter((item) => !item.read).length}`} />
            <MiniStat label="Emergency State" value={emergency.active ? "Active" : "Standby"} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="glass-card p-5">
          <div className="eyebrow">Event Log</div>
          <div className="mt-4 space-y-3">
            {auditRows.map((row) => (
              <div key={`${row.time}-${row.action}`} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-[var(--color-text)]">{row.action}</div>
                    <div className="mt-1 text-sm text-[var(--color-muted)]">{row.detail}</div>
                  </div>
                  <div className="text-right">
                    <div className="metric text-sm text-[var(--color-text)]">{row.time}</div>
                    <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-subtle)]">{row.actor}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-5">
            <div className="eyebrow">Why It Matters</div>
            <ul className="mt-4 space-y-3 text-sm text-[var(--color-muted)]">
              <li>Membantu mengaudit siapa mengambil keputusan dan dalam konteks apa.</li>
              <li>Memudahkan review pasca-insiden untuk melihat urutan tindakan.</li>
              <li>Menjadi dasar validasi saat AI, peta, dan alert saling memengaruhi keputusan.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
      <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">{label}</div>
      <div className="mt-3 text-lg font-semibold text-[var(--color-text)]">{value}</div>
    </div>
  );
}
