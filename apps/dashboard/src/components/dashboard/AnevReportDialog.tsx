"use client";

import { useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Download, X, Loader2 } from "lucide-react";
import { useAppStore, getSelectedPolres } from "@/store";

export default function AnevReportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const kpis = useAppStore((state) => state.kpis);
  const activities = useAppStore((state) => state.activities);
  const selectedPolres = useAppStore(getSelectedPolres);
  const aiMessages = useAppStore((state) => state.aiMessages);
  const reportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const today = useMemo(() => new Date(), []);
  const dateStr = today.toLocaleDateString("id", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const handleExportPDF = useCallback(async () => {
    if (!reportRef.current) return;
    setExporting(true);

    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      // Watermark
      pdf.setFontSize(40);
      pdf.setTextColor(200, 200, 200);
      pdf.text("POLDA NTT - RAHASIA", pdfWidth / 2, pdf.internal.pageSize.getHeight() / 2, {
        align: "center",
        angle: 45,
      });

      const polresName = selectedPolres ? selectedPolres.name.replace(/\s+/g, "-") : "Regional";
      pdf.save(`Laporan-Anev-${polresName}-${today.toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExporting(false);
    }
  }, [selectedPolres, today]);

  // Build narrative from state
  const latestAIBrief = aiMessages.filter(m => m.role === "assistant").slice(-1)[0]?.content || "Tidak ada ringkasan AI tersedia.";
  const recentActivities = activities.slice(0, 5);
  const scope = selectedPolres ? selectedPolres.name : "Seluruh Wilayah Hukum Polda NTT";

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Dialog Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-panel)] px-6 py-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-[var(--color-brand-gold)]" />
              <div>
                <div className="text-sm font-bold uppercase tracking-[0.15em] text-[var(--color-brand-gold)]">Laporan Anev Otomatis</div>
                <div className="text-[10px] text-[var(--color-muted)] font-mono uppercase tracking-widest">{dateStr}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPDF}
                disabled={exporting}
                className="flex items-center gap-2 rounded-lg border border-[var(--color-brand-gold)]/40 bg-[var(--color-brand-gold)]/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[var(--color-brand-gold)] transition-all hover:bg-[var(--color-brand-gold)]/20 disabled:opacity-50"
              >
                {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                Export PDF
              </button>
              <button onClick={onClose} className="rounded-lg p-2 text-[var(--color-muted)] hover:text-white hover:bg-white/5">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Printable Report Content */}
          <div ref={reportRef} className="bg-white text-black p-10 min-h-[600px]" style={{ fontFamily: "serif" }}>
            {/* Kop Surat */}
            <div className="text-center border-b-4 border-double border-black pb-4 mb-6">
              <div className="text-[11px] uppercase tracking-[0.3em] font-bold">Kepolisian Negara Republik Indonesia</div>
              <div className="text-[11px] uppercase tracking-[0.3em] font-bold">Daerah Nusa Tenggara Timur</div>
              <div className="text-lg font-bold uppercase tracking-[0.2em] mt-1">BIRO OPERASI</div>
              <div className="text-[10px] mt-1 text-gray-600">Jl. Jend. Sudirman No.1 Kupang, Nusa Tenggara Timur</div>
            </div>

            <div className="text-center mb-8">
              <div className="text-base font-bold uppercase tracking-widest underline">Laporan Analisis dan Evaluasi (ANEV)</div>
              <div className="text-sm mt-1 text-gray-600">{dateStr}</div>
              <div className="text-sm text-gray-600">Lingkup: {scope}</div>
            </div>

            {/* Bab I */}
            <div className="mb-6">
              <h2 className="text-sm font-bold uppercase mb-2">I. Pendahuluan</h2>
              <p className="text-[13px] leading-7 text-gray-800 text-justify">
                Laporan Analisis dan Evaluasi (Anev) ini disusun secara otomatis oleh sistem SENTINEL-AI Polda NTT berdasarkan
                data operasional 24 jam terakhir di wilayah hukum {scope}. Laporan mencakup seluruh indikator kinerja utama,
                aktivitas operasional, serta rekomendasi tindak lanjut yang dihasilkan oleh modul kecerdasan buatan Turangga.
              </p>
            </div>

            {/* Bab II */}
            <div className="mb-6">
              <h2 className="text-sm font-bold uppercase mb-2">II. Fakta-Fakta</h2>
              <table className="w-full border-collapse text-[12px] mb-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left font-bold">Indikator</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-bold">Nilai</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-bold">Perubahan</th>
                  </tr>
                </thead>
                <tbody>
                  {kpis.map((kpi) => (
                    <tr key={kpi.id}>
                      <td className="border border-gray-300 px-3 py-2">{kpi.title}</td>
                      <td className="border border-gray-300 px-3 py-2 font-mono font-bold">{kpi.value}</td>
                      <td className="border border-gray-300 px-3 py-2">{kpi.change} ({kpi.changeType})</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3 className="text-[12px] font-bold mb-1">Aktivitas Terkini:</h3>
              <ul className="list-disc list-inside text-[12px] leading-6 text-gray-800">
                {recentActivities.map((a) => (
                  <li key={a.id}>{a.time} — {a.title} ({a.location})</li>
                ))}
              </ul>
            </div>

            {/* Bab III */}
            <div className="mb-6">
              <h2 className="text-sm font-bold uppercase mb-2">III. Analisis</h2>
              <p className="text-[13px] leading-7 text-gray-800 text-justify">
                {latestAIBrief}
              </p>
            </div>

            {/* Bab IV */}
            <div className="mb-6">
              <h2 className="text-sm font-bold uppercase mb-2">IV. Saran Tindak Lanjut</h2>
              <ol className="list-decimal list-inside text-[13px] leading-7 text-gray-800">
                <li>Meningkatkan intensitas patroli di wilayah rawan sesuai analisis heatmap SENTINEL.</li>
                <li>Melakukan koordinasi dengan Polres terkait untuk penguatan pos pengamanan.</li>
                <li>Menindaklanjuti laporan SOS dari personil lapangan dalam waktu kurang dari 15 menit.</li>
                <li>Melaporkan perkembangan situasi kepada Kapolda NTT secara berkala setiap 6 jam.</li>
              </ol>
            </div>

            {/* Signature */}
            <div className="mt-12 flex justify-end">
              <div className="text-center">
                <div className="text-[12px]">Kupang, {dateStr}</div>
                <div className="text-[12px] font-bold mt-1">Kabiro Ops Polda NTT</div>
                <div className="mt-16 border-b border-black w-48" />
                <div className="text-[12px] font-bold mt-1">(..........................)</div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
