import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  LifeBuoy,
  MapPin,
  Megaphone,
  Users,
} from "lucide-react";

import { CompleteButton } from "@/components/complete-button";
import { Countdown } from "@/components/countdown";
import { ProgressRing } from "@/components/progress-ring";
import {
  Alert,
  Avatar,
  Badge,
  Card,
  EmptyState,
  StatCard,
  buttonStyles,
} from "@/components/ui";
import { requireStudent } from "@/lib/auth";
import {
  getProfileForEdit,
  getStudentDashboard,
  getStudentTaskProgress,
  listSchedules,
} from "@/lib/data";
import { categoryLabels, categoryTone } from "@/lib/labels";
import { avatarPublicUrl } from "@/lib/supabase";
import {
  dayName,
  formatDate,
  formatDateShort,
  formatTime,
  todayDayNumber,
} from "@/lib/format";
import { truncate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Beranda",
};

export default async function DashboardPage() {
  const user = await requireStudent();
  const [data, profile, progress, schedules] = await Promise.all([
    getStudentDashboard(user.id),
    getProfileForEdit(user.id),
    getStudentTaskProgress(user.id),
    listSchedules(),
  ]);

  if (!profile) redirect("/login");

  const firstName = user.nama.split(" ")[0];
  const announcements = data.pinned.length > 0 ? data.pinned : data.latest.slice(0, 3);
  const profileIncomplete = !profile.email || !profile.no_hp || !profile.foto_path;
  const today = todayDayNumber();
  const todaySchedules = schedules.filter((item) => item.hari === today).slice(0, 3);

  return (
    <div className="space-y-7">
      <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/10 sm:p-8">
          <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-indigo-500/25 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="relative flex h-full flex-col justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">
                {formatDate(new Date())}
              </p>
              <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
                Halo, {firstName}.
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                Semua informasi kelas ada di satu tempat. Cek pengumuman
                terbaru, deadline tugas, dan jadwal kuliahmu sebelum memulai
                hari.
              </p>
            </div>

            <div className="mt-7 flex flex-wrap gap-2">
              <Link
                href="/akademik"
                className={buttonStyles({
                  variant: "primary",
                  className: "bg-white text-slate-950 hover:bg-slate-100",
                })}
              >
                <CalendarDays className="h-4 w-4" />
                Lihat Akademik
              </Link>
              <Link
                href="/pengumuman"
                className={buttonStyles({
                  variant: "ghost",
                  className: "border border-white/15 text-white hover:bg-white/10",
                })}
              >
                <Megaphone className="h-4 w-4" />
                Pengumuman
              </Link>
              <Link
                href="/direktori"
                className={buttonStyles({
                  variant: "ghost",
                  className: "border border-white/15 text-white hover:bg-white/10",
                })}
              >
                <Users className="h-4 w-4" />
                Direktori
              </Link>
            </div>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">
                  Jadwal hari ini
                </p>
                <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900">
                  {dayName(today)}
                </h2>
              </div>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-indigo-700">
                <CalendarDays className="h-4 w-4" />
              </span>
            </div>

            {todaySchedules.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-3 py-4 text-xs leading-5 text-slate-500">
                Tidak ada jadwal kuliah hari ini. Waktu yang tepat untuk
                menyelesaikan tugas.
              </p>
            ) : (
              <div className="mt-4 space-y-2">
                {todaySchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-semibold text-slate-800">
                        {schedule.nama_matkul}
                      </p>
                      <Badge tone="slate">
                        {formatTime(schedule.jam_mulai)}
                      </Badge>
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
                      <Clock className="h-3 w-3" />
                      {formatTime(schedule.jam_mulai)}–
                      {formatTime(schedule.jam_selesai)}
                      {schedule.ruangan ? (
                        <>
                          <MapPin className="ml-1.5 h-3 w-3" />
                          {schedule.ruangan}
                        </>
                      ) : null}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <Link
              href="/akademik"
              className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Lihat jadwal lengkap
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Card>

          <Card className="flex items-center gap-4 p-5">
            <ProgressRing
              value={progress.completed}
              max={progress.total}
              label="Progres tugas"
            />
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">
                Progres tugas
              </p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                {progress.completed}
                <span className="text-sm font-semibold text-slate-400">
                  /{progress.total}
                </span>
              </p>
              <p className="text-[11px] leading-5 text-slate-500">
                Tugas aktif sudah kamu selesaikan.
              </p>
              <Link
                href="/akademik"
                className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Lihat tugas
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {profileIncomplete ? (
        <Alert variant="warning">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Profilmu belum lengkap. Lengkapi kontak dan foto agar teman kelas
              mudah mengenalimu.
            </p>
            <Link
              href="/profil"
              className="inline-flex shrink-0 items-center gap-1 text-xs font-bold underline underline-offset-4"
            >
              Lengkapi profil
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Alert>
      ) : null}

      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Mahasiswa Aktif"
          value={data.studentCount}
          hint="Teman sekelas"
          icon={Users}
          tone="indigo"
        />
        <StatCard
          label="Pengumuman"
          value={data.announcementCount}
          hint="Informasi kelas"
          icon={Megaphone}
          tone="sky"
        />
        <StatCard
          label="Tugas Aktif"
          value={data.taskCount}
          hint="Belum ditutup"
          icon={ClipboardList}
          tone="amber"
        />
        <StatCard
          label="Tiket Terbuka"
          value={data.openTicketCount}
          hint="Menunggu admin"
          icon={LifeBuoy}
          tone="emerald"
        />
      </section>

      {announcements.length > 0 ? (
        <section>
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                Pengumuman penting
              </h2>
              <p className="text-xs text-slate-500">
                Disematkan dan terbaru dari admin kelas.
              </p>
            </div>
            <Link
              href="/pengumuman"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Semua pengumuman
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {announcements.map((announcement) => (
              <Link
                key={announcement.id}
                href={`/pengumuman/${announcement.slug}`}
                className="group"
              >
                <Card className="h-full p-5 transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
                  <div className="flex items-center justify-between gap-2">
                    <Badge tone={categoryTone[announcement.kategori]}>
                      {categoryLabels[announcement.kategori]}
                    </Badge>
                    {announcement.is_pinned ? (
                      <Badge tone="amber">Disematkan</Badge>
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        {formatDateShort(announcement.created_at)}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 line-clamp-2 text-sm font-bold leading-6 text-slate-900 group-hover:text-indigo-700">
                    {announcement.judul}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500">
                    {truncate(announcement.konten.replace(/\s+/g, " "), 120)}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{formatDate(announcement.created_at)}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <Card className="p-5 sm:p-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900">
                  Tugas mendatang
                </h2>
                <p className="text-xs text-slate-500">
                  Tandai selesai agar teman kelas melihat progresmu.
                </p>
              </div>
              <Link
                href="/akademik"
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Semua tugas
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {data.tasks.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="Tidak ada tugas aktif"
                description="Saat ini belum ada tugas yang perlu dikerjakan."
                className="mt-5"
              />
            ) : (
              <div className="mt-4 divide-y divide-slate-100">
                {data.tasks.map((task) => {
                  const completed = task.task_completions.length;
                  const isDone = data.completedTaskIds.includes(task.id);
                  const recent = task.task_completions
                    .filter((item) => item.profiles)
                    .slice(0, 3);

                  return (
                    <div key={task.id} className="py-4 first:pt-2 last:pb-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Badge tone="indigo">{task.matakuliah}</Badge>
                          <Link
                            href={`/akademik/tugas/${task.id}`}
                            className="mt-2 block text-sm font-bold text-slate-900 hover:text-indigo-700"
                          >
                            {task.judul}
                          </Link>
                          <p className="mt-1 text-xs text-slate-500">
                            Deadline {formatDate(task.deadline)} ·{" "}
                            <Countdown deadline={task.deadline} />
                          </p>
                        </div>
                        <CompleteButton taskId={task.id} completed={isDone} />
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {recent.map((item) =>
                              item.profiles ? (
                                <Avatar
                                  key={item.user_id}
                                  name={item.profiles.nama}
                                  src={avatarPublicUrl(item.profiles.foto_path)}
                                  size="sm"
                                  className="ring-2 ring-white"
                                />
                              ) : null,
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500">
                            {completed}/{data.studentCount} selesai
                          </span>
                        </div>
                        <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{
                              width: `${data.studentCount > 0 ? Math.min(100, (completed / data.studentCount) * 100) : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </section>

        <aside className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                Pengumuman terbaru
              </h2>
              <Megaphone className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-3 divide-y divide-slate-100">
              {data.latest.slice(0, 4).map((announcement) => (
                <Link
                  key={announcement.id}
                  href={`/pengumuman/${announcement.slug}`}
                  className="block py-3 first:pt-0 last:pb-0"
                >
                  <p className="text-xs font-semibold leading-5 text-slate-800 hover:text-indigo-700">
                    {announcement.judul}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {formatDateShort(announcement.created_at)} ·{" "}
                    {categoryLabels[announcement.kategori]}
                  </p>
                </Link>
              ))}
              {data.latest.length === 0 ? (
                <p className="py-4 text-xs text-slate-500">
                  Belum ada pengumuman.
                </p>
              ) : null}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-900">Akses cepat</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                { href: "/direktori", label: "Direktori", icon: Users },
                { href: "/akademik", label: "Jadwal", icon: CalendarDays },
                { href: "/bantuan", label: "Bantuan", icon: LifeBuoy },
                { href: "/profil", label: "Profil", icon: CheckCircle2 },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-semibold text-slate-700 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
