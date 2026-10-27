"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Beranda", icon: LayoutDashboard },
  { href: "/direktori", label: "Direktori", icon: Users },
  { href: "/pengumuman", label: "Pengumuman", icon: Megaphone },
  { href: "/akademik", label: "Akademik", icon: CalendarDays },
  { href: "/bantuan", label: "Bantuan", icon: LifeBuoy },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PortalNav() {
  const pathname = usePathname();

  return (
    <nav
      className="hidden items-center gap-0.5 rounded-full border border-slate-200/70 bg-slate-50/70 p-1 md:flex"
      aria-label="Navigasi utama"
    >
      {links.map((link) => {
        const active = isActive(pathname, link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-all",
              active
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-950/15"
                : "text-slate-600 hover:bg-white hover:text-slate-900",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(22,30,24,0.06)] backdrop-blur-md md:hidden"
      aria-label="Navigasi bawah"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 px-1">
        {links.map((link) => {
          const active = isActive(pathname, link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex flex-col items-center gap-1 pb-2 pt-2.5 text-[10px] font-semibold transition-colors",
                active ? "text-indigo-700" : "text-slate-500 hover:text-slate-800",
              )}
            >
              {active ? (
                <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-indigo-600" />
              ) : null}
              <span
                className={cn(
                  "grid h-7 w-9 place-items-center rounded-full transition-colors",
                  active ? "bg-indigo-50" : "bg-transparent",
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
              </span>
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
