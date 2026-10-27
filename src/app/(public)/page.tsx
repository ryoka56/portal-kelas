import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  Mail,
  MapPin,
  Megaphone,
  MessageCircle,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Badge, buttonStyles } from "@/components/ui";
import { getPublicLandingData } from "@/lib/data";
import { categoryLabels, categoryTone } from "@/lib/labels";
import {
  dayName,
  formatDate,
  formatDateShort,
  formatTime,
} from "@/lib/format";
import { truncate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Beranda",
  description:
    "Portal Kelas: direktori mahasiswa, pengumuman, jadwal, tugas, dan bantuan dalam satu tempat.",
};

const features = [
  {
    icon: Users,
    title: "Direktori mahasiswa",
    description:
      "Cari teman kelas berdasarkan nama atau NIM, lalu lihat profil dan kontak yang sudah diizinkan.",
    tone: "bg-indigo-50 text-indigo-700",
  },
  {
    icon: Megaphone,
    title: "Pengumuman terpusat",
    description:
      "Informasi tugas, perubahan jadwal, dan kegiatan kelas tersimpan rapi dan mudah dicari.",
    tone: "bg-amber-50 text-amber-700",
  },
  {
    icon: ClipboardList,
    title: "Tugas & progres",
    description:
      "Pantau deadline, tandai tugas yang sudah selesai, dan lihat progres teman sekelas.",
    tone: "bg-emerald-50 text-emerald-700",
  },
  {
    icon: ShieldCheck,
    title: "Bantuan & koreksi",
    description:
      "Ajukan koreksi data atau pertanyaan lewat tiket. Statusnya bisa dipantau sampai selesai.",
    tone: "bg-sky-50 text-sky-700",
  },
];

export default async function LandingPage() {
  const data = await getPublicLandingData();

  return (
    <div className="space-y-10 sm:space-y-14">
      <section
        id="tentang"
        className="relative overflow-hidden rounded-3xl bg-slate-950 p-7 text-white shadow-xl shadow-slate-950/10 sm:p-10"
      >
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative">
          <Badge tone="indigo" className="bg-white/10 text-indigo-200 ring-white/10">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Portal internal kelas
          </Badge>

          <h1 className="mt-5 max-w-2xl text-balance text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            Satu tempat untuk semua informasi kelas.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
            Dari direktori mahasiswa sampai pengumuman, jadwal, tugas, dan
            bantuan admin — semuanya rapi dalam satu portal yang mudah
            diakses.
          </p>

          <div className="mt-7 flex flex-wrap gap-2">
            <Link
              href="/login"
              className={buttonStyles({
                size: "lg",
                className: "bg-white text-slate-950 hover:bg-slate-100",
              })}
            >
              Masuk Portal
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/#fitur"
              className={buttonStyles({
                variant: "ghost",
                size: "lg",
                className: "border border-white/15 text-white hover:bg-white/10",
              })}
            >
              Lihat Fitur
            </Link>
          </div>

          <div className="mt-9 grid grid-cols-2 gap-3 border-t border-white/10 pt-6 sm:grid-cols-4">
            {[
              { label: "Mahasiswa aktif", value: data.studentCount },
              { label: "Pengumuman", value: data.announcementCount },
              { label: "Tugas aktif", value: data.activeTaskCount },
              { label: "Jadwal", value: data.scheduleCount },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-[10px] uppercase tracking-wide text-indigo-200">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="fitur">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">
              Yang bisa kamu lakukan
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Dibuat untuk kebutuhan kelas
            </h2>
          </div>
          <p className="max-w-sm text-xs leading-6 text-slate-500">
            Semua fitur saling terhubung, jadi tidak perlu berpindah grup chat
            untuk mencari informasi yang sama.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <span
                  className={`grid h-10 w-10 place-items-center rounded-xl ${feature.tone}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3 text-sm font-bold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-1 text-xs leading-6 text-slate-500">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="pengumuman">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">
              Papan informasi
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Pengumuman terbaru
            </h2>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900"
          >
            Masuk untuk melihat semua
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {data.announcements.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
            Belum ada pengumuman yang dipublikasikan.
          </div>
        ) : (
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {data.announcements.map((announcement) => (
              <Link
                key={announcement.id}
                href="/login"
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge tone={categoryTone[announcement.kategori]}>
                    {categoryLabels[announcement.kategori]}
                  </Badge>
                  <span className="text-[10px] text-slate-400">
                    {formatDateShort(announcement.created_at)}
                  </span>
                </div>
                <h3 className="mt-3 line-clamp-2 text-sm font-bold leading-6 text-slate-900 group-hover:text-indigo-700">
                  {announcement.judul}
                </h3>
                <p className="mt-1.5 line-clamp-3 text-xs leading-5 text-slate-500">
                  {truncate(announcement.konten.replace(/\s+/g, " "), 140)}
                </p>
                <p className="mt-4 inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600">
                  Baca di portal
                  <ArrowRight className="h-3 w-3" />
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section id="jadwal" className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">
                Akademik
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                Jadwal kuliah
              </h2>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-700">
              <CalendarDays className="h-5 w-5" />
            </span>
          </div>

          {data.schedules.length === 0 ? (
            <p className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-xs text-slate-500">
              Jadwal belum ditambahkan admin.
            </p>
          ) : (
            <div className="mt-4 divide-y divide-slate-100">
              {data.schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {schedule.nama_matkul}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {dayName(schedule.hari)} · {formatTime(schedule.jam_mulai)}–
                      {formatTime(schedule.jam_selesai)}
                      {schedule.ruangan ? ` · ${schedule.ruangan}` : ""}
                    </p>
                  </div>
                  <Badge tone="slate">{schedule.jenis}</Badge>
                </div>
              ))}
            </div>
          )}
          <p className="mt-4 text-[11px] text-slate-400">
            Jadwal lengkap dan agenda praktikum tersedia setelah masuk.
          </p>
        </div>

        <div className="rounded-2xl bg-indigo-700 p-5 text-white shadow-sm sm:p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-200">
            Cara mulai
          </p>
          <h2 className="mt-1 text-xl font-bold">
            Tiga langkah, langsung pakai.
          </h2>
          <ol className="mt-5 space-y-4">
            {[
              {
                icon: Search,
                title: "Masuk dengan NIM",
                text: "Gunakan akun yang dibuat admin kelas.",
              },
              {
                icon: Users,
                title: "Lengkapi profil",
                text: "Atur kontak dan privasi sesuai kebutuhanmu.",
              },
              {
                icon: CheckCircle2,
                title: "Gunakan portal",
                text: "Cek pengumuman, jadwal, tugas, dan bantuan.",
              },
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="flex gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-indigo-100">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold">
                      {index + 1}. {step.title}
                    </p>
                    <p className="text-[11px] leading-5 text-indigo-100">
                      {step.text}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
          <Link
            href="/login"
            className={buttonStyles({
              size: "sm",
              className: "mt-5 w-full bg-white text-indigo-800 hover:bg-indigo-50",
            })}
          >
            Masuk sekarang
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      <section
        id="kontak"
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">
              Butuh bantuan?
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Ada data yang perlu dikoreksi?
            </h2>
            <p className="mt-2 text-xs leading-6 text-slate-500">
              Hubungi admin kelas atau ajukan tiket setelah masuk. Setiap
              laporan tercatat dan statusnya bisa dipantau.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/login"
              className={buttonStyles({ variant: "primary" })}
            >
              <MessageCircle className="h-4 w-4" />
              Masuk & Kirim Tiket
            </Link>
            <Link
              href="/#tentang"
              className={buttonStyles({ variant: "outline" })}
            >
              <Mail className="h-4 w-4" />
              Tentang Portal
            </Link>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-200 pt-5 text-[10px] text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" /> Informasi kelas selalu diperbarui
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" /> Satu kelas, satu portal
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5" /> Akses khusus mahasiswa
        </span>
        <span className="ml-auto">Diperbarui {formatDate(new Date())}</span>
      </div>
    </div>
  );
}
