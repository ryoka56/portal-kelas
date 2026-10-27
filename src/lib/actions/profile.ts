"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import { getSupabaseAdmin, STORAGE_BUCKETS } from "@/lib/supabase";
import type { ActionState } from "@/lib/types";
import {
  emailSchema,
  getFile,
  getString,
  phoneSchema,
} from "@/lib/validation";
import { removeFile, uploadFile, validateImage } from "@/lib/upload";

export async function updateProfileAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Sesi berakhir. Silakan login lagi." };
  if (user.role !== "mahasiswa") {
    return { error: "Halaman profil hanya untuk mahasiswa." };
  }

  const emailParsed = emailSchema.safeParse(getString(formData, "email"));
  if (!emailParsed.success) {
    return { error: emailParsed.error.issues[0]?.message ?? "Email tidak valid." };
  }

  const phoneParsed = phoneSchema.safeParse(getString(formData, "no_hp"));
  if (!phoneParsed.success) {
    return {
      error: phoneParsed.error.issues[0]?.message ?? "Nomor HP tidak valid.",
    };
  }

  const supabase = getSupabaseAdmin();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("foto_path")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return { error: "Profil tidak ditemukan." };
  }

  const file = getFile(formData, "foto");
  const removeFoto = formData.get("remove_foto") === "on";
  let nextPhotoPath: string | null | undefined;

  if (file) {
    const validationError = validateImage(file);
    if (validationError) return { error: validationError };

    const uploaded = await uploadFile({
      bucket: STORAGE_BUCKETS.avatars,
      folder: user.id,
      file,
    });

    if ("error" in uploaded) return { error: uploaded.error };
    nextPhotoPath = uploaded.path;
  } else if (removeFoto) {
    nextPhotoPath = null;
  }

  const payload: Record<string, unknown> = {
    email: emailParsed.data,
    no_hp: phoneParsed.data,
    is_phone_visible: formData.get("is_phone_visible") === "on",
    is_email_visible: formData.get("is_email_visible") === "on",
  };

  if (nextPhotoPath !== undefined) {
    payload.foto_path = nextPhotoPath;
  }

  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", user.id);

  if (error) {
    if (nextPhotoPath) {
      await removeFile(STORAGE_BUCKETS.avatars, nextPhotoPath);
    }

    if (error.code === "23505") {
      return { error: "Email tersebut sudah dipakai mahasiswa lain." };
    }

    console.error("Gagal menyimpan profil:", error.message);
    return { error: "Gagal menyimpan profil. Coba lagi." };
  }

  if (
    nextPhotoPath !== undefined &&
    profile.foto_path &&
    profile.foto_path !== nextPhotoPath
  ) {
    await removeFile(STORAGE_BUCKETS.avatars, profile.foto_path);
  }

  revalidatePath("/profil");
  revalidatePath("/direktori");
  revalidatePath("/dashboard");

  return { success: "Profil berhasil disimpan." };
}
