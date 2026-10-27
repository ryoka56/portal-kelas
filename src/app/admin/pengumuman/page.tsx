import type { Metadata } from "next";
import Link from "next/link";
import { Megaphone, Pencil, Pin, Plus, Search, Trash2 } from "lucide-react";

import { ConfirmSubmit } from "@/components/confirm-submit";
import {
  Alert,
  Badge,
  EmptyState,
  PageHeader,
  Pagination,
  buttonStyles,
} from "@/components/ui";
import {
  deleteAnnouncementAction,
  togglePinAction,
} from "@/lib/actions/admin-announcements";
import { listAdminAnnouncements } from "@/lib/data";
import { categoryLabels, categoryTone } from "@/lib/labels";
import { formatDateShort } from "@/lib/format";
import { parsePage } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Manajemen Pengumuman",
};

export default async function AdminAnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    page?: string | string[];
    ok?: string | string[];
    error?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const q = (Array.isArray(params.q) ? params.q[0] : params.q) ?? "";
  const page = parsePage(params.page);
  const ok = Array.isArray(params.ok) ? params.ok[0] : params.ok;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;
  const result = await listAdminAnnouncements({ q, page });

  return (
    <div>
      <PageHeader
        eyebrow="Pengumuman"
        title="Manajemen pengumuman"
        description="Buat, ubah, sematkan, dan hapus informasi resmi kelas."
        actions={
          <Link
            href="/admin/pengumuman/baru"
            className={buttonStyles({ variant: "primary" })}
          >
            <Plus className="h-4 w-4" />
            Pengumuman Baru
          </Link>
        }
      />

      {ok ? <Alert variant="success" className="mb-4">{ok}</Alert> : null}
      {error ? <Alert variant="error" className="mb-4">{error}</Alert> : null}

      <form action="/admin/pengumuman" className="mb-5 flex max-w-md gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Cari judul..."
            className="field pl-10"
          />
        </div>
        <button type="submit" className={buttonStyles({ variant: "secondary" })}>
          Cari
        </button>
      </form>

      {result.items.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="Belum ada pengumuman"
          description="Publikasikan pengumuman pertama untuk kelas ini."
          action={
            <Link
              href="/admin/pengumuman/baru"
              className={buttonStyles({ variant: "primary", size: "sm" })}
            >
              <Plus className="h-3.5 w-3.5" />
              Buat pengumuman
            </Link>
          }
        />
      ) : (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Judul</th>
                  <th>Kategori</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((announcement) => (
                  <tr key={announcement.id}>
                    <td className="max-w-[320px]">
                      <p className="truncate font-semibold text-slate-900">
                        {announcement.judul}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        /{announcement.slug}
                      </p>
                    </td>
                    <td>
                      <Badge tone={categoryTone[announcement.kategori]}>
                        {categoryLabels[announcement.kategori]}
                      </Badge>
                    </td>
                    <td>
                      {announcement.is_pinned ? (
                        <Badge tone="amber">
                          <Pin className="h-3 w-3" />
                          Disematkan
                        </Badge>
                      ) : (
                        <Badge tone="slate">Biasa</Badge>
                      )}
                    </td>
                    <td className="text-xs text-slate-500">
                      {formatDateShort(announcement.created_at)}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1.5">
                        <form action={togglePinAction}>
                          <input
                            type="hidden"
                            name="id"
                            value={announcement.id}
                          />
                          <button
                            type="submit"
                            className={buttonStyles({
                              variant: "ghost",
                              size: "sm",
                            })}
                            title={
                              announcement.is_pinned
                                ? "Lepas semat"
                                : "Sematkan"
                            }
                          >
                            <Pin className="h-3.5 w-3.5" />
                          </button>
                        </form>
                        <Link
                          href={`/admin/pengumuman/${announcement.id}`}
                          className={buttonStyles({
                            variant: "outline",
                            size: "sm",
                          })}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                        <form action={deleteAnnouncementAction}>
                          <input
                            type="hidden"
                            name="id"
                            value={announcement.id}
                          />
                          <ConfirmSubmit
                            message={`Hapus pengumuman “${announcement.judul}”?`}
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

          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            basePath="/admin/pengumuman"
            params={{ q }}
          />
        </>
      )}
    </div>
  );
}
