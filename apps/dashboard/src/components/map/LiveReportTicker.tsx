"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, AlertTriangle, Radio } from "lucide-react";
import { mockMobileReports } from "@/lib/mockMobileReports";
import type { FieldReport, YoloBBox } from "@/lib/types";

function VisionModal({ report, onClose }: { report: FieldReport; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[var(--color-brand-gold)] font-bold">AI Vision Analysis</div>
            <div className="text-sm font-medium text-white mt-1">{report.locationName}</div>
          </div>
          <button onClick={onClose} className="text-[var(--color-muted)] hover:text-white transition-colors text-lg">✕</button>
        </div>

        {/* Image with Bounding Boxes */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[var(--color-panel)] border border-[var(--color-border)]">
          {/* Placeholder image background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <span className="text-[var(--color-subtle)] text-sm font-mono">CCTV / Field Image Feed</span>
          </div>

          {/* YOLO Bounding Boxes */}
          {report.yoloBoxes?.map((box: YoloBBox, i: number) => (
            <div
              key={i}
              className="absolute border-2 border-[var(--color-danger)] rounded-sm"
              style={{
                left: `${box.x}%`,
                top: `${box.y}%`,
                width: `${box.width}%`,
                height: `${box.height}%`,
              }}
            >
              <div className="absolute -top-5 left-0 whitespace-nowrap rounded bg-[var(--color-danger)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white shadow">
                {box.label} ({Math.round(box.confidence * 100)}%)
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl bg-[var(--color-panel)] border border-[var(--color-border)] p-4">
          <div className="text-[10px] uppercase tracking-widest text-[var(--color-brand-gold)] font-bold mb-2">Deteksi</div>
          <div className="flex flex-wrap gap-2">
            {report.yoloBoxes?.map((box, i) => (
              <div key={i} className="rounded-lg border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-3 py-1.5 text-xs text-white">
                <span className="font-bold">{box.label}</span>
                <span className="ml-2 font-mono text-[var(--color-danger)]">{Math.round(box.confidence * 100)}%</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-[var(--color-muted)]">{report.textReport}</p>
        </div>
      </motion.div>
    </div>
  );
}

export default function LiveReportTicker() {
  const [selectedReport, setSelectedReport] = useState<FieldReport | null>(null);
  const reports = mockMobileReports;

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("id", { hour: "2-digit", minute: "2-digit" }) + " WITA";
  };

  return (
    <>
      <div className="absolute bottom-24 left-4 z-10 w-72">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[rgba(11,27,50,0.85)] p-3 shadow-lg backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-3 px-1">
            <Radio className="w-3.5 h-3.5 text-[var(--color-brand-gold)] animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-brand-gold)] font-bold">Live Field Reports</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
            {reports.map((report) => (
              <motion.button
                key={report.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => report.yoloBoxes && report.yoloBoxes.length > 0 ? setSelectedReport(report) : null}
                className={`w-full text-left rounded-xl border p-2.5 transition-all ${
                  report.isSOS
                    ? "border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10 hover:bg-[var(--color-danger)]/15"
                    : "border-[var(--color-border)] bg-[var(--color-panel)] hover:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-white truncate">{report.personnelName}</span>
                  <span className="text-[9px] font-mono text-[var(--color-subtle)]">{formatTime(report.timestamp)}</span>
                </div>
                <div className="text-[10px] text-[var(--color-muted)] mt-1 truncate">{report.locationName}</div>
                <div className="text-[10px] text-[var(--color-subtle)] mt-1 line-clamp-2">{report.textReport}</div>

                <div className="flex gap-1.5 mt-2">
                  {report.isSOS && (
                    <span className="inline-flex items-center gap-1 rounded bg-[var(--color-danger)] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest text-white">
                      <AlertTriangle className="w-2.5 h-2.5" /> SOS
                    </span>
                  )}
                  {report.yoloBoxes && report.yoloBoxes.length > 0 && (
                    <span className="inline-flex items-center gap-1 rounded border border-[var(--color-brand-gold)]/30 bg-[var(--color-brand-gold)]/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest text-[var(--color-brand-gold)]">
                      <Eye className="w-2.5 h-2.5" /> AI Analyzed
                    </span>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedReport && <VisionModal report={selectedReport} onClose={() => setSelectedReport(null)} />}
      </AnimatePresence>
    </>
  );
}
