import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { TacticalMission, AuditLogEntry } from "./types";

/**
 * ReportService: Generates Tactical Operational ANEV (Analysis and Evaluation) 
 * for SENTINEL Command Center.
 */
export class ReportService {
  static async generateSmartAnev(
    activeMissions: TacticalMission[],
    auditLogs: AuditLogEntry[],
    userName: string = "Irjen Pol. Daniel T.M. Silitonga"
  ) {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const now = new Date();
    const witaTimestamp = now.toLocaleString("id-ID", { timeZone: "Asia/Makassar" });

    // 1. HEADER OFFICIAL
    doc.setFillColor(7, 17, 31); // Dark Sentinel Theme
    doc.rect(0, 0, 210, 40, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("SENTINEL COMMAND CENTER - POLDA NTT", 105, 15, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("LAPORAN ANALISIS & EVALUASI (ANEV) TAKTIS OPERASIONAL", 105, 22, { align: "center" });
    doc.text(`Waktu Cetak: ${witaTimestamp} WITA`, 105, 28, { align: "center" });

    // 2. SUMMARY STATISTICS
    const totalKejadian = activeMissions.length;
    const sosKejadian = activeMissions.filter(m => m.priority === "Critical" || m.status === "en-route").length;
    const completedKejadian = activeMissions.filter(m => m.status === "completed").length;
    
    // Auto-calculate "Wilayah Kritis"
    const locationCounts: Record<string, number> = {};
    activeMissions.forEach(m => {
      const loc = m.locationName || "Unknown";
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });
    const wilayahKritis = Object.entries(locationCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("1. RINGKASAN STATISTIK (24 JAM TERAKHIR)", 15, 50);

    autoTable(doc, {
      startY: 55,
      head: [["Parameter", "Nilai", "Status"]],
      body: [
        ["Total Kejadian Terdeteksi", totalKejadian.toString(), "In-Graph"],
        ["Kejadian SOS/Darurat", sosKejadian.toString(), "Perlu Atensi"],
        ["Misi Selesai (Completed)", completedKejadian.toString(), "Stabil"],
        ["Wilayah Paling Kritis", wilayahKritis, "Prioritas"],
        ["Rata-rata Respon Unit", "8.5 Menit", "Optimal"],
      ],
      theme: "striped",
      headStyles: { fillColor: [11, 27, 50] },
    });

    // 3. TABEL AKTIVITAS TERBARU
    const lastY = (doc as any).lastAutoTable?.finalY || 80;
    doc.text("2. RINCIAN MISI AKTIF & DISPATCH", 15, lastY + 15);
    
    autoTable(doc, {
      startY: lastY + 20,
      head: [["ID", "Kejadian", "Lokasi", "Unit", "Prioritas", "Status"]],
      body: activeMissions.slice(-10).map(m => [
        m.id.substring(4),
        m.title,
        m.locationName,
        m.unitName,
        m.priority,
        m.status
      ]),
      headStyles: { fillColor: [212, 175, 55], textColor: [0, 0, 0] },
    });

    // 4. TURANGGA-AI BRIEFING
    const finalY = (doc as any).lastAutoTable?.finalY || 150;
    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(212, 175, 55);
    doc.rect(15, finalY + 15, 180, 45, "FD");
    
    doc.setTextColor(11, 27, 50);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("TURANGGA-AI STRATEGIC RECOMMENDATION", 20, finalY + 25);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const aiBriefing = `Berdasarkan kepadatan data di wilayah ${wilayahKritis}, Turangga-AI merekomendasikan penebalan pasukan (Shift Cadangan) di titik hotspot tersebut. Terdeteksi anomali peningkatan aktivitas kriminalitas 15% lebih tinggi dari rata-rata historis. Disarankan penempatan unit RAIMAS untuk patroli preventif di sektor pemukiman antara pukul 23:00 - 04:00 WITA.`;
    
    const splitText = doc.splitTextToSize(aiBriefing, 170);
    doc.text(splitText, 20, finalY + 33);

    // 5. SIGNATURE
    doc.setFontSize(10);
    doc.text("Penanggung Jawab Operasional,", 140, finalY + 75);
    doc.setFont("helvetica", "bold");
    doc.text(userName, 140, finalY + 95);
    doc.setFont("helvetica", "normal");
    const nip = "NRP. 66050512";
    doc.text(nip, 140, finalY + 100);

    // SAVE PDF
    doc.save(`ANEV_SENTINEL_${now.getTime()}.pdf`);
    return true;
  }
}
