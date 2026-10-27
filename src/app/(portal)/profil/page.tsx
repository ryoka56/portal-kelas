import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  GraduationCap,
  KeyRound,
  PencilLine,
  ShieldCheck,
} from "lucide-react";

import { ProfileForm } from "@/components/profile-form";
import {
  Avatar,
  Badge,
  Card,
  PageHeader,
  buttonStyles,
} from "@/components/ui";
import { requireStudent } from "@/lib/auth";
import { getProfileForEdit } from "@/lib/data";
import { avatarPublicUrl } from "@/lib/supabase";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Profil Saya",
};

export default async function ProfilePage() {
  const user = await requireStudent();
  const profile = await getProfileForEdit(user.id);

  if (!profile) redirect("/login");

  const photo = avatarPublicUrl(profile.foto_path);

  return (
    <div>
      <PageHeader
        eyebrow="Profil"
        title="Profil saya"
        description="Kelola kontak dan privasi. Data akademik seperti NIM, nama, dan program studi hanya bisa diubah admin."
      />

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600" />
            <div className="px-5 pb-5">
              <div className="-mt-10">
                <Avatar
                  name={profile.nama}
                  src={photo}
                  size="xl"
                  className="ring-4 ring-white shadow-lg"
                />
              </div>
              <h2 className="mt-3 text-lg font-bold text-slate-900">
                {profile.nama}
              </h2>
              <p className="text-sm text-slate-500">{profile.nim}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone="emerald">Aktif</Badge>
                <Badge tone="indigo">Mahasiswa</Badge>
              </div>

              <dl className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-xs">
                <div className="flex items-start justify-between gap-3">
                  <dt className="inline-flex items-center gap-1.5 text-slate-500">
                    <GraduationCap className="h-3.5 w-3.5" />
                    Program studi
                  </dt>
                  <dd className="text-right font-semibold text-slate-800">
                    {profile.program_studi ?? "-"}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="inline-flex items-center gap-1.5 text-slate-500">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Terdaftar
                  </dt>
                  <dd className="text-right font-semibold text-slate-800">
                    {formatDate(profile.created_at)}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 rounded-xl bg-slate-50 p-3 text-[11px] leading-5 text-slate-500">
                <span className="flex items-start gap-1.5">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  NIM, nama, dan program studi dikunci. Jika ada yang salah,
                  ajukan koreksi lewat tiket.
                </span>
              </div>

              <div className="mt-4 grid gap-2">
                <Link
                  href={`/bantuan?kategori=koreksi_data&subjek=${encodeURIComponent(`Koreksi data ${profile.nama}`)}`}
                  className={buttonStyles({ variant: "outline", size: "sm" })}
                >
                  <PencilLine className="h-3.5 w-3.5" />
                  Ajukan koreksi data
                </Link>
                <Link
                  href="/ganti-password"
                  className={buttonStyles({ variant: "ghost", size: "sm" })}
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  Ganti password
                </Link>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900">
              Data kontak & privasi
            </h2>
            <p className="text-xs text-slate-500">
              Data ini yang tampil di direktori jika kamu mengizinkannya.
            </p>
          </div>

          <ProfileForm
            email={profile.email}
            noHp={profile.no_hp}
            isEmailVisible={profile.is_email_visible}
            isPhoneVisible={profile.is_phone_visible}
            fotoUrl={photo}
            nama={profile.nama}
          />
        </Card>
      </div>
    </div>
  );
}
