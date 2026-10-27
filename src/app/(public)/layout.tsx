import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  Mail,
  Megaphone,
  MessageCircle,
  ShieldCheck,
  Users,
} from "lucide-react";

import { buttonStyles } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { getAdminContact } from "@/lib/data";
import { normalizePhoneForWa } from "@/lib/utils";

export const dynamic = "force-dynamic";

const navItems = [
  { href: "/#tentang", label: "Beranda" },
  { href: "/#fitur", label: "Fitur" },
  { href: "/#pengumuman", label: "Pengumuman" },
  { href: "/#jadwal", label: "Jadwal" },
  { href: "/#kontak", label: "Kontak" },
];

const sidebarLinks = [
  { href: "/direktori", label: "Direktori Mahasiswa", icon: Users },
  { href: "/pengumuman", label: "Papan Pengumuman", icon: Megaphone },
  { href: "/akademik", label: "Informasi Akademik", icon: CalendarDays },
  { href: "/bantuan", label: "Bantuan & Kontak", icon: LifeBuoy },
];

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, admin] = await Promise.all([getCurrentUser(), getAdminContact()]);

  const portalHref = user
    ? user.is_first_login
      ? "/ganti-password"
      : user.role === "admin"
        ? "/admin"
        : "/dashboard"
    : "/login";

  const waNumber = admin.no_hp ? normalizePhoneForWa(admin.no_hp) : null;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="container-page flex h-20 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-600 text-white shadow-sm">
              <GraduationCap className="h-6 w-6" />
            </span>
            <span className="leading-tight">
              <span className="block text-lg font-bold tracking-tight text-slate-900">
                Portal Kelas
              </span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
                Sistem Informasi Kelas
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <p className="hidden max-w-[240px] text-right text-[11px] leading-5 text-slate-500 lg:block">
              Satu kelas, satu sumber informasi. Lebih rapi, lebih mudah
              diakses.
            </p>
            <Link
              href={portalHref}
              className={buttonStyles({ variant: "primary", size: "sm" })}
            >
              {user ? "Buka Portal" : "Masuk Portal"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <nav className="border-b border-indigo-800/20 bg-indigo-700 text-white">
        <div className="container-page flex items-center gap-1 overflow-x-auto py-2">
          {navItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                index === 0
                  ? "shrink-0 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold text-white"
                  : "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-indigo-100 transition-colors hover:bg-white/10 hover:text-white"
              }
            >
              {item.label}
            </Link>
          ))}
          <span className="ml-auto hidden shrink-0 text-[10px] text-indigo-200 sm:block">
            Portal internal kelas
          </span>
        </div>
      </nav>

      <div className="container-page flex-1 py-8">
        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="order-2 space-y-4 self-start lg:order-1 lg:sticky lg:top-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-700">
                  <BookOpen className="h-4 w-4" />
                </span>
                <p className="text-sm font-bold text-slate-900">Tentang kelas</p>
              </div>
              <p className="mt-3 text-xs leading-6 text-slate-600">
                Ruang informasi digital untuk satu kelas: direktori mahasiswa,
                pengumuman resmi, jadwal, tugas, dan bantuan admin.
              </p>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 text-[10px] text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                Hanya mahasiswa dan admin kelas yang bisa masuk.
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Menu cepat
              </p>
              <div className="mt-3 space-y-1">
                {sidebarLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      <Icon className="h-3.5 w-3.5 text-slate-400" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
              <p className="mt-3 border-t border-slate-100 pt-3 text-[10px] leading-5 text-slate-400">
                Menu di atas terbuka setelah kamu masuk.
              </p>
            </div>

            <div className="rounded-2xl bg-indigo-700 p-5 text-white shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-200">
                {user ? "Selamat datang kembali" : "Sudah punya akun?"}
              </p>
              <p className="mt-1 text-sm font-bold">
                {user ? user.nama : "Masuk ke portal kelas"}
              </p>
              <p className="mt-1 text-[11px] leading-5 text-indigo-100">
                {user
                  ? "Lanjutkan ke dashboard untuk melihat informasi terbaru."
                  : "Gunakan NIM dan password yang diberikan admin kelas."}
              </p>
              <Link
                href={portalHref}
                className={buttonStyles({
                  variant: "primary",
                  size: "sm",
                  className: "mt-3 w-full bg-white text-indigo-800 hover:bg-indigo-50",
                })}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                {user ? "Buka Dashboard" : "Masuk Portal"}
              </Link>
            </div>

            {(admin.no_hp || admin.email) && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Kontak admin
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {admin.nama}
                </p>
                <div className="mt-3 space-y-2">
                  {waNumber ? (
                    <a
                      href={`https://wa.me/${waNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-slate-600 hover:text-indigo-700"
                    >
                      <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                      {admin.no_hp}
                    </a>
                  ) : null}
                  {admin.email ? (
                    <a
                      href={`mailto:${admin.email}`}
                      className="flex items-center gap-2 text-xs text-slate-600 hover:text-indigo-700"
                    >
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      {admin.email}
                    </a>
                  ) : null}
                </div>
              </div>
            )}
          </aside>

          <main className="order-1 min-w-0 lg:order-2">{children}</main>
        </div>
      </div>

      <footer className="bg-slate-950 text-slate-300">
        <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-500 text-white">
                <GraduationCap className="h-5 w-5" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-bold text-white">Portal Kelas</p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                  Sistem Informasi Kelas
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-xs leading-6 text-slate-400">
              Portal informasi kelas untuk membantu mahasiswa menemukan
              pengumuman, jadwal, tugas, dan kontak admin dengan lebih mudah.
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Portal
            </p>
            <div className="mt-3 space-y-2 text-xs">
              <Link href="/login" className="block text-slate-400 hover:text-white">
                Masuk
              </Link>
              <Link href="/#fitur" className="block text-slate-400 hover:text-white">
                Fitur
              </Link>
              <Link href="/#pengumuman" className="block text-slate-400 hover:text-white">
                Pengumuman
              </Link>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Bantuan
            </p>
            <div className="mt-3 space-y-2 text-xs">
              <Link href="/bantuan" className="block text-slate-400 hover:text-white">
                Kontak Admin
              </Link>
              <Link href="/#tentang" className="block text-slate-400 hover:text-white">
                Tentang Kelas
              </Link>
              <Link href="/profil" className="block text-slate-400 hover:text-white">
                Profil Saya
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="container-page flex flex-col gap-1 py-4 text-[10px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Portal Kelas. Dibuat untuk kelas.</p>
            <p className="inline-flex items-center gap-1">
              <ClipboardList className="h-3 w-3" />
              Satu tempat untuk semua informasi kelas.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
