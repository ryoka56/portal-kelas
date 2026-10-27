import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Pencil, Plus, Trash2, X } from "lucide-react";

import { ConfirmSubmit } from "@/components/confirm-submit";
import { ScheduleForm } from "@/components/admin/schedule-form";
import {
  Alert,
  Badge,
  Card,
  EmptyState,
  PageHeader,
  buttonStyles,
} from "@/components/ui";
import {
  createScheduleAction,
  deleteScheduleAction,
  updateScheduleAction,
} from "@/lib/actions/admin-schedules";
import { getSchedule, listSchedules } from "@/lib/data";
import {
  scheduleTypeLabels,
  scheduleTypeTone,
} from "@/lib/labels";
import { dayName, formatTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "Manajemen Jadwal",
};

export default async function AdminSchedulesPage({
  searchParams,
}: {
  searchParams: Promise<{
    edit?: string | string[];
    ok?: string | string[];
    error?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const editId = Array.isArray(params.edit) ? params.edit[0] : params.edit;
  const ok = Array.isArray(params.ok) ? params.ok[0] : params.ok;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  const [schedules, editing] = await Promise.all([
    listSchedules(),
    editId ? getSchedule(editId) : Promise.resolve(null),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow="Akademik"
        title="Manajemen jadwal"
        description="Atur jadwal kuliah, praktikum, dan kegiatan kelas."
        actions={
          editing ? (
            <Link
              href="/admin/jadwal"
              className={buttonStyles({ variant: "outline" })}
            >
              <X className="h-4 w-4" />
              Batal Edit
            </Link>
          ) : (
            <Link
              href="/admin/jadwal"
              className={buttonStyles({ variant: "primary" })}
            >
              <Plus className="h-4 w-4" />
              Form Baru
            </Link>
          )
        }
      />

      {ok ? <Alert variant="success" className="mb-4">{ok}</Alert> : null}
      {error ? <Alert variant="error" className="mb-4">{error}</Alert> : null}

      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="h-fit p-5">
          <h2 className="text-sm font-bold text-slate-900">
            {editing ? "Edit jadwal" : "Tambah jadwal"}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {editing
              ? `${editing.nama_matkul} · ${dayName(editing.hari)}`
              : "Jadwal akan langsung tampil di halaman akademik."}
          </p>
          <div className="mt-4">
            <ScheduleForm
              key={editing?.id ?? "new"}
              action={editing ? updateScheduleAction : createScheduleAction}
              mode={editing ? "edit" : "create"}
              defaults={
                editing
                  ? {
                      id: editing.id,
                      nama_matkul: editing.nama_matkul,
                      dosen: editing.dosen,
                      hari: editing.hari,
                      jam_mulai: editing.jam_mulai,
                      jam_selesai: editing.jam_selesai,
                      ruangan: editing.ruangan,
                      jenis: editing.jenis,
                      catatan: editing.catatan,
                    }
                  : undefined
              }
            />
          </div>
        </Card>

        <div>
          {schedules.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="Belum ada jadwal"
              description="Tambahkan jadwal pertama lewat form di samping."
            />
          ) : (
            <div className="table-wrap">
              <table className="data-table min-w-[640px]">
                <thead>
                  <tr>
                    <th>Hari & Jam</th>
                    <th>Mata Kuliah</th>
                    <th>Jenis</th>
                    <th>Ruangan</th>
                    <th className="text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((schedule) => (
                    <tr key={schedule.id}>
                      <td>
                        <p className="font-semibold text-slate-900">
                          {dayName(schedule.hari)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatTime(schedule.jam_mulai)}–
                          {formatTime(schedule.jam_selesai)}
                        </p>
                      </td>
                      <td>
                        <p className="font-medium text-slate-800">
                          {schedule.nama_matkul}
                        </p>
                        {schedule.dosen ? (
                          <p className="text-xs text-slate-500">
                            {schedule.dosen}
                          </p>
                        ) : null}
                      </td>
                      <td>
                        <Badge tone={scheduleTypeTone[schedule.jenis]}>
                          {scheduleTypeLabels[schedule.jenis]}
                        </Badge>
                      </td>
                      <td className="text-xs text-slate-500">
                        {schedule.ruangan ?? "-"}
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/jadwal?edit=${schedule.id}`}
                            className={buttonStyles({
                              variant: "outline",
                              size: "sm",
                            })}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                          <form action={deleteScheduleAction}>
                            <input type="hidden" name="id" value={schedule.id} />
                            <ConfirmSubmit
                              message={`Hapus jadwal ${schedule.nama_matkul}?`}
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
