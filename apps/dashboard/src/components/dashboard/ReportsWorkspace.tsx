"use client";

import { useMemo } from "react";
import Link from "next/link";

import { getSelectedPolres, useAppStore } from "@/store";

export default function ReportsWorkspace() {
  const selectedPolres = useAppStore(getSelectedPolres);
  const activities = useAppStore((state) => state.activities);
  const notifications = useAppStore((state) => state.notifications);

  const reportRows = useMemo(
    () =>
      activities.map((item, index) => ({
        id: `RPT-${(index + 1).toString().padStart(3, "0")}`,
        title: item.title,
        location: item.location,
        status:
          item.status === "danger"
            ? "eskalasi"
            : item.status === "warning"
              ? "review"
              : item.status === "info"
                ? "verifikasi"
                : "selesai",
        priority:
          item.status === "danger"
            ? "tinggi"
            : item.status === "warning"
              ? "sedang"
              : "normal",
        time: item.time,
      })),
    [activities],
  );

  const actionQueue = useMemo(() => notifications.slice(0, 4), [notifications]);

  return (
    <div className="space-y-6 animate-[tactical-rise_0.35s_ease]">
      <section className="glass-card px-6 py-6">
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div>
            <div className="eyebrow">Reports Control</div>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[var(--color-text)]">
              Pusat laporan untuk mengubah kejadian menjadi tindakan.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
              Halaman ini dipakai untuk meninjau laporan masuk, menentukan prioritas, lalu
              meneruskan konteksnya ke peta, AI, dan command center. Jadi operator tidak
              hanya melihat daftar laporan, tetapi juga tahu apa langkah berikutnya.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="command-chip">
                <strong>{selectedPolres ? selectedPolres.name : "Regional queue"}</strong>
                <span>Filter konteks wilayah aktif.</span>
              </div>
              <div className="command-chip">
                <strong>{reportRows.length} reports visible</strong>
                <span>Semua dapat ditindaklanjuti ke map dan AI.</span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <StatCard label="Need Escalation" value={`${reportRows.filter((item) => item.priority === "tinggi").length}`} />
            <StatCard label="Under Review" value={`${reportRows.filter((item) => item.status === "review" || item.status === "verifikasi").length}`} />
            <StatCard label="Closed Loop" value={`${reportRows.filter((item) => item.status === "selesai").length}`} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="glass-card overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
            <div>
              <div className="eyebrow">Incident Register</div>
              <h2 className="mt-3 text-lg font-semibold">Operational Reports Table</h2>
            </div>
            <Link
              href="/map"
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text)] transition-colors hover:border-[var(--color-brand-primary)]/40"
            >
              Open Map
            </Link>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[var(--color-panel)]/70 text-left text-[10px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">
                <tr>
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Laporan</th>
                  <th className="px-5 py-3">Lokasi</th>
                  <th className="px-5 py-3">Prioritas</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {reportRows.map((report) => (
                  <tr key={report.id} className="border-t border-[var(--color-border)]">
                    <td className="px-5 py-4 metric text-[var(--color-text)]">{report.id}</td>
                    <td className="px-5 py-4 font-medium text-[var(--color-text)]">{report.title}</td>
                    <td className="px-5 py-4 text-[var(--color-muted)]">{report.location}</td>
                    <td className="px-5 py-4">
                      <Badge tone={report.priority === "tinggi" ? "danger" : report.priority === "sedang" ? "warning" : "info"}>
                        {report.priority}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <Badge tone={report.status === "eskalasi" ? "danger" : report.status === "review" ? "warning" : report.status === "verifikasi" ? "info" : "success"}>
                        {report.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-[var(--color-muted)]">{report.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-5">
            <div className="eyebrow">Workflow</div>
            <h3 className="mt-3 text-base font-semibold">Cara halaman ini dipakai</h3>
            <div className="mt-4 space-y-3 text-sm text-[var(--color-muted)]">
              <WorkflowItem step="1" title="Terima laporan" desc="Lihat prioritas, lokasi, dan waktu." />
              <WorkflowItem step="2" title="Buka konteks" desc="Buka wilayah di peta dan cocokkan dengan hotspot." />
              <WorkflowItem step="3" title="Konsultasi AI" desc="Minta ringkasan atau rekomendasi tindak lanjut." />
              <WorkflowItem step="4" title="Eskalasi / tutup" desc="Pastikan status laporan bergerak, tidak berhenti di daftar." />
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="eyebrow">Attention Queue</div>
            <h3 className="mt-3 text-base font-semibold">Needs Decision</h3>
            <div className="mt-4 space-y-3">
              {actionQueue.map((item) => (
                <div key={item.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
                  <div className="text-sm font-medium text-[var(--color-text)]">{item.title}</div>
                  <div className="mt-1 text-sm text-[var(--color-muted)]">{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
      <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">{label}</div>
      <div className="metric mt-3 text-2xl font-semibold text-[var(--color-text)]">{value}</div>
    </div>
  );
}

function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "success" | "warning" | "danger" | "info";
}) {
  const toneClass = {
    success: "text-[var(--color-success)] border-[var(--color-success)]/25 bg-[var(--color-success)]/10",
    warning: "text-[var(--color-brand-gold)] border-[var(--color-brand-gold)]/25 bg-[var(--color-brand-gold-soft)]",
    danger: "text-[var(--color-danger)] border-[var(--color-danger)]/25 bg-[var(--color-danger)]/10",
    info: "text-[var(--color-info)] border-[var(--color-info)]/25 bg-[var(--color-info)]/10",
  }[tone];

  return (
    <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${toneClass}`}>
      {children}
    </span>
  );
}

function WorkflowItem({
  step,
  title,
  desc,
}: {
  step: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-xs font-semibold text-[var(--color-brand-gold)]">
        {step}
      </div>
      <div>
        <div className="text-sm font-medium text-[var(--color-text)]">{title}</div>
        <div className="text-sm text-[var(--color-muted)]">{desc}</div>
      </div>
    </div>
  );
}
