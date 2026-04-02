# TODO FRONTEND - Sentinel-AI Flobamorata

Daftar berikut adalah hasil audit antara `apps/dashboard/src` dengan fitur yang disyaratkan oleh Master PRD. Daftar ini diperbarui sebagai acuan operasional tim pengembang.

## 🚨 Prioritas Tinggi (Diimplementasikan pada Fase 1)

- [ ] **Three-Panel Tactical Layout**: Pastikan `page.tsx` (Root) merender peta (`GoogleMap`) secara full-screen di panel tengah, beserta widget taktis melayang, menggantikan halaman `CommandCenter` yang statik.
- [ ] **Visual Hijack (Darurat)**: Hubungkan state `isEmergency` dari Zustand agar ketika aktif, border seluruh layar berdenyut merah (`#FF4D6D`) dan menampilkan overlay *non-blocking*. Menerapkan wrap `VisualHijackWrapper` di level layout.
- [ ] **Sinkronisasi GIS Map & Zustand**: Peta tengah (Google Maps) harus memanggil fungsi `map.panTo()` dan zoom otomatis saat status `selectedPolresId` berubah (melalui Sidebar).
- [ ] **Sidebar Navigasi**: Sempurnakan tampilan sidebar menjadi grouping berbasis pulau (Timor, Flores, dll.) dengan fitur glassmorphism sesungguhnya.
- [ ] **Koneksi Panel AI**: Sambungkan `IntelligencePanel.tsx` di sisi kanan layar agar tidak memunculkan data statik, namun merender array `aiMessages` dari `useAppStore`, beserta integrasi input chat.
- [ ] **Transisi Animasi**: Sempurnakan optimasi transisi Login → Dashboard dengan `AnimatePresence`.
- [ ] **Refactoring Bahasa**: Mengganti teks bahasa Inggris seperti "Live Feed", "Attention Queue", "Command Center" ke dalam terminologi tegas bahasa Indonesia (misal: "Laporan Masuk", "Notifikasi Prioritas", "Pusat Komando").

## ⚠️ Prioritas Menengah (Persiapan Fase Berikutnya)

- [ ] **Personnel HoverCard**: Implementasi marker personil mandiri di dalam Google Maps lengkap dengan kartu hover taktis (menampilkan NRP petugas dan status tugas).
- [ ] **Pengolahan Heatmap Layer**: Memindahkan data `heatPoints` dari mockup menjadi visual mapping radius heatmap asli di atas peta Google (membaca bobot ancaman / `weight`).
- [ ] **Dynamic Import**: Muat Google Maps menggunakan `next/dynamic` dengan opsi `ssr: false` untuk meningkatkan performa halaman utama.

## 🕰️ Tanggungan (Menunggu Backend ETL SIPP Aktif)

- [ ] **Breadcrumbs Rute Patroli**: Merekam koordinat gerak personil dan menampilkannya sebagai *path/track* memanjang beserta slider riwayat waktunya.
- [ ] **Side-by-Side Floating Compares**: Melengkapi fungsionalitas `FloatingWindowsManager` sehingga dua window peta/Polres dapat didrag-and-drop untuk perbandingan taktis dua wilayah sekaligus.
- [ ] **WebSockets Hijack**: Wiring state `isEmergency` langsung dengan Socket.IO agar setiap ada pemancaran `WS/emergency` dari agent/petugas lapangan, seluruh terminal di Command Center langsung masuk ke State Visual Hijack secara *real-time*.

---
*Dokumen ini merupakan artefak rekayasa dari hasil gap-analysis Sentinel-AI.*
