import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Search, Users } from "lucide-react";

import {
  Alert,
  Badge,
  EmptyState,
  PageHeader,
  Pagination,
  buttonStyles,
} from "@/components/ui";
import { listAdminStudents } from "@/lib/data";
import {
  studentStatusLabels,
  studentStatusTone,
} from "@/lib/labels";
import { formatDateShort } from "@/lib/format";
import { parsePage } from "@/lib/utils";
import { studentStatusSchema } from "@/lib/validation";

export const metadata: Metadata = {
  title: "Manajemen Mahasiswa",
};

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    status?: string | string[];
    page?: string | string[];
    ok?: string | string[];
    error?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const q = (Array.isArray(params.q) ? params.q[0] : params.q) ?? "";
  const rawStatus = Array.isArray(params.status)
    ? params.status[0]
    : params.status;
  const statusParsed = studentStatusSchema.safeParse(rawStatus);
  const status = statusParsed.success ? statusParsed.data : undefined;
  const page = parsePage(params.page);
  const ok = Array.isArray(params.ok) ? params.ok[0] : params.ok;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  const result = await listAdminStudents({ q, status, page });

  return (
    <div>
      <PageHeader
        eyebrow="Mahasiswa"
        title="Manajemen mahasiswa"
        description="Buat akun, ubah data akademik, atur status, dan reset password mahasiswa."
        actions={
          <Link
            href="/admin/mahasiswa/baru"
            className={buttonStyles({ variant: "primary" })}
          >
            <Plus className="h-4 w-4" />
            Tambah Mahasiswa
          </Link>
        }
      />

      {ok ? <Alert variant="success" className="mb-4">{ok}</Alert> : null}
      {error ? <Alert variant="error" className="mb-4">{error}</Alert> : null}

      <form
        action="/admin/mahasiswa"
        className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Cari nama atau NIM..."
            className="field pl-10"
          />
        </div>
        <select
          name="status"
          defaultValue={status ?? ""}
          className="field sm:w-40"
        >
          <option value="">Semua status</option>
          <option value="aktif">Aktif</option>
          <option value="cuti">Cuti</option>
          <option value="nonaktif">Nonaktif</option>
        </select>
        <button type="submit" className={buttonStyles({ variant: "secondary" })}>
          Filter
        </button>
        {q || status ? (
          <Link
            href="/admin/mahasiswa"
            className={buttonStyles({ variant: "ghost", size: "sm" })}
          >
            Reset
          </Link>
        ) : null}
      </form>

      {result.items.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Belum ada mahasiswa"
          description="Tambahkan akun mahasiswa pertama untuk kelas ini."
          action={
            <Link
              href="/admin/mahasiswa/baru"
              className={buttonStyles({ variant: "primary", size: "sm" })}
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah mahasiswa
            </Link>
          }
        />
      ) : (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mahasiswa</th>
                  <th>Program Studi</th>
                  <th>Status</th>
                  <th>Login</th>
                  <th>Terdaftar</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <p className="font-semibold text-slate-900">{student.nama}</p>
                      <p className="text-xs text-slate-500">{student.nim}</p>
                    </td>
                    <td>{student.program_studi ?? "-"}</td>
                    <td>
                      <Badge tone={studentStatusTone[student.status]}>
                        {studentStatusLabels[student.status]}
                      </Badge>
                    </td>
                    <td>
                      {student.is_first_login ? (
                        <Badge tone="amber">Belum ganti password</Badge>
                      ) : (
                        <span className="text-xs text-slate-500">Sudah</span>
                      )}
                    </td>
                    <td className="text-xs text-slate-500">
                      {formatDateShort(student.created_at)}
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/admin/mahasiswa/${student.id}`}
                        className={buttonStyles({ variant: "outline", size: "sm" })}
                      >
                        Kelola
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            basePath="/admin/mahasiswa"
            params={{ q, status }}
          />
        </>
      )}
    </div>
  );
}
