import type {
  ActivityItem,
  HeatPoint,
  KPIItem,
  PolresItem,
} from "@/lib/types";

export const mockPolresData: PolresItem[] = [
  {
    id: "kupang-kota",
    name: "Polres Kupang Kota",
    island: "Timor",
    lat: -10.1583,
    lng: 123.6063,
    status: "kondusif",
    personnel: 120,
    online: 98,
    reports24h: 12,
  },
  {
    id: "kupang",
    name: "Polres Kupang",
    island: "Timor",
    lat: -10.1772,
    lng: 123.5833,
    status: "kondusif",
    personnel: 95,
    online: 80,
    reports24h: 8,
  },
  {
    id: "belu",
    name: "Polres Belu",
    island: "Timor",
    lat: -9.1000,
    lng: 124.8920,
    status: "waspada",
    personnel: 70,
    online: 58,
    reports24h: 6,
  },
  {
    id: "ende",
    name: "Polres Ende",
    island: "Flores",
    lat: -8.8450,
    lng: 121.6520,
    status: "kontinjensi",
    personnel: 85,
    online: 72,
    reports24h: 10,
  },
  {
    id: "manggarai",
    name: "Polres Manggarai",
    island: "Flores",
    lat: -8.5988,
    lng: 120.4781,
    status: "kondusif",
    personnel: 78,
    online: 65,
    reports24h: 5,
  },
  {
    id: "sumba-timur",
    name: "Polres Sumba Timur",
    island: "Sumba",
    lat: -9.6500,
    lng: 120.2600,
    status: "kondusif",
    personnel: 62,
    online: 48,
    reports24h: 4,
  },
];

export const mockHeatmapData: HeatPoint[] = [
  {
    id: "heat-1",
    title: "Kepadatan laporan pasar tradisional",
    severity: "tinggi",
    lat: -10.1605,
    lng: 123.6012,
    weight: 3,
    polresId: "kupang-kota",
    timestamp: new Date().toISOString(),
  },
  {
    id: "heat-2",
    title: "Anomali patroli malam",
    severity: "kritis",
    lat: -8.8425,
    lng: 121.655,
    weight: 4,
    polresId: "ende",
    timestamp: new Date().toISOString(),
  },
  {
    id: "heat-3",
    title: "Kenaikan aktivitas terminal",
    severity: "sedang",
    lat: -9.1015,
    lng: 124.889,
    weight: 2,
    polresId: "belu",
    timestamp: new Date().toISOString(),
  },
];

export const mockActivities: ActivityItem[] = [
  {
    id: "act-1",
    time: "22:14",
    title: "Patroli selesai",
    location: "Polres Kupang Kota",
    polresId: "kupang-kota",
    status: "success",
  },
  {
    id: "act-2",
    time: "21:48",
    title: "Laporan masuk",
    location: "Polres Ende",
    polresId: "ende",
    status: "info",
  },
  {
    id: "act-3",
    time: "21:30",
    title: "Insiden terdeteksi",
    location: "Polres Belu",
    polresId: "belu",
    status: "danger",
  },
  {
    id: "act-4",
    time: "20:55",
    title: "Personil check-in",
    location: "Polres Manggarai",
    polresId: "manggarai",
    status: "success",
  },
  {
    id: "act-5",
    time: "20:12",
    title: "AI Alert: Anomali",
    location: "Polres Sumba Timur",
    polresId: "sumba-timur",
    status: "warning",
  },
];

export function buildMockKpis(polres: PolresItem | null): KPIItem[] {
  const activePersonnel = polres?.online ?? 421;
  const totalPersonnel = polres?.personnel ?? 530;
  const reportCount = polres?.reports24h ?? 47;
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
      value: isFocused ? "2" : "8",
      change: isFocused ? "+1" : "+2",
      changeType: "positive",
      icon: "🎯",
      subtitle: isFocused ? `fokus ${polres?.name}` : "di 5 wilayah",
    },
    {
      id: "reports",
      title: "Laporan Masuk (24j)",
      value: reportCount.toLocaleString("id-ID"),
      change: isFocused ? "+3" : "+15",
      changeType: "neutral",
      icon: "📋",
      subtitle: isFocused ? "terhubung ke AI & peta" : "12 belum ditindak",
    },
    {
      id: "incidents",
      title: "Insiden Aktif",
      value: isFocused && polres?.status === "kontinjensi" ? "2" : isFocused ? "1" : "3",
      change: polres?.status === "kontinjensi" ? "+1" : "-2",
      changeType: polres?.status === "kontinjensi" ? "neutral" : "negative",
      icon: "🚨",
      subtitle: polres?.status === "kontinjensi" ? "perlu eskalasi" : "1 kritis",
    },
  ];
}
