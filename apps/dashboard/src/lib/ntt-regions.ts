export const NTT_REGIONS_MAPPING: Record<string, string[]> = {
  "Polresta Kupang Kota": ["Kelapa Lima", "Oebobo", "Kota Raja", "Alak", "Maulafa"],
  "Polres Kupang": ["Kupang Timur", "Kupang Barat", "Sulamu", "Fatuleu", "Amabi Oefeto"],
  "Polres TTU": ["Kota Kefamenanu", "Insana", "Biboki Anleu", "Miomaffo Timur", "Noemuti"],
  "Polres Belu": ["Atambua Kota", "Kakuluk Mesak", "Tasifeto Barat", "Lamaknen", "Raihat"],
  "Polres Malaka": ["Betun", "Malaka Tengah", "Malaka Barat", "Wewiku", "Rinhat"],
  "Polres TTS": ["Kota Soe", "Amanuban Barat", "Amanatun Utara", "Mollo Utara", "Batu Putih"],
  "Polres Alor": ["Teluk Mutiara", "Alor Barat Daya", "Pantar", "Apui", "Kalabahi"],
  "Polres Flores Timur": ["Larantuka", "Adonara", "Solor", "Wulanggitang", "Tanjung Bunga"],
  "Polres Lembata": ["Nubatukan", "Omesuri", "Buyasuri", "Ile Ape", "Lebatukan"],
  "Polres Sikka": ["Alok", "Maumere", "Koting", "Paga", "Bola"],
  "Polres Ende": ["Ende Tengah", "Ende Selatan", "Nangapanda", "Wolowaru", "Detusoko"],
  "Polres Nagekeo": ["Mbay", "Aesesa", "Boawae", "Mauponggo", "Wolowae"],
  "Polres Ngada": ["Bajawa", "Golewa", "Aimere", "Soa", "Riung"],
  "Polres Manggarai": ["Ruteng", "Langke Rembong", "Cibal", "Reok", "Satarmese"],
  "Polres Manggarai Barat": ["Labuan Bajo", "Komodo", "Lembor", "Kuwus", "Macang Pacar"],
  "Polres Manggarai Timur": ["Borong", "Kota Komba", "Sambi Rampas", "Elar", "Poco Ranaka"],
  "Polres Sumba Timur": ["Waingapu", "Pandawai", "Lewa", "Karera", "Tabundung"],
  "Polres Sumba Barat": ["Waikabubak", "Loli", "Wanokaka", "Lamboya", "Tana Righu"],
  "Polres Sumba Tengah": ["Waibakul", "Katikutana", "Mamboro", "Umbu Ratu Nggay"],
  "Polres Sumba Barat Daya": ["Waitabula", "Wewewa Barat", "Kodi", "Loura"],
  "Polres Rote Ndao": ["Lobalain", "Rote Barat Laut", "Pantai Baru", "Rote Timur"]
};

export const ALL_NTT_SECTORS = Object.values(NTT_REGIONS_MAPPING).flat().sort();
