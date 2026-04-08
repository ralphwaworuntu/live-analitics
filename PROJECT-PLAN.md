# SENTINEL — Ringkasan Objektif & Proyek

**Versi dokumen:** 1.0  
**Tanggal referensi:** April 2026

---

## 1. Ringkasan objektif

| Aspek | Tujuan |
|--------|--------|
| **Produk** | Platform **SENTINEL**: pelacakan live & command center Biro Ops Polda NTT — peta/heatmap 21 Polres, AI lokal (Ollama + RAG), SOS/emergency real-time, aplikasi lapangan, kedaulatan data dan kemampuan *air-gapped*. |
| **Stack target (PRD)** | Flutter (mobile) + Next.js + shadcn (web) + FastAPI + PostGIS + Ollama + YOLOv8 + Milvus + Docker (Ubuntu 24). |
| **Dokumen ini** | Menjadi **satu referensi** struktur repo, teknologi aktual, gap terhadap PRD, temuan teknis, dan **rencana perbaikan** arsitektur/struktur tanpa menggantikan `PRD.md` sebagai spesifikasi produk. |

---

## 2. Ringkasan proyek (lengkap)

### 2.1 Nama & ruang lingkup

**Nama & tujuan:** **SENTINEL** — pelacakan live & command center untuk Biro Ops Polda NTT: peta/heatmap 21 Polres, AI lokal (Ollama + RAG), SOS/emergency via WebSocket, aplikasi lapangan Flutter, dan stack yang mendukung *air-gapped* / kedaulatan data (lihat `PRD.md`).

### 2.2 Struktur repositori

Bukan monorepo tooling penuh (tanpa workspace root terpusat saat ini):

| Area | Isi |
|------|-----|
| `apps/dashboard/` | Next.js (App Router), UI taktis, peta (Google Maps), Zustand, route `app/api/*` sebagai proxy/fallback ke FastAPI |
| `apps/mobile/` | Flutter — auth biometrik, peta, kamera, socket, offline ringkas (sqflite, dll.) |
| `backend-api/` | FastAPI — auth, chat AI, map/PostGIS, vision, Socket.IO emergency |
| `nginx/` | Reverse proxy TLS, rate limit, `/api/` → FastAPI, `/ws/` → WebSocket, `/` → Next |
| Akar | `docker-compose.yml` (prod), `docker-compose.dev.yml` (dev), `PRD.md` |

### 2.3 Teknologi utama (sesuai kode)

- **Web:** Next **16.2.x**, React **19**, Tailwind **4**, Radix UI, Zustand, `@vis.gl/react-google-maps`, Socket.IO client, Framer Motion, Recharts (`apps/dashboard/package.json`).
- **Mobile:** Flutter (SDK ≥3), Provider, Dio, `google_maps_flutter`, kamera, `socket_io_client`, sqflite, dll. (`apps/mobile/pubspec.yaml`).
- **Backend:** FastAPI, SQLAlchemy 2 async + **GeoAlchemy2**, **python-socketio**, httpx → Ollama, **pymilvus** (siap RAG; logika Milvus di chat masih mock), JWT/passlib (`backend-api/requirements.txt`).
- **Data & AI:** PostGIS **15-3.4**, Ollama, Milvus **v2.4.0** (hanya di `docker-compose.yml` prod; **tidak** ada di `docker-compose.dev.yml`).
- **Deploy:** Nginx + Certbot, image dashboard multi-stage **standalone** (`apps/dashboard/Dockerfile`).

### 2.4 Selisih penting PRD vs implementasi

1. PRD menetapkan **Next.js 14 + shadcn**; repo memakai **Next 16 + React 19** dan komponen Radix/shadcn-style — ini **upgrade jalur modern** (proyek memperingatkan perubahan breaking di `apps/dashboard/AGENTS.md`).
2. PRD: **tileserver-gl** + MBTiles offline — **belum** tercakup di `docker-compose.yml` saat ini (masih mengandalkan Google Maps + key env).
3. PRD: **ETL SIPP**, backup NAS, pembagian VRAM — belum terlihat sebagai layanan/kode terpisah di repo ini.
4. **“Context 7 Grounding” di PRD** = konteks hukum/SOP ter-grounding; di backend, retrieval **Milvus disimulasikan** (`fetch_milvus_context`), bukan integrasi penuh indeks/embedding — bukan produk “Context7 MCP” pihak ketiga (PRD melarang API eksternal untuk LLM).

### 2.5 Alur request (produksi)

Browser → Nginx → **`/api/*` langsung ke FastAPI** (`nginx/sentinel.conf`). Route Next di `app/api/*` berguna terutama saat **`next dev`** (same-origin `/api` ke BFF); di produksi, panggilan `/api/...` dari browser **tidak melewati** handler Next — **konsisten** selama kontrak API sama. **`api.ts`** memakai path relatif `/api/...`; pastikan tidak memakai `NEXT_PUBLIC_API_URL` untuk fetch browser ke host berbeda tanpa CORS — di setup Nginx sekarang, same-origin ke domain dashboard sudah dialihkan ke backend untuk `/api`.

### 2.6 Temuan teknis singkat

- `backend-api/app/routes/emergency.py` mengimpor **`shapely`**, tetapi **`shapely` tidak ada di `requirements.txt`** — risiko gagal build/run.
- `backend-api/app/main.py` mendefinisikan `socketio.ASGIApp` lalu **`app.mount("/ws", ...)`** — pola entrypoint ASGI untuk uvicorn perlu satu sumber kebenaran (hindari duplikasi/mount ganda yang membingungkan).
- Chat dari Next `route.ts` mengirim **`user_id: 1` hardcoded** — tidak siap multi-user/RLS nyata.

---

## 3. Rencana perbaikan struktur & arsitektur

### 3.1 Repositori & kontrak API

- Menambahkan **workspace root** (mis. **pnpm** + `pnpm-workspace.yaml` atau **Turborepo**): `apps/dashboard`, `apps/mobile`, `backend-api`, dan nanti `packages/shared-*`.
- **Satu sumber kebenaran untuk API:** generate **OpenAPI** dari FastAPI → klien TypeScript (dashboard) dan dokumentasi untuk Flutter; opsional **JSON Schema** untuk kontrak heatmap/chat.
- Folder **`packages/api-types`** atau skrip codegen untuk menghindari drift field (`polres_id` vs `polresId`, dll.).

### 3.2 Lapisan backend (FastAPI)

- **Migrasi DB:** ganti `create_all` saja dengan **Alembic** + revisi PostGIS (geometry, indeks spasial).
- **RLS / isolasi Polres** sesuai PRD: kebijakan PostgreSQL per `polres_id` + filter konsisten di Milvus (`expression`/`partition`).
- **Milvus:** pipeline embedding + koleksi per dokumen Ren Ops; hilangkan mock `fetch_milvus_context` bertahap.
- **Dependensi:** tambahkan **`shapely`** (atau ganti geometri dengan PostGIS-only di worker) dan audit import lain.
- **ASGI:** satu entrypoint (`socket_app` atau mount tunggal) yang dipakai **uvicorn** di Dockerfile; dokumentasikan path Socket.IO (`/ws/socket.io`).
- **`/api/health`:** isi status DB/Ollama/Milvus secara nyata (bukan placeholder).

### 3.3 Infrastruktur & Docker

- **Dev-parity:** tambahkan **Milvus** (dan dependensinya jika perlu) ke `docker-compose.dev.yml` agar perilaku RAG sama dengan prod; atau dokumentasi eksplisit “RAG off di dev”.
- **Peta offline (PRD):** service **`tileserver-gl`** (atau setara), volume MBTiles, env frontend untuk **URL tile internal**; opsi **MapLibre GL** + sumber lokal menggantikan atau melengkapi Google untuk skenario *internet internasional down*.
- **Layanan ETL** (cron/container terpisah) untuk pipeline SIPP → PostGIS sesuai PRD Bagian C2.

### 3.4 Dashboard Next.js

- **Zustand:** pecah menjadi **slice** (mis. `mapSlice`, `emergencySlice`, `aiChatSlice`) atau beberapa store agar `store.ts` tidak menjadi “god object”.
- **BFF:** putuskan secara eksplisit:
  - **Opsi A:** browser hanya memanggil **`/api` via Nginx ke FastAPI** (tanpa route Next di prod) — hapus duplikasi atau jadikan route Next hanya untuk dev.
  - **Opsi B:** prefix berbeda untuk BFF Next vs API agar tidak bentrok.
- **Auth:** hapus `user_id` statis; JWT dari login FastAPI mengisi konteks chat dan header ke proxy.
- **Next.js 16:** pertimbangkan **`rewrites`** di `next.config` untuk menyelaraskan dev dengan prod (proxy `/api` ke backend), dan **`output: 'standalone'`** sudah sesuai praktik Docker.

### 3.5 Mobile Flutter

- **Base URL** terpusat (dev/staging/prod), retry/token refresh dengan Dio, alignment event Socket.IO dengan path `/ws/socket.io` yang sama dengan backend.
- Uji **alur offline** (antrian laporan) terhadap kontrak API yang sama dengan codegen.

### 3.6 Keamanan & operasi

- Secret hanya lewat env; **rotasi JWT**, **rate limit** (sudah di Nginx untuk login/API), audit log konsisten dengan model `AuditLog`.
- **CI:** lint (ESLint), `pytest`, `flutter analyze`, build image Docker; optional **Playwright** untuk dashboard.

### 3.7 Prioritas eksekusi (disarankan)

1. Perbaikan **dependensi + entrypoint ASGI + health check** (stabilkan runtime).
2. **Alembic + seed/21 Polres** data minimal.
3. **OpenAPI + codegen** dan bersihkan hardcoded `user_id`.
4. **Paritas docker dev** (Milvus) dan **tile server** sesuai PRD.
5. **Refactor state** dashboard dan **layanan ETL** jangka menengah.

---

## 4. Referensi silang

- **Spesifikasi produk & desain:** `PRD.md`
- **Aturan agen Next.js (breaking changes):** `apps/dashboard/AGENTS.md`

---

*Akhir dokumen.*
