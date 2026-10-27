"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  KeyRound,
  LifeBuoy,
  LogOut,
  Megaphone,
  Menu,
  Users,
} from "lucide-react";

import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import { Avatar, Badge, buttonStyles } from "./ui";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/mahasiswa", label: "Mahasiswa", icon: Users },
  { href: "/admin/pengumuman", label: "Pengumuman", icon: Megaphone },
  { href: "/admin/jadwal", label: "Jadwal Kuliah", icon: CalendarDays },
  { href: "/admin/tugas", label: "Tugas", icon: ClipboardList },
  { href: "/admin/tiket", label: "Tiket Bantuan", icon: LifeBuoy },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({
  user,
  avatarUrl,
  pendingTickets,
  children,
}: {
  user: { nama: string; nim: string };
  avatarUrl: string | null;
  pendingTickets: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const sidebar = (
    <>
      <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-950/30">
          <GraduationCap className="h-5 w-5" />
        </span>
        <span className="leading-tight">
          <span className="block text-sm font-bold tracking-tight text-white">
            Portal Kelas
          </span>
          <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
            Panel Admin
          </span>
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Navigasi admin">
        {links.map((link) => {
          const active = isActive(pathname, link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-500/15 text-white ring-1 ring-inset ring-indigo-400/30"
                  : "text-slate-400 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{link.label}</span>
              {link.href === "/admin/tiket" && pendingTickets > 0 ? (
                <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-amber-950">
                  {pendingTickets}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link
          href="/ganti-password"
          className="mb-1 flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <KeyRound className="h-3.5 w-3.5" />
          Ganti password
        </Link>
        <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
          <Avatar name={user.nama} src={avatarUrl} size="sm" />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-xs font-semibold text-white">{user.nama}</p>
            <p className="text-[10px] text-slate-400">{user.nim} · Admin</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className={buttonStyles({
                variant: "ghost",
                size: "icon",
                className: "text-slate-400 hover:bg-white/10 hover:text-white",
              })}
              title="Keluar"
              aria-label="Keluar"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-slate-950 transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebar}
      </aside>

      {open ? (
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm lg:hidden"
        />
      ) : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/85 px-4 backdrop-blur lg:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700"
              aria-label="Buka menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-sm font-bold text-slate-900">Panel Admin</span>
          </div>
          <Badge tone="indigo">Admin</Badge>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
