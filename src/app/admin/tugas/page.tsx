import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList, Pencil, Plus, Trash2 } from "lucide-react";

import { ConfirmSubmit } from "@/components/confirm-submit";
import {
  Alert,
  Badge,
  EmptyState,
  PageHeader,
  buttonStyles,
} from "@/components/ui";
import { deleteTaskAction } from "@/lib/actions/admin-tasks";
import { listAdminTasks } from "@/lib/data";
import { formatDateTime, isOverdue } from "@/lib/format";

export const metadata: Metadata = {
  title: "Manajemen Tugas",
};

export default async function AdminTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string | string[]; error?: string | string[] }>;
}) {
  const params = await searchParams;
  const ok = Array.isArray(params.ok) ? params.ok[0] : params.ok;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;
  const { tasks, totalStudents } = await listAdminTasks();

  return (
    <div>
      <PageHeader
        eyebrow="Akademik"
        title="Manajemen tugas"
        description="Buat tugas global, pantau siapa yang sudah selesai, dan tutup tugas yang sudah berakhir."
        actions={
          <Link
            href="/admin/tugas/baru"
            className={buttonStyles({ variant: "primary" })}
          >
            <Plus className="h-4 w-4" />
            Tugas Baru
          </Link>
        }
      />

      {ok ? <Alert variant="success" className="mb-4">{ok}</Alert> : null}
      {error ? <Alert variant="error" className="mb-4">{error}</Alert> : null}

      {tasks.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Belum ada tugas"
          description="Buat tugas pertama untuk kelas ini."
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
        <div className="table-wrap">
          <table className="data-table min-w-[820px]">
            <thead>
              <tr>
                <th>Tugas</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Progress</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const completed = task.task_completions.length;
                const percent =
                  totalStudents > 0
                    ? Math.min(100, (completed / totalStudents) * 100)
                    : 0;

                return (
                  <tr key={task.id}>
                    <td className="max-w-[300px]">
                      <Link
                        href={`/admin/tugas/${task.id}`}
                        className="font-semibold text-slate-900 hover:text-indigo-700"
                      >
                        {task.judul}
                      </Link>
                      <p className="text-xs text-slate-500">{task.matakuliah}</p>
                    </td>
                    <td>
                      <p className="text-xs text-slate-700">
                        {formatDateTime(task.deadline)}
                      </p>
                      {task.status === "aktif" && isOverdue(task.deadline) ? (
                        <Badge tone="rose">Terlambat</Badge>
                      ) : null}
                    </td>
                    <td>
                      {task.status === "aktif" ? (
                        <Badge tone="emerald">Aktif</Badge>
                      ) : (
                        <Badge tone="slate">Ditutup</Badge>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {completed}/{totalStudents}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/tugas/${task.id}/edit`}
                          className={buttonStyles({
                            variant: "outline",
                            size: "sm",
                          })}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                        <form action={deleteTaskAction}>
                          <input type="hidden" name="id" value={task.id} />
                          <ConfirmSubmit
                            message={`Hapus tugas “${task.judul}” beserta status selesai mahasiswa?`}
                            variant="ghost"
                            size="sm"
                            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </ConfirmSubmit>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-[11px] text-slate-400">
        Progress dihitung dari {totalStudents} mahasiswa aktif. Tugas yang
        ditutup tetap menyimpan riwayat penyelesaian.
      </p>
    </div>
  );
}
