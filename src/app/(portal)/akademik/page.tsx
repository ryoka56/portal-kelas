import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  MapPin,
} from "lucide-react";

import { CompleteButton } from "@/components/complete-button";
import { Countdown } from "@/components/countdown";
import {
  Avatar,
  Badge,
  Card,
  EmptyState,
  PageHeader,
} from "@/components/ui";
import { requireStudent } from "@/lib/auth";
import { listSchedules, listTasksForUser } from "@/lib/data";
import {
  scheduleTypeLabels,
  scheduleTypeTone,
} from "@/lib/labels";
import { avatarPublicUrl } from "@/lib/supabase";
import {
  dayName,
  formatDate,
  formatDateTime,
  formatTime,
  isOverdue,
  todayDayNumber,
} from "@/lib/format";
import { truncate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Informasi Akademik",
};

export default async function AcademicPage() {
  const user = await requireStudent();
  const [schedules, taskData] = await Promise.all([
    listSchedules(),
    listTasksForUser(user.id),
  ]);

  const today = todayDayNumber();
  const dayNumbers = Array.from(
    new Set([1, 2, 3, 4, 5, ...schedules.map((item) => item.hari)]),
  ).sort((a, b) => a - b);

  const activeTasks = taskData.tasks.filter((task) => task.status === "aktif");
  const closedTasks = taskData.tasks.filter((task) => task.status !== "aktif");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Akademik"
        title="Jadwal & tugas"
        description="Pantau jadwal kuliah mingguan dan progres tugas kelas. Tandai tugas yang sudah selesai agar terlihat oleh teman sekelas."
      />

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Jadwal mingguan
            </h2>
            <p className="text-xs text-slate-500">
              Jadwal kuliah, praktikum, dan kegiatan kelas.
            </p>
          </div>
          <Badge tone="indigo">
            <CalendarDays className="h-3 w-3" />
            Hari ini: {dayName(today)}
          </Badge>
        </div>

        {schedules.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Belum ada jadwal"
            description="Admin belum menambahkan jadwal kuliah untuk kelas ini."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {dayNumbers.map((day) => {
              const items = schedules.filter((schedule) => schedule.hari === day);
              const isToday = day === today;

              return (
                <div
                  key={day}
                  className={`rounded-2xl border p-3 ${
                    isToday
                      ? "border-indigo-200 bg-indigo-50/50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between px-1">
                    <h3
                      className={`text-xs font-bold uppercase tracking-wide ${
                        isToday ? "text-indigo-700" : "text-slate-500"
                      }`}
                    >
                      {dayName(day)}
                    </h3>
                    {isToday ? <Badge tone="indigo">Hari ini</Badge> : null}
                  </div>

                  <div className="space-y-2">
                    {items.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-slate-200 px-3 py-4 text-center text-[11px] text-slate-400">
                        Tidak ada jadwal
                      </p>
                    ) : (
                      items.map((schedule) => (
                        <div
                          key={schedule.id}
                          className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                        >
                          <Badge tone={scheduleTypeTone[schedule.jenis]}>
                            {scheduleTypeLabels[schedule.jenis]}
                          </Badge>
                          <p className="mt-2 text-xs font-bold leading-5 text-slate-900">
                            {schedule.nama_matkul}
                          </p>
                          <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-slate-500">
                            <Clock className="h-3 w-3" />
                            {formatTime(schedule.jam_mulai)}–
                            {formatTime(schedule.jam_selesai)}
                          </p>
                          {schedule.ruangan ? (
                            <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-slate-500">
                              <MapPin className="h-3 w-3" />
                              {schedule.ruangan}
                            </p>
                          ) : null}
                          {schedule.dosen ? (
                            <p className="mt-1 line-clamp-1 text-[10px] text-slate-400">
                              {schedule.dosen}
                            </p>
                          ) : null}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Tugas aktif
            </h2>
            <p className="text-xs text-slate-500">
              {activeTasks.length} tugas menunggu. Klik “Tandai selesai” setelah
              kamu mengerjakannya.
            </p>
          </div>
          <Badge tone="amber">
            <ClipboardList className="h-3 w-3" />
            {taskData.totalStudents} mahasiswa
          </Badge>
        </div>

        {activeTasks.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="Semua tugas beres"
            description="Tidak ada tugas aktif saat ini. Waktu yang tepat untuk istirahat."
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {activeTasks.map((task) => {
              const completedCount = task.task_completions.length;
              const isDone = taskData.completedIds.includes(task.id);
              const overdue = isOverdue(task.deadline);
              const recent = task.task_completions
                .filter((item) => item.profiles)
                .slice(0, 5);

              return (
                <Card key={task.id} className="flex flex-col p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <Badge tone="indigo">{task.matakuliah}</Badge>
                      <Link
                        href={`/akademik/tugas/${task.id}`}
                        className="mt-2 block text-base font-bold leading-6 text-slate-900 hover:text-indigo-700"
                      >
                        {task.judul}
                      </Link>
                    </div>
                    {overdue ? <Badge tone="rose">Terlambat</Badge> : null}
                  </div>

                  {task.deskripsi ? (
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {truncate(task.deskripsi.replace(/\s+/g, " "), 160)}
                    </p>
                  ) : null}

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>{formatDateTime(task.deadline)}</span>
                    <Countdown deadline={task.deadline} />
                  </div>

                  <div className="mt-auto pt-5">
                    <div className="flex items-center justify-between gap-3">
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
                          {completedCount}/{taskData.totalStudents} selesai
                        </span>
                      </div>
                      <CompleteButton
                        taskId={task.id}
                        completed={isDone}
                        disabled={task.status !== "aktif"}
                      />
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{
                          width: `${taskData.totalStudents > 0 ? Math.min(100, (completedCount / taskData.totalStudents) * 100) : 0}%`,
                        }}
                      />
                    </div>

                    <Link
                      href={`/akademik/tugas/${task.id}`}
                      className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      Lihat detail & siapa yang selesai
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {closedTasks.length > 0 ? (
        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
            Tugas ditutup
          </h2>
          <div className="space-y-2">
            {closedTasks.map((task) => (
              <Link
                key={task.id}
                href={`/akademik/tugas/${task.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm transition-colors hover:bg-slate-50"
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-slate-800">
                    {task.judul}
                  </span>
                  <span className="text-xs text-slate-500">
                    {task.matakuliah} · {formatDate(task.deadline)}
                  </span>
                </span>
                <Badge tone="slate">Ditutup</Badge>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <div className="flex items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white/60 px-4 py-3 text-xs text-slate-500">
        <BookOpen className="h-4 w-4 shrink-0 text-slate-400" />
        Progres tugas dihitung dari jumlah mahasiswa aktif. Status centang
        terlihat oleh teman sekelas, tanpa menampilkan kontak pribadi.
      </div>
    </div>
  );
}
