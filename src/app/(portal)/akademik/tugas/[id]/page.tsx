import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Users,
} from "lucide-react";

import { CompleteButton } from "@/components/complete-button";
import { Countdown } from "@/components/countdown";
import {
  Alert,
  Avatar,
  Badge,
  Card,
  EmptyState,
  buttonStyles,
} from "@/components/ui";
import { requireStudent } from "@/lib/auth";
import { getTaskForUser } from "@/lib/data";
import { avatarPublicUrl } from "@/lib/supabase";
import {
  formatDate,
  formatDateTime,
  isOverdue,
} from "@/lib/format";

export const metadata: Metadata = {
  title: "Detail Tugas",
};

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireStudent();
  const data = await getTaskForUser(id, user.id);

  if (!data) notFound();

  const { task, totalStudents, currentCompleted, completedStudents } = data;
  const completedCount = completedStudents.length;
  const overdue = isOverdue(task.deadline);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/akademik"
        className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Kembali ke akademik
      </Link>

      <div className="space-y-4">
        <Card className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="indigo">{task.matakuliah}</Badge>
            {task.status === "aktif" ? (
              <Badge tone="emerald">Aktif</Badge>
            ) : (
              <Badge tone="slate">Ditutup</Badge>
            )}
            {overdue && task.status === "aktif" ? (
              <Badge tone="rose">Terlambat</Badge>
            ) : null}
          </div>

          <h1 className="mt-4 text-balance text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {task.judul}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Deadline {formatDateTime(task.deadline)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {completedCount}/{totalStudents} selesai
            </span>
          </div>

          <div className="mt-3">
            <Countdown deadline={task.deadline} />
          </div>

          {task.deskripsi ? (
            <div className="mt-6 border-t border-slate-100 pt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Deskripsi tugas
              </p>
              <div className="content-text mt-2">{task.deskripsi}</div>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
            <div>
              <p className="text-xs font-semibold text-slate-700">
                Status kamu
              </p>
              <p className="text-[11px] text-slate-500">
                {currentCompleted
                  ? "Kamu sudah menandai tugas ini selesai."
                  : "Tandai setelah tugas benar-benar selesai."}
              </p>
            </div>
            <CompleteButton
              taskId={task.id}
              completed={currentCompleted}
              disabled={task.status !== "aktif"}
            />
          </div>
        </Card>

        {task.status !== "aktif" ? (
          <Alert variant="info">
            Tugas ini sudah ditutup oleh admin. Status selesai tidak dapat
            diubah lagi.
          </Alert>
        ) : null}

        <Card className="p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Sudah selesai
              </h2>
              <p className="text-xs text-slate-500">
                Hanya mahasiswa yang sudah menyelesaikan tugas yang ditampilkan.
              </p>
            </div>
            <Badge tone="emerald">
              <CheckCircle2 className="h-3 w-3" />
              {completedCount}
            </Badge>
          </div>

          {completedStudents.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="Belum ada yang selesai"
              description="Jadilah yang pertama menandai tugas ini selesai."
              className="mt-4"
            />
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {completedStudents.map((completion) => {
                if (!completion.profiles) return null;
                return (
                  <li
                    key={completion.user_id}
                    className="flex items-center gap-3 py-3"
                  >
                    <Avatar
                      name={completion.profiles.nama}
                      src={avatarPublicUrl(completion.profiles.foto_path)}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {completion.profiles.nama}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {completion.profiles.nim} ·{" "}
                        {formatDate(completion.completed_at)}
                      </p>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <div className="text-center">
          <Link
            href="/akademik"
            className={buttonStyles({ variant: "ghost", size: "sm" })}
          >
            Kembali ke daftar tugas
          </Link>
        </div>
      </div>
    </div>
  );
}
