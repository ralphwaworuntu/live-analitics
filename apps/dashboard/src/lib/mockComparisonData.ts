export const mockComparisonData = {
  "kupang-kota": {
    name: "POLRESTA KUPANG KOTA",
    crimeTrend: [
      { month: "Jan", count: 45 },
      { month: "Feb", count: 52 },
      { month: "Mar", count: 38 },
      { month: "Apr", count: 65 },
      { month: "Mei", count: 48 },
      { month: "Jun", count: 40 },
    ],
    responseTime: [
      { month: "Jan", avgMinutes: 12 },
      { month: "Feb", avgMinutes: 10 },
      { month: "Mar", avgMinutes: 9 },
      { month: "Apr", avgMinutes: 15 },
      { month: "Mei", avgMinutes: 11 },
      { month: "Jun", avgMinutes: 8 },
    ],
    personnelStrength: [
      { category: "Aktif", count: 85 },
      { category: "Cuti", count: 5 },
      { category: "Sakit", count: 2 },
      { category: "Dinas Luar", count: 8 },
    ],
  },
  "manggarai-barat": {
    name: "POLRES MANGGARAI BARAT",
    crimeTrend: [
      { month: "Jan", count: 25 },
      { month: "Feb", count: 22 },
      { month: "Mar", count: 18 },
      { month: "Apr", count: 15 },
      { month: "Mei", count: 30 },
      { month: "Jun", count: 20 },
    ],
    responseTime: [
      { month: "Jan", avgMinutes: 25 },
      { month: "Feb", avgMinutes: 22 },
      { month: "Mar", avgMinutes: 18 },
      { month: "Apr", avgMinutes: 20 },
      { month: "Mei", avgMinutes: 15 },
      { month: "Jun", avgMinutes: 14 },
    ],
    personnelStrength: [
      { category: "Aktif", count: 60 },
      { category: "Cuti", count: 8 },
      { category: "Sakit", count: 0 },
      { category: "Dinas Luar", count: 12 },
    ],
  },
};

export type PolresComparisonId = keyof typeof mockComparisonData;
