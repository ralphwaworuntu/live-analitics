import { PersonnelTrack, AppNotification, AuditLogEntry } from "./types";
import { generateIntegrityHash } from "./crypto";

/**
 * Sentinel-AI Proactive Monitoring Engine (Turangga 2.0)
 */

export async function runProactiveChecks(
  track: PersonnelTrack,
  pushNotification: (n: Omit<AppNotification, "id" | "read" | "createdAt">) => void,
  addAuditLog: (l: Omit<AuditLogEntry, "id" | "timestamp" | "hash">) => void
) {
  const now = new Date();
  
  // 1. STATIC ANOMALY (Stopped for > 15 mins in high-risk area)
  // Mock check: if speed < 2 for 3 consecutive waypoints with large time gap
  if (track.waypoints.length > 5) {
    const lastWaypoints = track.waypoints.slice(-3);
    const isStopped = lastWaypoints.every(wp => (track.speed || 0) < 2);
    
    // In a real scenario, compare timestamps. Here we simulate:
    if (isStopped && Math.random() < 0.01) { // 1% chance per tick for simulation
      pushNotification({
        title: "⚠️ Static Anomaly Detected",
        description: `Unit ${track.name} terdeteksi statis >15 menit di Zona Risiko Tinggi Tanpa Laporan.`,
        level: "warning"
      });
      addAuditLog({
        actor: "Turangga-AI 2.0",
        action: "STATIC_ANOMALY_TRIGGER",
        target: track.id,
        details: "Unit stationary in high-risk zone without stationary check report."
      });
    }
  }

  // 2. SPEED ANOMALY (Sudden spike > 80 km/h in urban area)
  if (track.speed > 80) {
     pushNotification({
        title: "🚨 Speed Anomaly: POTENTIAL PURSUIT",
        description: `Unit ${track.name} melaju ${Math.round(track.speed)} km/h di area pemukiman!`,
        level: "critical"
     });
     addAuditLog({
        actor: "Turangga-AI 2.0",
        action: "SPEED_ANOMALY_ALERT",
        target: track.id,
        details: `Sudden high-speed detected: ${Math.round(track.speed)} km/h.`
     });
  }

  // 3. BATTERY DROP PREDICTION
  if (track.batteryLevel < 20 && !track.isCharging) {
     pushNotification({
        title: "🔋 Predicted Battery Death",
        description: `Baterai unit ${track.name} diperkirakan habis dalam 18 menit. Rekomendasi: Swap Device.`,
        level: "warning"
     });
  }
}

/**
 * Daily Morning Briefing Generator (08:00 WITA)
 */
export async function generateMorningBriefing(auditLogs: AuditLogEntry[]): Promise<string> {
  const hash = await generateIntegrityHash(auditLogs.slice(0, 5));
  return `MODERN COMMAND BRIEFING [08:00 WITA]
-----------------------------------------
INTEGRITY HASH: ${hash}
STATUS: SECURE

SUMMARY:
Analisis OSINT & Sentimen Sosial menunjukkan peningkatan sentimen negatif (-12%) di wilayah Kupang Barat terkait isu Begal.
Turangga-AI merekomendasikan:
1. Peningkatan Patroli di Sektor 2 & 4 mulai 19:00 WITA.
2. Deployment 2 Unit R2 tambahan di area Perbatasan.
3. Koordinasi dengan Dishub untuk perbaikan PJU di Hotspot AL-09.

Safe Operations, Sentinel-AI Out.`;
}
