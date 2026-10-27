import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  MessageCircle,
  PencilLine,
  Phone,
  ShieldCheck,
} from "lucide-react";

import {
  Avatar,
  Badge,
  Card,
  buttonStyles,
} from "@/components/ui";
import { getStudentProfile } from "@/lib/data";
import { avatarPublicUrl } from "@/lib/supabase";
import { normalizePhoneForWa } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const student = await getStudentProfile(id);
  return { title: student?.nama ?? "Profil Mahasiswa" };
}

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = await getStudentProfile(id);

  if (!student) notFound();

  const photo = avatarPublicUrl(student.foto_path);
  const correctionSubject = `Koreksi data ${student.nama}`;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/direktori"
        className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Kembali ke direktori
      </Link>

      <Card className="overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600" />
        <div className="px-5 pb-6 sm:px-8">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <Avatar
                name={student.nama}
                src={photo}
                size="xl"
                className="ring-4 ring-white shadow-lg"
              />
              <div className="pb-1">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  {student.nama}
                </h1>
                <p className="text-sm text-slate-500">{student.nim}</p>
              </div>
            </div>
            <Badge tone="emerald">Aktif</Badge>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Program Studi
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {student.program_studi ?? "Belum diisi"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Status
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                Mahasiswa aktif
              </p>
            </div>
          </div>

          <div className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between gap-3 px-4 py-3.5">
              <span className="inline-flex items-center gap-2 text-sm text-slate-600">
                <Mail className="h-4 w-4 text-slate-400" />
                Email
              </span>
              {student.is_email_visible && student.email ? (
                <a
                  href={`mailto:${student.email}`}
                  className="text-sm font-semibold text-indigo-600 hover:underline"
                >
                  {student.email}
                </a>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Disembunyikan
                </span>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 px-4 py-3.5">
              <span className="inline-flex items-center gap-2 text-sm text-slate-600">
                <Phone className="h-4 w-4 text-slate-400" />
                Nomor HP
              </span>
              {student.is_phone_visible && student.no_hp ? (
                <a
                  href={`https://wa.me/${normalizePhoneForWa(student.no_hp)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:underline"
                >
                  <MessageCircle className="h-4 w-4" />
                  {student.no_hp}
                </a>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Disembunyikan
                </span>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href={`/bantuan?kategori=koreksi_data&subjek=${encodeURIComponent(correctionSubject)}`}
              className={buttonStyles({ variant: "outline", size: "sm" })}
            >
              <PencilLine className="h-3.5 w-3.5" />
              Ajukan koreksi data
            </Link>
            <Link
              href="/profil"
              className={buttonStyles({ variant: "ghost", size: "sm" })}
            >
              Profil saya
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
