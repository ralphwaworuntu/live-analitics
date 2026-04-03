import type {
  ActivityItem,
  HeatPoint,
  KPIItem,
  PolresItem,
} from "@/lib/types";

export const mockPolresData: PolresItem[] = [
  { id: "kupang-kota", name: "Polresta Kupang Kota", island: "Timor", lat: -10.1583, lng: 123.6063, status: "kritis", personnel: 420, online: 310, reports24h: 24, crimeStatus: "Merah", cases: 45 },
  { id: "kupang", name: "Polres Kupang", island: "Timor", lat: -10.1772, lng: 123.5833, status: "kondusif", personnel: 380, online: 240, reports24h: 12, crimeStatus: "Hijau", cases: 18 },
  { id: "tts", name: "Polres TTS", island: "Timor", lat: -9.860, lng: 124.282, status: "waspada", personnel: 320, online: 190, reports24h: 18, crimeStatus: "Kuning", cases: 32 },
  { id: "ttu", name: "Polres TTU", island: "Timor", lat: -9.447, lng: 124.481, status: "kondusif", personnel: 290, online: 175, reports24h: 8, crimeStatus: "Hijau", cases: 14 },
  { id: "belu", name: "Polres Belu", island: "Timor", lat: -9.117, lng: 124.891, status: "waspada", personnel: 310, online: 185, reports24h: 15, crimeStatus: "Kuning", cases: 28 },
  { id: "malaka", name: "Polres Malaka", island: "Timor", lat: -9.569, lng: 124.894, status: "kondusif", personnel: 210, online: 145, reports24h: 6, crimeStatus: "Hijau", cases: 9 },
  { id: "rote-ndao", name: "Polres Rote Ndao", island: "Rote", lat: -10.732, lng: 123.064, status: "kondusif", personnel: 180, online: 120, reports24h: 4, crimeStatus: "Hijau", cases: 7 },
  { id: "sabu-raijua", name: "Polres Sabu Raijua", island: "Sabu", lat: -10.490, lng: 121.841, status: "kondusif", personnel: 140, online: 95, reports24h: 3, crimeStatus: "Hijau", cases: 5 },
  { id: "alor", name: "Polres Alor", island: "Alor", lat: -8.243, lng: 124.512, status: "kondusif", personnel: 240, online: 165, reports24h: 7, crimeStatus: "Hijau", cases: 11 },
  { id: "flores-timur", name: "Polres Flores Timur", island: "Flores", lat: -8.343, lng: 122.981, status: "kondusif", personnel: 270, online: 180, reports24h: 9, crimeStatus: "Hijau", cases: 15 },
  { id: "lembata", name: "Polres Lembata", island: "Lembata", lat: -8.375, lng: 123.413, status: "kondusif", personnel: 190, online: 135, reports24h: 5, crimeStatus: "Hijau", cases: 8 },
  { id: "sikka", name: "Polres Sikka", island: "Flores", lat: -8.621, lng: 122.219, status: "waspada", personnel: 310, online: 210, reports24h: 14, crimeStatus: "Kuning", cases: 22 },
  { id: "ende", name: "Polres Ende", island: "Flores", lat: -8.847, lng: 121.651, status: "waspada", personnel: 290, online: 205, reports24h: 11, crimeStatus: "Kuning", cases: 25 },
  { id: "nagekeo", name: "Polres Nagekeo", island: "Flores", lat: -8.857, lng: 121.213, status: "kondusif", personnel: 230, online: 160, reports24h: 6, crimeStatus: "Hijau", cases: 10 },
  { id: "ngada", name: "Polres Ngada", island: "Flores", lat: -8.784, lng: 120.975, status: "kondusif", personnel: 250, online: 175, reports24h: 7, crimeStatus: "Hijau", cases: 12 },
  { id: "manggarai-timur", name: "Polres Manggarai Timur", island: "Flores", lat: -8.742, lng: 120.621, status: "kondusif", personnel: 220, online: 155, reports24h: 6, crimeStatus: "Hijau", cases: 9 },
  { id: "manggarai", name: "Polres Manggarai", island: "Flores", lat: -8.618, lng: 120.472, status: "kondusif", personnel: 280, online: 195, reports24h: 10, crimeStatus: "Hijau", cases: 14 },
  { id: "manggarai-barat", name: "Polres Manggarai Barat", island: "Flores", lat: -8.502, lng: 119.882, status: "kritis", personnel: 340, online: 255, reports24h: 21, crimeStatus: "Merah", cases: 38 },
  { id: "sumba-timur", name: "Polres Sumba Timur", island: "Sumba", lat: -9.654, lng: 120.262, status: "kondusif", personnel: 300, online: 215, reports24h: 10, crimeStatus: "Hijau", cases: 16 },
  { id: "sumba-tengah", name: "Polres Sumba Tengah", island: "Sumba", lat: -9.452, lng: 119.641, status: "kondusif", personnel: 180, online: 125, reports24h: 4, crimeStatus: "Hijau", cases: 6 },
  { id: "sumba-barat", name: "Polres Sumba Barat", island: "Sumba", lat: -9.442, lng: 119.321, status: "waspada", personnel: 260, online: 185, reports24h: 13, crimeStatus: "Kuning", cases: 21 },
];

export const mockHeatmapData: HeatPoint[] = [];

export const mockActivities: ActivityItem[] = [];

export function buildMockKpis(polres: PolresItem | null): KPIItem[] {
  const activePersonnel = polres?.online ?? 4820;
  const totalPersonnel = polres?.personnel ?? 6500;
  const reportCount = polres?.reports24h ?? 124;
  const isFocused = Boolean(polres);

  return [
    {
      id: "personnel",
      title: "Total Personil Aktif",
      value: activePersonnel.toLocaleString("id-ID"),
      change: isFocused ? "+4" : "+12",
      changeType: "positive",
      icon: "👮",
      subtitle: `dari ${totalPersonnel.toLocaleString("id-ID")} total`,
    },
    {
      id: "operations",
      title: "Operasi Berjalan",
      value: isFocused ? "2" : "21",
      change: isFocused ? "+1" : "+4",
      changeType: "positive",
      icon: "🎯",
      subtitle: isFocused ? `fokus ${polres?.name}` : "di 21 wilayah polres",
    },
    {
      id: "reports",
      title: "Laporan (24j/Polres)",
      value: reportCount.toLocaleString("id-ID"),
      change: isFocused ? "+3" : "+15",
      changeType: "neutral",
      icon: "📋",
      subtitle: isFocused ? "terhubung ke AI" : "total regional NTT",
    },
    {
      id: "incidents",
      title: "Status Wilayah",
      value: polres?.status ?? "KONDUSIF",
      change: polres?.status === "kritis" ? "HIGH RISK" : "NORMAL",
      changeType: polres?.status === "kritis" ? "negative" : "positive",
      icon: "🚨",
      subtitle: polres?.status === "kritis" ? "butuh back up" : "Situasi terkendali",
    },
  ];
}
