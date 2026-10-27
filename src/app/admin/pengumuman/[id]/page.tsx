import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { AnnouncementForm } from "@/components/admin/announcement-form";
import { PageHeader, buttonStyles } from "@/components/ui";
import { updateAnnouncementAction } from "@/lib/actions/admin-announcements";
import { getAnnouncementById } from "@/lib/data";
import { createAttachmentSignedUrl } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Edit Pengumuman",
};

export default async function EditAnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const announcement = await getAnnouncementById(id);
  if (!announcement) notFound();

  const attachmentUrl = await createAttachmentSignedUrl(
    announcement.lampiran_path,
  );

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/pengumuman"
        className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Kembali ke pengumuman
      </Link>

      <PageHeader
        eyebrow="Pengumuman"
        title="Edit pengumuman"
        description="Perubahan akan langsung terlihat oleh mahasiswa."
        actions={
          <Link
            href={`/pengumuman/${announcement.slug}`}
            target="_blank"
            className={buttonStyles({ variant: "outline", size: "sm" })}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Lihat
          </Link>
        }
      />

      <div className="card p-5 sm:p-6">
        <AnnouncementForm
          action={updateAnnouncementAction}
          mode="edit"
          defaults={{
            id: announcement.id,
            judul: announcement.judul,
            slug: announcement.slug,
            konten: announcement.konten,
            kategori: announcement.kategori,
            is_pinned: announcement.is_pinned,
            lampiran_path: announcement.lampiran_path,
            attachmentUrl,
          }}
        />
      </div>
    </div>
  );
}
