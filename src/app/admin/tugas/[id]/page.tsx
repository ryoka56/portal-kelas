import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Pencil,
  Trash2,
  Unlock,
  Users,
  XCircle,
} from "lucide-react";

import { ConfirmSubmit } from "@/components/confirm-submit";
import {
  Alert,
  Avatar,
  Badge,
  Card,
  EmptyState,
  PageHeader,
  StatCard,
  buttonStyles,
} from "@/components/ui";
import {
  deleteTaskAction,
  toggleTaskStatusAction,
} from "@/lib/actions/admin-tasks";
import { getAdminTask } from "@/lib/data";
import { avatarPublicUrl } from "@/lib/supabase";
import { formatDateTime } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: `Detail Tugas ${id.slice(0, 6)}` };
}

export default async function AdminTaskDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string | string[]; error?: string | string[] }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const data = await getAdminTask(id);
  if (!data) notFound();

  const ok = Array.isArray(query.ok) ? query.ok[0] : query.ok;
  const error = Array.isArray(query.error) ? query.error[0] : query.error;

  const { task, students } = data;
  const completed = students.filter((student) => student.completed_at);
  const pending = students.filter((student) => !student.completed_at);
  const percent =
    students.length > 0 ? Math.round((completed.length / students.length) * 100) : 0;

  const sortedStudents = [...students].sort((a, b) => {
    if (a.completed_at && !b.completed_at) return -1;
    if (!a.completed_at && b.completed_at) return 1;
    return a.nama.localeCompare(b.nama, "id");
  });

  return (
    <div>
      <Link
        href="/admin/tugas"
        className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Kembali ke daftar tugas
      </Link>

      <PageHeader
        eyebrow={task.matakuliah}
        title={task.judul}
        description={`Deadline ${formatDateTime(task.deadline)}`}
        actions={
          <>
            <Link
              href={`/admin/tugas/${task.id}/edit`}
              className={buttonStyles({ variant: "outline" })}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
            <form action={toggleTaskStatusAction}>
              <input type="hidden" name="id" value={task.id} />
              <button
                type="submit"
                className={buttonStyles({ variant: "secondary" })}
              >
                {task.status === "aktif" ? (
                  <>
                    <Lock className="h-4 w-4" />
                    Tutup Tugas
                  </>
                ) : (
                  <>
                    <Unlock className="h-4 w-4" />
                    Buka Kembali
                  </>
                )}
              </button>
            </form>
          </>
        }
      />

      {ok ? <Alert variant="success" className="mb-4">{ok}</Alert> : null}
      {error ? <Alert variant="error" className="mb-4">{error}</Alert> : null}

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {task.status === "aktif" ? (
          <Badge tone="emerald">Aktif</Badge>
        ) : (
          <Badge tone="slate">Ditutup</Badge>
        )}
        <Badge tone="indigo">{completed.length} selesai</Badge>
        <Badge tone="amber">{pending.length} belum</Badge>
        <span className="text-xs text-slate-500">
          {percent}% mahasiswa aktif sudah menyelesaikan tugas ini.
        </span>
      </div>

      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Selesai"
          value={completed.length}
          icon={CheckCircle2}
          tone="emerald"
        />
        <StatCard
          label="Belum Selesai"
          value={pending.length}
          icon={XCircle}
          tone="amber"
        />
        <StatCard
          label="Total Mahasiswa"
          value={students.length}
          icon={Users}
          tone="indigo"
        />
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_1.9fr]">
        <Card className="h-fit p-5">
          <h2 className="text-sm font-bold text-slate-900">Deskripsi tugas</h2>
          <div className="content-text mt-3">
            {task.deskripsi ?? "Tidak ada deskripsi."}
          </div>

          <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs">
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Dibuat</span>
              <span className="font-medium text-slate-800">
                {formatDateTime(task.created_at)}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Deadline</span>
              <span className="font-medium text-slate-800">
                {formatDateTime(task.deadline)}
              </span>
            </div>
          </div>

          <form action={deleteTaskAction} className="mt-5 border-t border-slate-100 pt-4">
            <input type="hidden" name="id" value={task.id} />
            <ConfirmSubmit
              message="Hapus tugas ini beserta seluruh status selesai mahasiswa?"
              variant="danger"
              size="sm"
              className="w-full"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Hapus tugas
            </ConfirmSubmit>
          </form>
        </Card>

        <Card className="p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Status mahasiswa
              </h2>
              <p className="text-xs text-slate-500">
                Daftar lengkap hanya terlihat oleh admin.
              </p>
            </div>
          </div>

          {sortedStudents.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Belum ada mahasiswa aktif"
              description="Tambahkan mahasiswa terlebih dahulu."
              className="mt-4"
            />
          ) : (
            <div className="mt-4 max-h-[560px] overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-white text-[11px] uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="pb-2">Mahasiswa</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedStudents.map((student) => (
                    <tr key={student.id}>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <Avatar
                            name={student.nama}
                            src={avatarPublicUrl(student.foto_path)}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-slate-800">
                              {student.nama}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {student.nim}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5">
                        {student.completed_at ? (
                          <Badge tone="emerald">
                            <CheckCircle2 className="h-3 w-3" />
                            Selesai
                          </Badge>
                        ) : (
                          <Badge tone="slate">Belum</Badge>
                        )}
                      </td>
                      <td className="py-2.5 text-right text-[11px] text-slate-500">
                        {student.completed_at
                          ? formatDateTime(student.completed_at)
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
