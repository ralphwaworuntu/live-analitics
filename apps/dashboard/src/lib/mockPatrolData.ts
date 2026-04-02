import type { PersonnelTrack } from "./types";

export const mockPersonnelTracks: PersonnelTrack[] = [
  {
    id: "p-001",
    nrp: "85020112",
    name: "Bripka Yohanis",
    polresId: "kupang-kota",
    waypoints: Array.from({ length: 48 }).map((_, i) => ({
      lat: -10.15 + (Math.sin(i / 3) * 0.05),
      lng: 123.58 + (Math.cos(i / 3) * 0.05),
      timestamp: new Date(new Date().setHours(0, 0, 0, 0) + i * 30 * 60000).toISOString(),
    })),
  },
  {
    id: "p-002",
    nrp: "88090334",
    name: "Aipda Rahmat",
    polresId: "kupang-kota",
    waypoints: Array.from({ length: 48 }).map((_, i) => ({
      lat: -10.18 + (Math.cos(i / 2) * 0.03),
      lng: 123.60 + (Math.sin(i / 2) * 0.06),
      timestamp: new Date(new Date().setHours(0, 0, 0, 0) + i * 30 * 60000).toISOString(),
    })),
  },
  {
    id: "p-003",
    nrp: "92040556",
    name: "Brigadir Stefanus",
    polresId: "manggarai-barat",
    waypoints: Array.from({ length: 48 }).map((_, i) => ({
      lat: -8.50 + (Math.sin(i / 4) * 0.04),
      lng: 119.88 + (Math.cos(i / 4) * 0.04),
      timestamp: new Date(new Date().setHours(0, 0, 0, 0) + i * 30 * 60000).toISOString(),
    })),
  },
];
