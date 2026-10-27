"use server";

import { redirect } from "next/navigation";

import {
  createSession,
  destroySession,
  getCurrentUser,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { ActionState } from "@/lib/types";
import { getString, passwordSchema } from "@/lib/validation";
import { sanitizeNextPath } from "@/lib/utils";

export async function loginAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const nim = getString(formData, "nim").trim();
  const password = getString(formData, "password");
  const nextPath = sanitizeNextPath(getString(formData, "next"));

  if (!nim || !password) {
    return { error: "NIM dan password wajib diisi." };
  }

  const supabase = getSupabaseAdmin();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id,nim,nama,role,status,password_hash,is_first_login")
    .ilike("nim", nim.replace(/[%_]/g, ""))
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error("Login query error:", error.message);
    return { error: "Terjadi kesalahan pada server. Coba lagi." };
  }

  if (!profile) {
    return { error: "NIM atau password salah." };
  }

  const passwordValid = await verifyPassword(password, profile.password_hash);
  if (!passwordValid) {
    return { error: "NIM atau password salah." };
  }

  if (profile.status !== "aktif") {
    return {
      error:
        "Akun ini tidak aktif. Hubungi admin kelas untuk mengaktifkan kembali.",
    };
  }

  try {
    await createSession({
      id: profile.id,
      nim: profile.nim,
      nama: profile.nama,
      role: profile.role,
      is_first_login: profile.is_first_login,
    });
  } catch (sessionError) {
    console.error("Gagal membuat sesi:", sessionError);
    return { error: "Konfigurasi server belum lengkap. Hubungi admin." };
  }

  if (profile.is_first_login) {
    redirect("/ganti-password");
  }

  if (nextPath) {
    redirect(nextPath);
  }

  redirect(profile.role === "admin" ? "/admin" : "/dashboard");
}

export async function changePasswordAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const currentPassword = getString(formData, "current_password");
  const newPassword = getString(formData, "new_password");
  const confirmPassword = getString(formData, "confirm_password");

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = passwordSchema.safeParse(newPassword);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Password tidak valid." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "Konfirmasi password tidak sama." };
  }

  const supabase = getSupabaseAdmin();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id,password_hash")
    .eq("id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !profile) {
    console.error("Gagal memuat profil untuk ganti password:", error?.message);
    return { error: "Profil tidak ditemukan." };
  }

  const validCurrent = await verifyPassword(
    currentPassword,
    profile.password_hash,
  );
  if (!validCurrent) {
    return { error: "Password saat ini salah." };
  }

  const passwordHash = await hashPassword(newPassword);
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      password_hash: passwordHash,
      is_first_login: false,
    })
    .eq("id", user.id);

  if (updateError) {
    console.error("Gagal mengubah password:", updateError.message);
    return { error: "Gagal menyimpan password baru. Coba lagi." };
  }

  await createSession({
    id: user.id,
    nim: user.nim,
    nama: user.nama,
    role: user.role,
    is_first_login: false,
  });

  redirect(user.role === "admin" ? "/admin?ok=Password berhasil diubah." : "/dashboard?ok=Password berhasil diubah.");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
