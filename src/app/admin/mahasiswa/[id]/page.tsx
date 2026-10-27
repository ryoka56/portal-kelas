import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  KeyRound,
  ShieldAlert,
  Trash2,
} from "lucide-react";

import { StudentForm } from "@/components/admin/student-form";
import {
  Alert,
  Badge,
  Card,
  PageHeader,
} from "@/components/ui";
import { ConfirmSubmit } from "@/components/confirm-submit";
import {
  deleteStudentAction,
  resetStudentPasswordAction,
  updateStudentAction,
} from "@/lib/actions/admin-students";
import { getAdminStudent } from "@/lib/data";
import { studentStatusLabels, studentStatusTone } from "@/lib/labels";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "Kelola Mahasiswa",
};

export default async function EditStudentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string | string[]; error?: string | string[] }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const student = await getAdminStudent(id);
  if (!student) notFound();

  const ok = Array.isArray(query.ok) ? query.ok[0] : query.ok;
  const error = Array.isArray(query.error) ? query.error[0] : query.error;

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/mahasiswa"
        className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Kembali ke daftar mahasiswa
      </Link>

      <PageHeader
        eyebrow="Mahasiswa"
        title={student.nama}
        description={`${student.nim} · ${student.program_studi ?? "Program studi belum diisi"}`}
        actions={
          <Badge tone={studentStatusTone[student.status]}>
            {studentStatusLabels[student.status]}
          </Badge>
        }
      />

      {ok ? <Alert variant="success" className="mb-4">{ok}</Alert> : null}
      {error ? <Alert variant="error" className="mb-4">{error}</Alert> : null}

      <div className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
        <Card className="p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-bold text-slate-900">
            Data akademik
          </h2>
          <StudentForm
            action={updateStudentAction}
            mode="edit"
            defaults={{
              id: student.id,
              nim: student.nim,
              nama: student.nama,
              program_studi: student.program_studi,
              status: student.status,
            }}
          />
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-900">Informasi akun</h2>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Email</dt>
                <dd className="text-right font-medium text-slate-800">
                  {student.email ?? "-"}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Nomor HP</dt>
                <dd className="text-right font-medium text-slate-800">
                  {student.no_hp ?? "-"}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Terdaftar</dt>
                <dd className="text-right font-medium text-slate-800">
                  {formatDateTime(student.created_at)}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Password</dt>
                <dd className="text-right">
                  {student.is_first_login ? (
                    <Badge tone="amber">Wajib diganti</Badge>
                  ) : (
                    <Badge tone="emerald">Sudah diganti</Badge>
                  )}
                </dd>
              </div>
            </dl>

            <div className="mt-4 border-t border-slate-100 pt-4">
              <form action={resetStudentPasswordAction}>
                <input type="hidden" name="id" value={student.id} />
                <ConfirmSubmit
                  message="Reset password mahasiswa ini ke mahasiswa123? Mereka wajib menggantinya saat login."
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  Reset password
                </ConfirmSubmit>
              </form>
              <p className="mt-2 text-[11px] leading-5 text-slate-500">
                Password baru: <span className="font-semibold">mahasiswa123</span>.
                Mahasiswa harus menggantinya saat login.
              </p>
            </div>
          </Card>

          <Card className="border-rose-200 p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-rose-700">
              <ShieldAlert className="h-4 w-4" />
              Hapus mahasiswa
            </h2>
            <p className="mt-1 text-[11px] leading-5 text-slate-500">
              Data akan dihapus dari daftar aktif. Riwayat tiket dan tugas tetap
              tersimpan.
            </p>
            <form action={deleteStudentAction} className="mt-3">
              <input type="hidden" name="id" value={student.id} />
              <ConfirmSubmit
                message={`Hapus ${student.nama} dari daftar mahasiswa?`}
                variant="danger"
                size="sm"
                className="w-full"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Hapus mahasiswa
              </ConfirmSubmit>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
