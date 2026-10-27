import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { TaskForm } from "@/components/admin/task-form";
import { Card, PageHeader } from "@/components/ui";
import { createTaskAction } from "@/lib/actions/admin-tasks";

export const metadata: Metadata = {
  title: "Buat Tugas",
};

export default function NewTaskPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/tugas"
        className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Kembali ke tugas
      </Link>

      <PageHeader
        eyebrow="Akademik"
        title="Buat tugas"
        description="Tugas berlaku untuk seluruh mahasiswa aktif. Mahasiswa bisa menandai sendiri jika sudah selesai."
      />

      <Card className="p-5 sm:p-6">
        <TaskForm action={createTaskAction} mode="create" />
      </Card>
    </div>
  );
}
