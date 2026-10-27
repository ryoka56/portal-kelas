import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { TaskForm } from "@/components/admin/task-form";
import { Card, PageHeader } from "@/components/ui";
import { updateTaskAction } from "@/lib/actions/admin-tasks";
import { getTaskById } from "@/lib/data";
import { formatDateTimeLocal } from "@/lib/format";

export const metadata: Metadata = {
  title: "Edit Tugas",
};

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const task = await getTaskById(id);
  if (!task) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/admin/tugas/${task.id}`}
        className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Kembali ke detail tugas
      </Link>

      <PageHeader
        eyebrow="Akademik"
        title="Edit tugas"
        description="Perubahan langsung terlihat oleh mahasiswa."
      />

      <Card className="p-5 sm:p-6">
        <TaskForm
          action={updateTaskAction}
          mode="edit"
          defaults={{
            id: task.id,
            matakuliah: task.matakuliah,
            judul: task.judul,
            deskripsi: task.deskripsi,
            deadlineLocal: formatDateTimeLocal(task.deadline),
          }}
        />
      </Card>
    </div>
  );
}
