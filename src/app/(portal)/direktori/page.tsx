import type { Metadata } from "next";
import Link from "next/link";
import {
  Mail,
  Phone,
  Search,
  Users,
} from "lucide-react";

import {
  Avatar,
  Badge,
  Card,
  EmptyState,
  PageHeader,
  Pagination,
  buttonStyles,
} from "@/components/ui";
import { listStudents } from "@/lib/data";
import { avatarPublicUrl } from "@/lib/supabase";
import { parsePage } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Direktori Mahasiswa",
};

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; page?: string | string[] }>;
}) {
  const params = await searchParams;
  const q = (Array.isArray(params.q) ? params.q[0] : params.q) ?? "";
  const page = parsePage(params.page);
  const result = await listStudents({ q, page });

  return (
    <div>
      <PageHeader
        eyebrow="Direktori"
        title="Kenali teman sekelasmu"
        description="Cari mahasiswa berdasarkan nama atau NIM. Kontak hanya tampil jika mahasiswa mengizinkannya."
      />

      <form
        action="/direktori"
        className="mb-6 flex max-w-xl gap-2"
        role="search"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Cari nama atau NIM..."
            className="field pl-10"
          />
        </div>
        <button type="submit" className={buttonStyles({ variant: "secondary" })}>
          Cari
        </button>
      </form>

      {result.items.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Mahasiswa tidak ditemukan"
          description={
            q
              ? `Tidak ada mahasiswa aktif yang cocok dengan “${q}”.`
              : "Belum ada data mahasiswa aktif."
          }
          action={
            q ? (
              <Link href="/direktori" className={buttonStyles({ variant: "outline" })}>
                Tampilkan semua
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map((student) => (
            <Link key={student.id} href={`/direktori/${student.id}`} className="group">
              <Card className="h-full p-5 transition-all group-hover:-translate-y-0.5 group-hover:border-indigo-200 group-hover:shadow-md">
                <div className="flex items-center gap-3">
                  <Avatar
                    name={student.nama}
                    src={avatarPublicUrl(student.foto_path)}
                    size="lg"
                  />
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-bold text-slate-900 group-hover:text-indigo-700">
                      {student.nama}
                    </h2>
                    <p className="text-xs text-slate-500">{student.nim}</p>
                    <p className="mt-0.5 truncate text-[11px] text-slate-400">
                      {student.program_studi ?? "Program studi belum diisi"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Badge tone="emerald">Aktif</Badge>
                  {student.is_email_visible && student.email ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">
                      <Mail className="h-3 w-3" />
                      Email
                    </span>
                  ) : null}
                  {student.is_phone_visible && student.no_hp ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">
                      <Phone className="h-3 w-3" />
                      WhatsApp
                    </span>
                  ) : null}
                </div>

                <p className="mt-4 text-[11px] font-semibold text-indigo-600 opacity-0 transition-opacity group-hover:opacity-100">
                  Lihat profil →
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        basePath="/direktori"
        params={{ q }}
      />
    </div>
  );
}
