import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  LifeBuoy,
  Megaphone,
  Plus,
  Users,
} from "lucide-react";

import {
  Badge,
  Card,
  EmptyState,
  PageHeader,
  StatCard,
  buttonStyles,
} from "@/components/ui";
import { getAdminDashboard } from "@/lib/data";
import {
  categoryLabels,
  categoryTone,
  ticketStatusLabels,
  ticketStatusTone,
} from "@/lib/labels";
import { formatDate, formatDateShort } from "@/lib/format";

export const metadata: Metadata = {
  title: "Dashboard Admin",
};

export default async function AdminDashboardPage() {
  const data = await getAdminDashboard();

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Panel admin"
        title="Ringkasan portal"
        description="Pantau kondisi kelas, pengumuman, tugas, dan tiket bantuan dari satu halaman."
        actions={
          <>
            <Link
              href="/admin/pengumuman/baru"
              className={buttonStyles({ variant: "primary" })}
            >
              <Plus className="h-4 w-4" />
              Pengumuman
            </Link>
            <Link
              href="/admin/tugas/baru"
              className={buttonStyles({ variant: "outline" })}
            >
              <ClipboardList className="h-4 w-4" />
              Tugas
            </Link>
          </>
        }
      />

      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Mahasiswa Aktif"
          value={data.students}
          hint="Terdaftar & aktif"
          icon={Users}
          tone="indigo"
        />
        <StatCard
          label="Pengumuman"
          value={data.announcements}
          hint="Dipublikasikan"
          icon={Megaphone}
          tone="sky"
        />
        <StatCard
          label="Tugas Aktif"
          value={data.tasks}
          hint="Belum ditutup"
          icon={ClipboardList}
          tone="amber"
        />
        <StatCard
          label="Tiket Menunggu"
          value={data.pendingTickets}
          hint="Perlu ditindaklanjuti"
          icon={LifeBuoy}
          tone="rose"
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                Pengumuman terbaru
              </h2>
              <p className="text-xs text-slate-500">
                Informasi yang baru dipublikasikan.
              </p>
            </div>
            <Link
              href="/admin/pengumuman"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Kelola
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {data.latestAnnouncements.map((announcement) => (
              <Link
                key={announcement.id}
                href={`/admin/pengumuman/${announcement.id}`}
                className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {announcement.judul}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {formatDateShort(announcement.created_at)} ·{" "}
                    {categoryLabels[announcement.kategori]}
                  </p>
                </div>
                <Badge tone={categoryTone[announcement.kategori]}>
                  {categoryLabels[announcement.kategori]}
                </Badge>
              </Link>
            ))}
            {data.latestAnnouncements.length === 0 ? (
              <p className="py-5 text-xs text-slate-500">
                Belum ada pengumuman.
              </p>
            ) : null}
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                Tiket terbaru
              </h2>
              <p className="text-xs text-slate-500">
                Laporan dan pertanyaan dari mahasiswa.
              </p>
            </div>
            <Link
              href="/admin/tiket"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Lihat semua
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {data.latestTickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/admin/tiket/${ticket.id}`}
                className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {ticket.subjek}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {ticket.profiles?.nama ?? "Mahasiswa"} ·{" "}
                    {formatDateShort(ticket.created_at)}
                  </p>
                </div>
                <Badge tone={ticketStatusTone[ticket.status]}>
                  {ticketStatusLabels[ticket.status]}
                </Badge>
              </Link>
            ))}
            {data.latestTickets.length === 0 ? (
              <p className="py-5 text-xs text-slate-500">Belum ada tiket.</p>
            ) : null}
          </div>
        </Card>
      </div>

      <Card className="p-5 sm:p-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Deadline tugas terdekat
            </h2>
            <p className="text-xs text-slate-500">
              Tugas aktif yang perlu dipantau.
            </p>
          </div>
          <Link
            href="/admin/tugas"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Kelola tugas
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {data.upcomingTasks.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Tidak ada tugas aktif"
            description="Buat tugas baru agar mahasiswa tahu deadline berikutnya."
            className="mt-4"
            action={
              <Link
                href="/admin/tugas/baru"
                className={buttonStyles({ variant: "primary", size: "sm" })}
              >
                <Plus className="h-3.5 w-3.5" />
                Buat tugas
              </Link>
            }
          />
        ) : (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {data.upcomingTasks.map((task) => (
              <Link
                key={task.id}
                href={`/admin/tugas/${task.id}`}
                className="rounded-xl border border-slate-200 p-3.5 transition-colors hover:bg-slate-50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {task.judul}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {task.matakuliah}
                    </p>
                  </div>
                  <Badge tone="amber">{task.task_completions.length} selesai</Badge>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  Deadline {formatDate(task.deadline)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
