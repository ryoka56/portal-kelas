import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, GraduationCap, ShieldAlert } from "lucide-react";

import { ChangePasswordForm } from "@/components/change-password-form";
import { Alert } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Ganti Password",
};

export default async function ChangePasswordPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          href={user.role === "admin" ? "/admin" : "/dashboard"}
          className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali ke {user.role === "admin" ? "panel admin" : "beranda"}
        </Link>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/5 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-600 text-white shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold text-slate-900">Portal Kelas</p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                Keamanan akun
              </p>
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {user.is_first_login ? "Ganti password dulu, yuk" : "Ganti password"}
          </h1>
          <p className="mt-1.5 text-sm leading-6 text-slate-500">
            {user.is_first_login
              ? "Akunmu dibuat oleh admin. Demi keamanan, ganti password awal sebelum melanjutkan."
              : "Masukkan password saat ini, lalu tentukan password baru."}
          </p>

          {user.is_first_login ? (
            <Alert variant="warning" className="mt-5">
              <span className="flex items-start gap-2">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                Kamu belum bisa membuka halaman lain sampai password diganti.
              </span>
            </Alert>
          ) : null}

          <div className="mt-6">
            <ChangePasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
}
