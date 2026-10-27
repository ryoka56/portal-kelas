import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Paperclip,
  Pin,
  UserRound,
} from "lucide-react";

import { Badge, Card, buttonStyles } from "@/components/ui";
import { getAnnouncementBySlug } from "@/lib/data";
import { categoryLabels, categoryTone } from "@/lib/labels";
import { formatDate, formatDateTime } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const announcement = await getAnnouncementBySlug(slug);
  return {
    title: announcement?.judul ?? "Pengumuman",
  };
}

export default async function AnnouncementDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const announcement = await getAnnouncementBySlug(slug);

  if (!announcement) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/pengumuman"
        className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Kembali ke pengumuman
      </Link>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white p-6 sm:p-8">
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
          </div>

          <h1 className="mt-4 text-balance text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl">
            {announcement.judul}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(announcement.created_at)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <UserRound className="h-3.5 w-3.5" />
              {announcement.profiles?.nama ?? "Admin Kelas"}
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="content-text">{announcement.konten}</div>

          {announcement.lampiran_path ? (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Lampiran
              </p>
              {announcement.attachmentUrl ? (
                <a
                  href={announcement.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonStyles({
                    variant: "outline",
                    size: "sm",
                    className: "mt-2",
                  })}
                >
                  <Paperclip className="h-3.5 w-3.5" />
                  Unduh lampiran
                </a>
              ) : (
                <p className="mt-2 text-xs text-slate-500">
                  Lampiran tidak tersedia. Hubungi admin kelas.
                </p>
              )}
            </div>
          ) : null}

          <div className="mt-8 border-t border-slate-100 pt-4 text-[11px] text-slate-400">
            Diperbarui {formatDateTime(announcement.created_at)}.
          </div>
        </div>
      </Card>
    </div>
  );
}
