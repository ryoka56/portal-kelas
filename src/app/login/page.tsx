import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  Megaphone,
  ShieldCheck,
  Users,
} from "lucide-react";

import { LoginForm } from "@/components/login-form";
import { sanitizeNextPath } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Masuk",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawNext = Array.isArray(params.next) ? params.next[0] : params.next;
  const nextPath = sanitizeNextPath(rawNext) ?? undefined;

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-500 text-white shadow-lg shadow-indigo-950/40">
              <GraduationCap className="h-6 w-6" />
            </span>
            <div className="leading-tight">
              <p className="text-base font-bold">Portal Kelas</p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                Sistem Informasi Kelas
              </p>
            </div>
          </div>

          <h1 className="mt-16 max-w-md text-balance text-4xl font-bold leading-tight tracking-tight">
            Satu portal untuk semua informasi kelas.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-slate-400">
            Temukan teman sekelas, baca pengumuman, pantau jadwal dan tugas,
            lalu ajukan koreksi data tanpa harus bertanya satu per satu.
          </p>

          <div className="mt-10 grid max-w-md gap-3 sm:grid-cols-2">
            {[
              { icon: Users, label: "Direktori mahasiswa" },
              { icon: Megaphone, label: "Pengumuman resmi" },
              { icon: CalendarDays, label: "Jadwal & agenda" },
              { icon: ClipboardList, label: "Tugas & progres" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-xs font-medium text-slate-300"
                >
                  <Icon className="h-4 w-4 text-indigo-300" />
                  {item.label}
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="h-4 w-4" />
          Akses hanya untuk mahasiswa dan admin kelas.
        </div>
      </section>

      <section className="flex items-center justify-center bg-slate-50 px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke beranda
          </Link>

          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold text-slate-900">Portal Kelas</p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                Sistem Informasi Kelas
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/5 sm:p-8">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
                Selamat datang
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                Masuk ke akunmu
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">
                Gunakan NIM dan password yang diberikan admin kelas.
              </p>
            </div>

            <LoginForm nextPath={nextPath} />
          </div>

          <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate-500">
            Butuh akun? Hubungi admin kelas
            <ArrowRight className="h-3.5 w-3.5" />
          </p>
        </div>
      </section>
    </div>
  );
}
