# Sharing Vision — Frontend (Kunci Jawaban)

Kunci jawaban **Tes Frontend Sharing Vision 2023 (Dashboard)**: dashboard artikel
berbasis React (JavaScript) + Vite + Tailwind CSS v4 yang memakai API backend Go/Gin
(`/article`).

- Live (Vercel): https://frontend-sharingvision-samuelchrist.vercel.app
- Backend API: https://backend-sharingvision-samuelchristy.vercel.app ([repo](https://github.com/samuelsihotang1/backend-sharingvision-samuelchristyangiesihotang))

## Pemetaan soal ke kode

| Soal | Jawaban | File |
| --- | --- | --- |
| 1. Halaman **All Posts** dengan tab Published, Drafts, Trashed | Route `/`, tab disimpan di URL (`?tab=drafts`), jumlah artikel per tab dari header `X-Total-Count` | `src/pages/AllPostsPage.jsx`, `src/components/articles/StatusTabs.jsx`, `src/components/articles/StatCards.jsx` |
| 1a. Tabel berisi title, category, action (icon edit & trash) | Tabel dengan pagination server (10 per halaman) | `src/components/articles/ArticleTable.jsx`, `src/components/ui/Pagination.jsx` |
| 1b. Klik edit → halaman Edit (title, content, category bisa diubah + tombol "Publish" & "Draft") | Route `/edit/:id`, form dipakai bersama dengan Add New | `src/pages/EditArticlePage.jsx`, `src/components/articles/ArticleForm.jsx` |
| 1c. Klik trash → artikel pindah ke tab Trashed | `PUT /article/{id}` dengan `status: "thrash"` (bukan dihapus). Di tab Trashed, ikon trash menghapus permanen (`DELETE`) setelah konfirmasi modal | `src/pages/AllPostsPage.jsx`, `src/components/ui/ConfirmModal.jsx` |
| 2. Halaman **Add New** (Title, Content, Category + tombol "Publish" & "Draft") | Route `/add`, `POST /article/` | `src/pages/AddArticlePage.jsx`, `src/components/articles/ArticleForm.jsx` |
| 3. Halaman **Preview**: blog artikel berstatus publish + pagination | Route `/preview` (6 per halaman, `?page=`), detail artikel di `/preview/:id` | `src/pages/PreviewPage.jsx`, `src/pages/PreviewArticlePage.jsx`, `src/components/articles/ArticleCard.jsx` |

Pendukung:

- `src/api/articles.js` — pemanggil API (`fetch`); error dilempar sebagai `ApiError` yang membawa `status` dan `fieldErrors` (422).
- `src/lib/validation.js` — validasi sisi klien, sama dengan backend: title ≥ 20, content ≥ 200, category ≥ 3 karakter (dihitung setelah trim), status `publish` / `draft` / `thrash`.
- `src/hooks/` — `useRequest` (loading/error/reload + abort), `useArticles`, `useToast`.
- Notifikasi memakai toast di dalam halaman; tidak ada `window.alert/confirm/prompt`.

## Menjalankan dengan Docker (satu perintah)

```bash
docker compose up --build
```

Buka http://localhost:3000. Secara default aplikasi memanggil API di
`http://localhost:8080`. Untuk API lain:

```bash
VITE_API_URL=https://api.example.com docker compose up --build
```

`VITE_API_URL` dibaca saat build (Vite memasukkannya ke bundle), jadi ubah nilainya
lalu build ulang. Image: build dengan `node:22-alpine`, disajikan oleh
`nginx:1.27-alpine` dengan fallback SPA (`/edit/3`, `/preview` → `index.html`).

## Menjalankan tanpa Docker

Butuh Node.js 22.22+ atau 24.15+ (versi minimum Vitest/jsdom; build saja cukup 22.12+).

```bash
npm install
cp .env.example .env      # opsional, isi VITE_API_URL
npm run dev               # http://localhost:5173
```

Perintah lain:

| Perintah | Fungsi |
| --- | --- |
| `npm test` | Menjalankan semua test sekali (Vitest + Testing Library) |
| `npm run test:watch` | Test mode watch |
| `npm run lint` | Lint (oxlint, bawaan template Vite React) |
| `npm run build` | Build produksi ke `dist/` |
| `npm run preview` | Menyajikan hasil build secara lokal |
| `bash scripts/ci-local.sh` | CI lokal: install, lint, test, build, lalu smoke test Docker (`CI_SKIP_DOCKER=1` untuk melewati Docker) |

## Environment variable

| Nama | Default | Keterangan |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:8080` | Base URL backend, tanpa garis miring di akhir (garis miring di akhir dibuang otomatis) |

## Test

Test ada di samping kodenya (`*.test.js[x]`). Halaman diuji lewat route asli dengan
backend tiruan di memori (`src/test/fakeApi.js`) yang dipasang sebagai `fetch`,
sehingga tidak ada request jaringan sungguhan. Yang dicakup:

- API: URL, method dan body untuk list/get/create/update/delete, header `X-Total-Count`, error 422/404/500/jaringan.
- All Posts: tab + jumlah, `?tab=`, tabel, trash → `PUT status "thrash"`, hapus permanen lewat modal (Cancel tidak mengirim apa pun), navigasi edit, empty/error state, pagination (offset).
- Add New & Edit: Publish/Draft mengirim status yang benar, validasi klien, error 422 dari server, prefill, 404, redirect ke tab yang sesuai.
- Preview: hanya `status=publish`, limit/offset per halaman, `?page=`, empty state, halaman detail.
- Layout: navigasi dan menu mobile.

## Deploy ke Vercel

Framework preset **Vite**, output `dist`. Isi env var `VITE_API_URL` di Vercel.
`vercel.json` mengarahkan semua path ke `index.html` agar deep link seperti `/edit/3`
tetap jalan. Dockerfile diabaikan oleh Vercel.

## Desain

Gaya visual minimalis: latar `#F7F7F5` dengan pola titik, konten dalam satu kartu
putih besar, teks dan tombol utama `#1A1A1A`, aksen gradasi lavender lembut, heading
besar dengan font Inter Tight (font di-bundle lewat `@fontsource`, jadi tetap jalan
offline di Docker). Token warna ada di `src/index.css` (`@theme`).
