import type { Metadata } from "next";
import Link from "next/link";
import { Megaphone, Pin, Search } from "lucide-react";

import {
  Badge,
  Card,
  EmptyState,
  PageHeader,
  Pagination,
  buttonStyles,
} from "@/components/ui";
import { listAnnouncements } from "@/lib/data";
import { categoryLabels, categoryTone } from "@/lib/labels";
import { formatDate } from "@/lib/format";
import { categorySchema } from "@/lib/validation";
import { parsePage, truncate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pengumuman",
};

const categories = ["akademik", "tugas", "kegiatan", "umum"] as const;

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
    page?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const q = (Array.isArray(params.q) ? params.q[0] : params.q) ?? "";
  const rawCategory = Array.isArray(params.category)
    ? params.category[0]
    : params.category;
  const categoryParsed = categorySchema.safeParse(rawCategory);
  const category = categoryParsed.success ? categoryParsed.data : undefined;
  const page = parsePage(params.page);

  const result = await listAnnouncements({ q, category, page });

  return (
    <div>
      <PageHeader
        eyebrow="Papan informasi"
        title="Pengumuman kelas"
        description="Informasi resmi dari admin kelas: tugas, perubahan jadwal, kegiatan, dan pemberitahuan penting."
      />

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5">
          <Link
            href={q ? `/pengumuman?q=${encodeURIComponent(q)}` : "/pengumuman"}
            className={buttonStyles({
              size: "sm",
              variant: category ? "outline" : "primary",
            })}
          >
            Semua
          </Link>
          {categories.map((value) => (
            <Link
              key={value}
              href={`/pengumuman?category=${value}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={buttonStyles({
                size: "sm",
                variant: category === value ? "primary" : "outline",
              })}
            >
              {categoryLabels[value]}
            </Link>
          ))}
        </div>

        <form className="flex w-full gap-2 lg:w-auto" action="/pengumuman">
          {category ? (
            <input type="hidden" name="category" value={category} />
          ) : null}
          <div className="relative flex-1 lg:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Cari pengumuman..."
              className="field pl-10"
            />
          </div>
          <button
            type="submit"
            className={buttonStyles({ variant: "secondary" })}
          >
            Cari
          </button>
        </form>
      </div>

      {result.items.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="Belum ada pengumuman"
          description={
            q || category
              ? "Tidak ada pengumuman yang cocok dengan pencarian atau filter ini."
              : "Admin belum mempublikasikan pengumuman untuk kelas ini."
          }
        />
      ) : (
        <div className="space-y-3">
          {result.items.map((announcement) => (
            <Link
              key={announcement.id}
              href={`/pengumuman/${announcement.slug}`}
              className="group block"
            >
              <Card className="p-5 transition-all group-hover:border-indigo-200 group-hover:shadow-md sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={categoryTone[announcement.kategori]}>
                    {categoryLabels[announcement.kategori]}
                  </Badge>
                  {announcement.is_pinned ? (
                    <Badge tone="amber">
                      <Pin className="h-3 w-3" />
                      Disematkan
                    </Badge>
                  ) : null}
                  <span className="text-[11px] text-slate-400">
                    {formatDate(announcement.created_at)}
                  </span>
                </div>

                <h2 className="mt-3 text-lg font-bold leading-7 text-slate-900 group-hover:text-indigo-700">
                  {announcement.judul}
                </h2>
                <p className="mt-1.5 text-sm leading-6 text-slate-600">
                  {truncate(announcement.konten.replace(/\s+/g, " "), 220)}
                </p>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Oleh {announcement.profiles?.nama ?? "Admin Kelas"}
                  </span>
                  <span className="font-semibold text-indigo-600">
                    Baca detail →
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        basePath="/pengumuman"
        params={{ q, category }}
      />

      <p className="mt-4 text-center text-[11px] text-slate-400">
        Menampilkan {result.items.length} dari {result.total} pengumuman
        {q ? ` untuk “${q}”` : ""}.
      </p>
    </div>
  );
}
