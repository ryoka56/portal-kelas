import Link from "next/link";
import { GraduationCap, LogOut } from "lucide-react";

import { logoutAction } from "@/lib/actions/auth";
import { avatarPublicUrl } from "@/lib/supabase";
import type { SessionUser } from "@/lib/types";
import { buttonStyles } from "./ui";
import { Avatar } from "./ui";
import { MobileTabBar, PortalNav } from "./portal-nav";

export function PortalShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const avatar = avatarPublicUrl(user.foto_path);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="fixed inset-x-0 top-3 z-40 flex justify-center px-3 sm:px-4">
        <div className="flex w-full max-w-6xl items-center justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white/85 px-2.5 py-2 pl-3 shadow-lg shadow-slate-950/5 backdrop-blur-xl sm:rounded-full sm:px-3">
          <Link
            href="/dashboard"
            className="flex shrink-0 items-center gap-2.5"
            aria-label="Portal Kelas"
          >
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <GraduationCap className="h-4.5 w-4.5" />
            </span>
            <span className="leading-tight">
              <span className="block text-[13px] font-bold tracking-tight text-slate-900">
                Portal Kelas
              </span>
              <span className="hidden text-[9px] font-medium uppercase tracking-[0.16em] text-slate-500 sm:block">
                Sistem Informasi Kelas
              </span>
            </span>
          </Link>

          <PortalNav />

          <div className="flex shrink-0 items-center gap-1">
            <Link
              href="/profil"
              className="flex items-center gap-2 rounded-full border border-transparent p-1 pr-1.5 transition-colors hover:border-slate-200 hover:bg-slate-50"
              title="Profil saya"
            >
              <Avatar name={user.nama} src={avatar} size="sm" />
              <span className="hidden text-left leading-tight lg:block">
                <span className="block max-w-[130px] truncate text-[11px] font-semibold text-slate-800">
                  {user.nama}
                </span>
                <span className="block text-[9px] text-slate-500">{user.nim}</span>
              </span>
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className={buttonStyles({ variant: "ghost", size: "icon" })}
                title="Keluar"
                aria-label="Keluar"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <MobileTabBar />

      <main className="container-page flex-1 pb-24 pt-24 sm:pt-28 md:pb-10">
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white pb-24 md:pb-0">
        <div className="container-page flex flex-col gap-1 py-5 pb-0 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between md:pb-5">
          <p>Portal Kelas · Sistem Informasi Kelas</p>
          <p>Dibuat untuk memudahkan akses informasi kelas.</p>
        </div>
      </footer>
    </div>
  );
}
