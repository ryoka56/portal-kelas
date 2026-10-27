"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

function format(diff: number) {
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} hari ${hours % 24} jam`;
  if (hours > 0) return `${hours} jam ${minutes % 60} menit`;
  return `${Math.max(minutes, 1)} menit`;
}

export function Countdown({
  deadline,
  className,
}: {
  deadline: string;
  className?: string;
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  if (now === null) {
    return (
      <span className={cn("text-xs text-slate-500", className)}>
        Menghitung...
      </span>
    );
  }

  const diff = new Date(deadline).getTime() - now;

  if (diff <= 0) {
    return (
      <span className={cn("text-xs font-semibold text-rose-600", className)}>
        Terlambat {format(Math.abs(diff))}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "text-xs font-semibold",
        diff < 24 * 60 * 60 * 1000 ? "text-amber-600" : "text-slate-600",
        className,
      )}
    >
      {format(diff)} lagi
    </span>
  );
}
