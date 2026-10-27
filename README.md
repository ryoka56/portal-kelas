# Portal Kelas

Portal informasi kelas untuk mahasiswa dan admin. Dibuat dengan **Next.js 15**, **Tailwind CSS 4**, dan **Supabase** (Postgres + Storage), siap di-deploy gratis ke **Vercel**.

Repo ini berisi **source code saja**. Data contoh (mahasiswa, pengumuman, jadwal, tugas, tiket) tidak disertakan.

**Live:** [https://portal-kelas-sage.vercel.app](https://portal-kelas-sage.vercel.app)

## Struktur halaman

Sesuai instruksi tugas (8–10 halaman berisi konten):

**Halaman mahasiswa / publik (8 halaman):**
1. Landing page `/` — header, navigation, sidebar, content, footer.
2. Login `/login`.
3. Beranda `/dashboard`.
4. Direktori `/direktori`.
5. Pengumuman `/pengumuman`.
6. Akademik `/akademik`.
7. Bantuan `/bantuan`.
8. Profil `/profil`.

**Halaman admin (6 halaman utama):**
Dashboard, Mahasiswa, Pengumuman, Jadwal, Tugas, Tiket.

## Fitur

### Mahasiswa
- **Beranda** — ringkasan kelas, pengumuman penting, tugas mendatang, dan akses cepat.
- **Direktori** — cari nama/NIM, lihat profil, kontak hanya tampil jika diizinkan.
- **Pengumuman** — filter kategori, detail, lampiran, dan pengumuman yang disematkan.
- **Akademik** — jadwal mingguan, daftar tugas, countdown deadline, dan tombol tandai selesai.
- **Bantuan** — kontak admin, form tiket, riwayat tiket, dan balasan admin.
- **Profil** — foto, email, nomor HP, dan pengaturan privasi kontak.

### Admin
- **Dashboard** — statistik kelas, pengumuman terbaru, tiket, dan deadline.
- **Mahasiswa** — buat akun, edit data akademik, atur status, reset password, soft delete.
- **Pengumuman** — CRUD, lampiran, pin/unpin (maksimal 3).
- **Jadwal** — CRUD jadwal kuliah/praktikum/kegiatan.
- **Tugas** — CRUD tugas global, tutup/buka tugas, lihat siapa yang sudah selesai.
- **Tiket** — baca, balas, dan ubah status tiket.

### Aturan utama
- Akun **dibuat admin**; mahasiswa tidak bisa mendaftar sendiri.
- Mahasiswa mengisi kontak/foto sendiri; NIM, nama, dan program studi dikunci.
- Login pertama wajib ganti password.
- Tugas bersifat **global**, tetapi status selesai dicatat **per mahasiswa**.
- Mahasiswa lain hanya melihat nama yang sudah selesai (centang), bukan yang belum.
- Admin melihat daftar lengkap siapa yang sudah/belum selesai.

## Menjalankan lokal

### 1. Prasyarat
- Node.js 20+ dan pnpm
- Akun [Supabase](https://supabase.com) (free)

### 2. Buat project Supabase
1. Buat project baru di dashboard Supabase.
2. Buka **Settings → API**, salin:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
3. Buka **Connect** (tombol di atas dashboard), salin connection string **Pooler** (port `6543` atau `5432`) → `DATABASE_URL`.
4. Salin `.env.example` menjadi `.env.local`, lalu isi nilainya.
5. Generate `AUTH_SECRET`:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
   ```

### 3. Install & isi database
```bash
pnpm install
pnpm db:setup   # membuat tabel, index, trigger, bucket storage
```

Isi `ADMIN_NIM`, `ADMIN_NAMA`, dan `ADMIN_PASSWORD` di `.env.local`, lalu buat akun admin pertama:

```bash
pnpm db:admin
pnpm dev
```

Buka [http://localhost:3000](http://localhost:3000).

Repo ini tidak menyertakan data contoh. Setelah login sebagai admin, isi data mahasiswa, pengumuman, jadwal, dan tugas lewat panel admin.

### 4. Cek Supabase Storage
Schema otomatis membuat dua bucket:
- `avatars` — publik, untuk foto profil.
- `lampiran` — privat, untuk lampiran pengumuman (diakses lewat signed URL).

Jika bucket belum muncul, buat manual di **Storage** dengan nama dan visibilitas yang sama.

## Environment variables

| Variabel | Wajib | Keterangan |
|---|---|---|
| `SUPABASE_URL` | Ya | URL project Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Ya | Hanya server. Jangan pernah pakai prefix `NEXT_PUBLIC_` |
| `DATABASE_URL` | Untuk setup/admin | Connection string Pooler Supabase |
| `AUTH_SECRET` | Ya | Minimal 32 karakter acak |
| `NEXT_PUBLIC_APP_URL` | Ya | `http://localhost:3000` atau URL Vercel |
| `ADMIN_WHATSAPP` | Tidak | Nomor HP admin; juga dipakai saat `pnpm db:admin` |
| `ADMIN_EMAIL` | Tidak | Email admin; juga dipakai saat `pnpm db:admin` |
| `ADMIN_NIM` | Untuk `db:admin` | NIM akun admin pertama |
| `ADMIN_NAMA` | Untuk `db:admin` | Nama admin pertama |
| `ADMIN_PASSWORD` | Untuk `db:admin` | Password admin, minimal 8 karakter |

## Deploy ke Vercel

1. Push project ini ke GitHub.
2. Di Vercel: **Add New → Project**, import repo.
3. Framework otomatis terdeteksi **Next.js**.
4. Tambahkan environment variables yang sama seperti `.env.local`.
5. Deploy. Setelah dapat URL production, ubah `NEXT_PUBLIC_APP_URL` ke URL tersebut dan redeploy.
6. Jalankan `pnpm db:setup` dan `pnpm db:admin` dari lokal terhadap database Supabase yang sama (cukup sekali).

Vercel Hobby gratis dan Supabase free tier cukup untuk kebutuhan kelas. Vercel Functions tidak "tidur" seperti Render; URL tetap bisa diakses kapan saja (request pertama bisa sedikit lebih lambat karena cold start).

### Supabase tetap aktif 24 jam

Project Supabase free **pause setelah 7 hari tanpa aktivitas**. Supaya tetap aktif meskipun tidak ada yang membuka web, project ini punya endpoint `/api/health` dan cron harian di `vercel.json`:

```json
{
  "crons": [{ "path": "/api/health", "schedule": "0 3 * * *" }]
}
```

- Vercel Cron Hobby berjalan **sekali sehari** (jadwal 03.00 UTC / 10.00 WIB, bisa bergeser ±1 jam).
- Setiap panggilan melakukan query ringan ke Supabase, sehingga hitungan "7 hari tanpa aktivitas" selalu di-reset.
- Cek manual: `https://domain-kamu.vercel.app/api/health` → `{ "ok": true, "database": "up" }`.
- Jika ingin pengaman tambahan, daftarkan URL health check itu ke monitor gratis seperti UptimeRobot (interval 5 menit). Ini opsional.

Kalau butuh jaminan **tanpa pause, tanpa cold start, dan SLA**, itu tidak tersedia gratis: Supabase Pro mulai $25/bulan, atau pindah ke VPS/Railway berbayar. Untuk tugas kuliah, combo Vercel Hobby + Supabase free + cron harian sudah cukup untuk tetap online 24/7.

## Struktur

```
src/
  app/
    login/                  # login
    ganti-password/         # ganti password (wajib saat login pertama)
    (portal)/               # halaman mahasiswa
      dashboard/
      direktori/
      pengumuman/
      akademik/
      bantuan/
      profil/
    admin/                  # halaman admin
      mahasiswa/
      pengumuman/
      jadwal/
      tugas/
      tiket/
  components/               # UI & form
  lib/
    actions/                # Server Actions
    auth.ts                 # sesi JWT + bcrypt
    data.ts                 # query Supabase
    supabase.ts             # service-role client (server only)
supabase/schema.sql         # skema database
scripts/                    # setup & pembuatan admin
```

## Keamanan

- Semua akses database lewat server menggunakan **service role**; tidak ada query Supabase dari browser.
- RLS diaktifkan tanpa policy publik; service role tetap bisa melakukan operasi server.
- Password di-hash dengan bcrypt.
- Sesi disimpan di cookie `httpOnly` yang ditandatangani (JWT, 7 hari).
- Server Action memeriksa sesi dan role admin sebelum operasi sensitif.
- File dibatasi tipe dan ukuran (foto 2 MB, lampiran 3 MB).
- `SUPABASE_SERVICE_ROLE_KEY` tidak boleh bocor ke client.

## Troubleshooting

- **`SUPABASE_URL ... belum diset`** — `.env.local` belum dibuat atau `pnpm dev` dijalankan dari folder yang salah.
- **Relasi `profiles` tidak ditemukan** — jalankan `pnpm db:setup`; pastikan constraint FK sesuai `supabase/schema.sql`.
- **Koneksi database gagal saat setup/admin** — gunakan connection string **Pooler** Supabase, bukan direct IPv6.
- **Supabase pause** — buka dashboard Supabase, klik restore/unpause.
- **Build Vercel gagal** — pastikan environment variables sudah ditambahkan untuk Production.
