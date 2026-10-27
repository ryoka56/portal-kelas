import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { StudentForm } from "@/components/admin/student-form";
import { Alert, Card, PageHeader } from "@/components/ui";
import { createStudentAction } from "@/lib/actions/admin-students";

export const metadata: Metadata = {
  title: "Tambah Mahasiswa",
};

export default function NewStudentPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/mahasiswa"
        className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Kembali ke daftar mahasiswa
      </Link>

      <PageHeader
        eyebrow="Mahasiswa"
        title="Tambah mahasiswa"
        description="Akun dibuat oleh admin. Mahasiswa akan mengisi kontak dan foto sendiri setelah login."
      />

      <Alert variant="info" className="mb-4">
        Password awal yang kamu buat akan dipakai sekali. Mahasiswa wajib
        menggantinya saat login pertama.
      </Alert>

      <Card className="p-5 sm:p-6">
        <StudentForm action={createStudentAction} mode="create" />
      </Card>
    </div>
  );
}
