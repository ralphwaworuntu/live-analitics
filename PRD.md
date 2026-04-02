# Live Tracking Biro OPS Polda NTT — Master PRD (AI Design + AI Coding) 🇮🇩🫡🚀
**Version:** v1.0  
**Theme:** POLRI vibe modern (dark navy + gold) + sidebar kiri (collapsible)  
**Target stack (fixed):** Flutter (Mobile) + Next.js 14/shadcn (web) + FastAPI (AI & API) + PostGIS + Ollama (Local LLM) + YOLOv8 (Vision) + Docker Compose (Ubuntu 24)

# PART A 🎨✨

## (A0) Design Direction 🟦🟨
**Mood:** authoritative, trustworthy, premium government-tech  
**Keywords:** deep navy, gold accent, clean glass cards, strong typography, minimal noise, Tactical Data

### Layout rule global
- **Sidebar kiri*:** Auto-hide (hover-trigger), grouped by Pulau (Timor, Rote, Sabu, Flores, Sumba, Alor).
- **Topbar** fixed (search + filters + quick actions + profile)
- **Map Focus:** Center-stage GIS dengan frame layar yang bisa berdenyut merah (Visual Hijack)
- **Floating Windows:** Dragable & Resizable untuk komparasi antar Polres.
- **Typography:** Inter (UI) & JetBrains Mono (Data/Coordinates).
- Space system: **8/12/16/24/32**
- Card radius: **20**
- Button radius: **14**
- Mobile bottom sheet radius: **24**
- Soft shadows + subtle borders

---

## A1) Design System (Tokens) 🧾🎨

### A1.1 Color Tokens (POLRI default)
| Token | Value | Use |
|---|---|---|
| `bg` | `#07111F` | background utama |
| `surface` | `#0B1B32` | card/panel |
| `surface2` | `#0E2442` | hover/selected |
| `text` | `#EAF2FF` | teks utama |
| `muted` | `#A9B9D6` | teks sekunder |
| `border` | `rgba(255,255,255,.08)` | border halus |
| `brandPrimary` | `#0B4AA2` | primary button |
| `brandGold` | `#D4AF37` | accent premium |
| `success` | `#18C29C` | ON duty / online |
| `danger` | `#FF4D6D` | waypoint ACTIVE / warning |
| `neutral` | `#7E8AA6` | reached gray / disabled |
| `info` | `#4F7CFF` | info/link |

**Gradients (optional modern touch):**
- `heroGradient`: `linear-gradient(135deg, #07111F 0%, #0B1B32 45%, #0B4AA2 100%)`
- `goldGlow`: `0 0 24px rgba(212,175,55,.16)`

### A1.2 Typography
- Web font: **Inter**
- Mobile fallback: **SF Pro / Roboto**
- Scale:
  - H1: 28–32 (Semibold)
  - H2: 20–22 (Semibold)
  - Body: 14–16 (Regular)
  - Caption: 12–13 (Regular)
- Metric numbers: **tabular numbers** (biar KPI rapih)

### A1.3 Radii, Spacing, Elevation
- Radii:
  - Card: 20
  - Button: 14
  - Bottom sheet: 24
- Spacing: 8/12/16/24/32
- Shadow: `0 10px 30px rgba(0,0,0,.25)`
- Border: `1px rgba(255,255,255,.08)`

### A1.4 Status conventions
- Online: green dot + label
- Offline: gray dot + “Terakhir aktif”
- ON duty: green pill + gold outline
- Waypoint:
  - ACTIVE: red pulse ring
  - REACHED: gray solid

### A1.5 Token Pack (JSON)
```json
{
  "colors": {
    "bg": "#07111F",
    "surface": "#0B1B32",
    "surface2": "#0E2442",
    "text": "#EAF2FF",
    "muted": "#A9B9D6",
    "border": "rgba(255,255,255,0.08)",
    "brandPrimary": "#0B4AA2",
    "brandGold": "#D4AF37",
    "success": "#18C29C",
    "danger": "#FF4D6D",
    "neutral": "#7E8AA6",
    "info": "#4F7CFF"
  },
  "radii": { "card": 20, "button": 14, "sheet": 24 },
  "layout": { "sidebarExpanded": 280, "sidebarCollapsed": 80 },
  "spacing": [8, 12, 16, 24, 32],
  "font": { "family": "Inter", "sizes": { "h1": 30, "h2": 22, "body": 16, "caption": 12 } }
}
```

---

## (A2) PRD — Mobile Field App (Flutter) 📱

### A2.1 Fitur Utama
- **Geo-Tag Reporting:** Laporan berbasis lokasi (foto + teks)
- **AI Vision Ingestion:** Otomatis deteksi massa/senjata saat foto diambil.
- **SOS Panic Button:** Trigger Visual Hijack ke Command Center Polda NTT.
- **Offline Sync:** Simpan laporan saat blank spot (H+30 hari retention).

### A2.2 Screen List
**MVP**
- **Tactical Login:** (NRP + Biometric)
- **Status Home:** (Kamtibmas Heatmap sekitar)
- **Vision Camera:** (Real-time detection overlay: "Massa Terdeteksi: 150").
- **SOS Interface:** (Countdown 3 detik sebelum alert Polda aktif).

## (A3) PRD — Command Center Dashboard (Next.js + shadcn) 🖥️🗺️

### A3.1 Fitur Utama
Panel instansi untuk:
- **Global Map NTT:** 21 Polres dengan dynamic heatmap.
- **Drill-Down:** Klik Polres → Detail Polsek → Detail Pos Polisi.
- **Side-by-Side (Split):** Floating window untuk bandingkan 2 Polres (Dragable).
- **Time Slider:** Histori kejadian + Breadcrumbs rute patroli personil.

### A3.2 AI Chat Interface (Context 7 Grounding)
- **Segmented Chat:** Grup chat per Polres.
- **Grounding Footer:** Setiap saran AI wajib ada link referensi [Sprin No. XXX] atau [No. YYY].
- **Actionable AI:** Klik saran AI → Auto-pin koordinat baru di peta.

---

## (A4) PRD — UI Copywriting (Tactical & Official) 📝
- **Status Kamtibmas:** "Kondusif", "Waspada", "Kontinjensi".
- **AI Alert:** "TURANGGA-AI DETEKSI ANOMALI: Pola kejadian meningkat di [Lokasi]."
- **Verification:** "Data Terverifikasi" / "Referensi Hukum Tersedia".

# PART B — AI CODING (FastAPI + AI Agent) 🧠⚙️

# (B0) Coding Rules (Air-Gapped Focus)
- **No External API:** Dilarang menggunakan OpenAI/Google API. Wajib Local LLM (Ollama).
- **GPU Optimization:** Load model YOLOv8 & Llama 3 ke VRAM (A100/H100).
- **Data Sovereignty:** Isolasi data antar Rayon/Polres wajib di level database (RLS).
---

# (B1) Tech Stack Integration
- **Backend:** FastAPI (Python) - High performance AI async.
- **AI Engine:** Llama 3 (Ollama) + YOLOv8 (Ultralytics).
- **Vector Search:** Milvus (Untuk RAG Dokumen Ren Ops).
- **Frontend:** Next.js 14 + shadcn/ui + Zustand (State Management).
- **Real-time:** Socket.IO untuk Emergency Visual Hijack
---

# (B2) REST & WS Endpoints
- **POST/ai/chat:** Process RAG + Reference Grounding.
- **POST /vision/analyze:** YOLOv8 processing for field photos.
- **GET/map/heatmap:** PostGIS spatial query for 21 Polres.
- **WS/emergency:** Broadcast Visual Hijack to all active sessions.
---

# (B3) Acceptance Tests (KPI)
- **AI Accuracy:** Referensi hukum wajib muncul di setiap saran taktis (Context 7).
- **Latency:** AI Response < 2 detik di GPU A100.
- **Isolation:** Admin Polres A tidak boleh melihat chat privat AI Polres B.
- **Resilience:** Peta tetap muncul via local tiles jika internet internasional down.
---

# (B4) Docker Compose Setup (Ubuntu 24)
- **services:**
  **db:**
    image: postgis/postgis:15
  **ollama:**
    image: ollama/ollama # GPU Pass-through enabled
  **milvus:**
    image: milvusdb/milvus
  **sentinel-api:**
    build: ./backend-api
  **sentinel-dashboard:**
    build: ./apps/dashboard
---

# PART C — DEPLOYMENT MANIFEST (The Infrastructure) 🛠️

# (C1) Strategi Peta Offline (Self-Hosted Maps)
- **Service:** tileserver-gl
- **Data Source:** File ntt-archipelago.mbtiles (OpenMapTiles) yang mencakup seluruh 21 Polres.
- **UI Integration:** Frontend (Leaflet/Mapbox GL) diarahkan ke URL lokal: http://peta-internal.polda/tiles/{z}/{x}/{y}.pnpm.
---

# (C2) Data Pipeline (ETL Job)
- **Mechanism:** Python Script (Cron Job) yang berjalan setiap 5–15 menit.
**Logic:**
   1. Tarik data kejadian terbaru dari SIPP via read-only connection.
   2. Konversi alamat/deskripsi menjadi koordinat (jika belum ada).
   3. Upsert ke tabel incident_reports di PostGIS.
   4. Trigger AI untuk mendeteksi anomali/cluster baru secara otomatis.
---

# (C3) GPU Resource Allocation (Single Node Optimization)
- **VRAM Partitioning:** **Ollama (Llama 3 70B):** Dialokasikan 70% VRAM untuk kecepatan respon chat.
  - **YOLOv8 (Vision):** Dialokasikan 15% VRAM (proses per frame saat ada upload foto).
  - **Milvus (Vector DB):** Dialokasikan 15% VRAM untuk similarity search dokumen.
---

# (C4) Storage & Maintenance Policy (10TB NAS)
- **Cleanup Script:** Otomatis menghapus foto lapangan dan log pelacakan yang berusia >30 hari (sesuai perintah Komandan).
- **Backup:** Harian (pukul 02:00 WITA) untuk dump database PostGIS ke partisi aman di NAS.
---

# PART D — SYSTEM ARCHITECTURE (Docker Compose) 🖥️
version: '3.8'

**services:**
  # 1. Database Spasial (ETL Target)
  db:
    image: postgis/postgis:15
    environment:
      - POSTGRES_PASSWORD=polda_ntt_rahasia
    volumes:
      - pgdata:/var/lib/postgresql/data
      - nas_backup:/backups

  # 2. Local Tile Server (Offline Map)
  tile-server:
    image: maptiler/tileserver-gl
    volumes:
      - ./maps:/data
    command: ["--mbtiles", "ntt-region.mbtiles"]

  # 3. AI Engine (Local LLM & Vision)
  ai-service:
    image: ollama/ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  # 4. Backend Orchestrator (FastAPI)
  api:
    build: ./backend-api
    depends_on: [db, ai-service]
    environment:
      - NTP_SERVER=10.x.x.x # IP NTP Polda NTT

  # 5. Dashboard & Mobile APK Hosting
  dashboard:
    build: ./apps/dashboard
    ports:
      - "80:3000"
---

# PART E — MOBILE DISTRIBUTION POLICY 📱
- **Portal Distribusi:** Halaman khusus di dashboard web (/download) yang menyediakan link unduh APK terbaru secara langsung.
- **Update Mechanism:** Aplikasi akan mengecek versi ke API lokal saat login. Jika ada versi baru, tombol "Update" akan muncul di aplikasi petugas.
---

# END ✅