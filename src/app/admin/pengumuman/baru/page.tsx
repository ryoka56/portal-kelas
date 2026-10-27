import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AnnouncementForm } from "@/components/admin/announcement-form";
import { Card, PageHeader } from "@/components/ui";
import { createAnnouncementAction } from "@/lib/actions/admin-announcements";

export const metadata: Metadata = {
  title: "Buat Pengumuman",
};

export default function NewAnnouncementPage() {
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
        title="Buat pengumuman"
        description="Pengumuman akan langsung tampil di halaman mahasiswa setelah dipublikasikan."
      />

      <Card className="p-5 sm:p-6">
        <AnnouncementForm action={createAnnouncementAction} mode="create" />
      </Card>
    </div>
  );
}
