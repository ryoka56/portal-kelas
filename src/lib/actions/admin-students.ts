"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentUser, hashPassword } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { ActionState } from "@/lib/types";
import {
  getString,
  nameSchema,
  nimSchema,
  passwordSchema,
  studentStatusSchema,
} from "@/lib/validation";

const programSchema = z
  .string()
  .trim()
  .min(2, "Program studi minimal 2 karakter.")
  .max(100, "Program studi maksimal 100 karakter.");

async function adminUser() {
  const user = await getCurrentUser();
  return user?.role === "admin" ? user : null;
}

function parseStudentForm(formData: FormData) {
  const nim = nimSchema.safeParse(getString(formData, "nim"));
  const nama = nameSchema.safeParse(getString(formData, "nama"));
  const program = programSchema.safeParse(getString(formData, "program_studi"));
  const status = studentStatusSchema.safeParse(getString(formData, "status"));

  if (!nim.success) return { error: nim.error.issues[0]?.message };
  if (!nama.success) return { error: nama.error.issues[0]?.message };
  if (!program.success) return { error: program.error.issues[0]?.message };
  if (!status.success) return { error: "Status mahasiswa tidak valid." };

  return {
    data: {
      nim: nim.data,
      nama: nama.data,
      program_studi: program.data,
      status: status.data,
    },
  };
}

export async function createStudentAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await adminUser();
  if (!admin) return { error: "Akses ditolak." };

  const parsed = parseStudentForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const password = passwordSchema.safeParse(getString(formData, "password"));
  if (!password.success) {
    return { error: password.error.issues[0]?.message ?? "Password tidak valid." };
  }

  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .ilike("nim", parsed.data.nim.replace(/[%_]/g, ""))
    .is("deleted_at", null)
    .maybeSingle();

  if (existing) return { error: "NIM tersebut sudah dipakai." };

  const passwordHash = await hashPassword(password.data);

  const { error } = await supabase.from("profiles").insert({
    ...parsed.data,
    role: "mahasiswa",
    password_hash: passwordHash,
    is_first_login: true,
    is_phone_visible: false,
    is_email_visible: false,
  });

  if (error) {
    console.error("Gagal menambah mahasiswa:", error.message);
    if (error.code === "23505") {
      return { error: "NIM tersebut sudah dipakai." };
    }
    return { error: "Gagal menambah mahasiswa. Coba lagi." };
  }

  revalidatePath("/admin/mahasiswa");
  revalidatePath("/direktori");
  redirect("/admin/mahasiswa?ok=Mahasiswa berhasil ditambahkan.");
}

export async function updateStudentAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await adminUser();
  if (!admin) return { error: "Akses ditolak." };

  const id = getString(formData, "id");
  if (!id) return { error: "Mahasiswa tidak valid." };

  const parsed = parseStudentForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .ilike("nim", parsed.data.nim.replace(/[%_]/g, ""))
    .neq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (existing) return { error: "NIM tersebut sudah dipakai mahasiswa lain." };

  const { error } = await supabase
    .from("profiles")
    .update(parsed.data)
    .eq("id", id)
    .eq("role", "mahasiswa")
    .is("deleted_at", null);

  if (error) {
    console.error("Gagal mengubah mahasiswa:", error.message);
    if (error.code === "23505") {
      return { error: "NIM tersebut sudah dipakai mahasiswa lain." };
    }
    return { error: "Gagal menyimpan perubahan. Coba lagi." };
  }

  revalidatePath("/admin/mahasiswa");
  revalidatePath(`/admin/mahasiswa/${id}`);
  revalidatePath("/direktori");
  revalidatePath(`/direktori/${id}`);
  redirect(`/admin/mahasiswa/${id}?ok=Data mahasiswa diperbarui.`);
}

export async function resetStudentPasswordAction(formData: FormData) {
  const admin = await adminUser();
  if (!admin) redirect("/login");

  const id = getString(formData, "id");
  if (!id) redirect("/admin/mahasiswa?error=Mahasiswa tidak valid.");

  const passwordHash = await hashPassword("mahasiswa123");
  const { error } = await getSupabaseAdmin()
    .from("profiles")
    .update({ password_hash: passwordHash, is_first_login: true })
    .eq("id", id)
    .eq("role", "mahasiswa")
    .is("deleted_at", null);

  if (error) {
    console.error("Gagal reset password:", error.message);
    redirect(`/admin/mahasiswa/${id}?error=Gagal reset password.`);
  }

  redirect(
    `/admin/mahasiswa/${id}?ok=Password direset ke mahasiswa123. Mahasiswa wajib menggantinya saat login.`,
  );
}

export async function deleteStudentAction(formData: FormData) {
  const admin = await adminUser();
  if (!admin) redirect("/login");

  const id = getString(formData, "id");
  if (!id) redirect("/admin/mahasiswa?error=Mahasiswa tidak valid.");

  const { error } = await getSupabaseAdmin()
    .from("profiles")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("role", "mahasiswa")
    .is("deleted_at", null);

  if (error) {
    console.error("Gagal menghapus mahasiswa:", error.message);
    redirect(`/admin/mahasiswa/${id}?error=Gagal menghapus mahasiswa.`);
  }

  revalidatePath("/admin/mahasiswa");
  revalidatePath("/direktori");
  redirect("/admin/mahasiswa?ok=Mahasiswa dihapus dari daftar aktif.");
}
