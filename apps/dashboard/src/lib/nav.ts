export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    title: "COMMAND",
    items: [
      { id: "dashboard", label: "Dashboard", icon: "📊", href: "/" },
      { id: "map", label: "Peta Operasi", icon: "🗺️", href: "/map" },
      { id: "ai-chat", label: "AI TURANGGA", icon: "🤖", href: "/ai-chat" },
    ],
  },
  {
    title: "PULAU TIMOR",
    items: [
      { id: "kupang-kota", label: "Polres Kupang Kota", icon: "📍", href: "/polres/kupang-kota" },
      { id: "kupang", label: "Polres Kupang", icon: "📍", href: "/polres/kupang" },
      { id: "tts", label: "Polres TTS", icon: "📍", href: "/polres/tts" },
      { id: "ttu", label: "Polres TTU", icon: "📍", href: "/polres/ttu" },
      { id: "belu", label: "Polres Belu", icon: "📍", href: "/polres/belu" },
      { id: "malaka", label: "Polres Malaka", icon: "📍", href: "/polres/malaka" },
    ],
  },
  {
    title: "PULAU FLORES",
    items: [
      { id: "manggarai", label: "Polres Manggarai", icon: "📍", href: "/polres/manggarai" },
      { id: "mabar", label: "Polres Mabar", icon: "📍", href: "/polres/mabar" },
      { id: "ngada", label: "Polres Ngada", icon: "📍", href: "/polres/ngada" },
      { id: "nagekeo", label: "Polres Nagekeo", icon: "📍", href: "/polres/nagekeo" },
      { id: "ende", label: "Polres Ende", icon: "📍", href: "/polres/ende" },
      { id: "sikka", label: "Polres Sikka", icon: "📍", href: "/polres/sikka" },
      { id: "flotim", label: "Polres Flotim", icon: "📍", href: "/polres/flotim" },
    ],
  },
  {
    title: "PULAU SUMBA",
    items: [
      { id: "sbd", label: "Polres SBD", icon: "📍", href: "/polres/sbd" },
      { id: "sbt", label: "Polres SBT", icon: "📍", href: "/polres/sbt" },
      { id: "sumba-barat", label: "Polres Sumba Barat", icon: "📍", href: "/polres/sumba-barat" },
      { id: "sumba-timur", label: "Polres Sumba Timur", icon: "📍", href: "/polres/sumba-timur" },
    ],
  },
  {
    title: "PULAU LAINNYA",
    items: [
      { id: "rote", label: "Polres Rote Ndao", icon: "📍", href: "/polres/rote" },
      { id: "sabu", label: "Polres Sabu Raijua", icon: "📍", href: "/polres/sabu" },
      { id: "alor", label: "Polres Alor", icon: "📍", href: "/polres/alor" },
      { id: "lembata", label: "Polres Lembata", icon: "📍", href: "/polres/lembata" },
    ],
  },
  {
    title: "SISTEM",
    items: [
      { id: "reports", label: "Laporan", icon: "📋", href: "/reports" },
      { id: "personnel", label: "Personil", icon: "👮", href: "/personnel" },
      { id: "audit", label: "Audit Log", icon: "🔒", href: "/audit" },
      { id: "settings", label: "Pengaturan", icon: "⚙️", href: "/settings" },
    ],
  },
];

export function extractPolresIdFromPath(pathname: string): string | null {
  if (!pathname.startsWith("/polres/")) {
    return null;
  }

  const segments = pathname.split("/").filter(Boolean);
  return segments[1] ?? null;
}
