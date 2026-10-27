"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { getSupabaseAdmin, STORAGE_BUCKETS } from "@/lib/supabase";
import type { ActionState } from "@/lib/types";
import { removeFile, uploadFile, validateAttachment } from "@/lib/upload";
import { getFile, getString, categorySchema } from "@/lib/validation";
import { slugify } from "@/lib/utils";

const titleSchema = z
  .string()
  .trim()
  .min(5, "Judul minimal 5 karakter.")
  .max(160, "Judul maksimal 160 karakter.");

const contentSchema = z
  .string()
  .trim()
  .min(20, "Isi pengumuman minimal 20 karakter.")
  .max(20000, "Isi pengumuman terlalu panjang.");

async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === "admin" ? user : null;
}

async function uniqueSlug(base: string) {
  const supabase = getSupabaseAdmin();
  for (let index = 1; index <= 30; index += 1) {
    const candidate = index === 1 ? base : `${base}-${index}`;
    const { data } = await supabase
      .from("announcements")
      .select("id")
      .eq("slug", candidate)
      .is("deleted_at", null)
      .maybeSingle();
    if (!data) return candidate;
  }
  return `${base}-${Date.now()}`;
}

async function pinnedCount() {
  const { count } = await getSupabaseAdmin()
    .from("announcements")
    .select("*", { count: "exact", head: true })
    .eq("is_pinned", true)
    .is("deleted_at", null);
  return count ?? 0;
}

function parseForm(formData: FormData) {
  const judul = titleSchema.safeParse(getString(formData, "judul"));
  const konten = contentSchema.safeParse(getString(formData, "konten"));
  const kategori = categorySchema.safeParse(getString(formData, "kategori"));

  if (!judul.success) return { error: judul.error.issues[0]?.message };
  if (!konten.success) return { error: konten.error.issues[0]?.message };
  if (!kategori.success) return { error: "Kategori tidak valid." };

  return {
    data: {
      judul: judul.data,
      konten: konten.data,
      kategori: kategori.data,
      is_pinned: formData.get("is_pinned") === "on",
    },
  };
}

export async function createAnnouncementAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await isAdmin();
  if (!admin) return { error: "Akses ditolak." };

  const parsed = parseForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  if (parsed.data.is_pinned && (await pinnedCount()) >= 3) {
    return { error: "Maksimal 3 pengumuman yang bisa disematkan." };
  }

  const file = getFile(formData, "lampiran");
  let lampiranPath: string | null = null;

  if (file) {
    const validationError = validateAttachment(file);
    if (validationError) return { error: validationError };

    const uploaded = await uploadFile({
      bucket: STORAGE_BUCKETS.attachments,
      folder: "announcements",
      file,
    });
    if ("error" in uploaded) return { error: uploaded.error };
    lampiranPath = uploaded.path;
  }

  const supabase = getSupabaseAdmin();
  const slug = await uniqueSlug(slugify(parsed.data.judul));

  const { error } = await supabase.from("announcements").insert({
    ...parsed.data,
    slug,
    lampiran_path: lampiranPath,
    created_by: admin.id,
  });

  if (error) {
    if (lampiranPath) {
      await removeFile(STORAGE_BUCKETS.attachments, lampiranPath);
    }
    console.error("Gagal membuat pengumuman:", error.message);
    return { error: "Gagal membuat pengumuman. Coba lagi." };
  }

  revalidatePath("/pengumuman");
  revalidatePath("/dashboard");
  revalidatePath("/admin/pengumuman");
  redirect("/admin/pengumuman?ok=Pengumuman berhasil dibuat.");
}

export async function updateAnnouncementAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await isAdmin();
  if (!admin) return { error: "Akses ditolak." };

  const id = getString(formData, "id");
  if (!id) return { error: "Pengumuman tidak valid." };

  const parsed = parseForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = getSupabaseAdmin();
  const { data: existing, error: existingError } = await supabase
    .from("announcements")
    .select("id,is_pinned,lampiran_path")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (existingError || !existing) {
    return { error: "Pengumuman tidak ditemukan." };
  }

  if (
    parsed.data.is_pinned &&
    !existing.is_pinned &&
    (await pinnedCount()) >= 3
  ) {
    return { error: "Maksimal 3 pengumuman yang bisa disematkan." };
  }

  const file = getFile(formData, "lampiran");
  const removeLampiran = formData.get("remove_lampiran") === "on";
  let nextAttachment: string | null | undefined;

  if (file) {
    const validationError = validateAttachment(file);
    if (validationError) return { error: validationError };

    const uploaded = await uploadFile({
      bucket: STORAGE_BUCKETS.attachments,
      folder: "announcements",
      file,
    });
    if ("error" in uploaded) return { error: uploaded.error };
    nextAttachment = uploaded.path;
  } else if (removeLampiran) {
    nextAttachment = null;
  }

  const payload: Record<string, unknown> = { ...parsed.data };
  if (nextAttachment !== undefined) payload.lampiran_path = nextAttachment;

  const { error } = await supabase
    .from("announcements")
    .update(payload)
    .eq("id", id);

  if (error) {
    if (nextAttachment) {
      await removeFile(STORAGE_BUCKETS.attachments, nextAttachment);
    }
    console.error("Gagal mengubah pengumuman:", error.message);
    return { error: "Gagal menyimpan perubahan. Coba lagi." };
  }

  if (
    nextAttachment !== undefined &&
    existing.lampiran_path &&
    existing.lampiran_path !== nextAttachment
  ) {
    await removeFile(STORAGE_BUCKETS.attachments, existing.lampiran_path);
  }

  revalidatePath("/pengumuman");
  revalidatePath(`/pengumuman/${getString(formData, "slug")}`);
  revalidatePath("/dashboard");
  revalidatePath("/admin/pengumuman");
  redirect("/admin/pengumuman?ok=Pengumuman diperbarui.");
}

export async function togglePinAction(formData: FormData) {
  const admin = await isAdmin();
  if (!admin) redirect("/login");

  const id = getString(formData, "id");
  if (!id) redirect("/admin/pengumuman?error=Pengumuman tidak valid.");

  const supabase = getSupabaseAdmin();
  const { data: announcement } = await supabase
    .from("announcements")
    .select("id,is_pinned")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!announcement) {
    redirect("/admin/pengumuman?error=Pengumuman tidak ditemukan.");
  }

  if (!announcement.is_pinned && (await pinnedCount()) >= 3) {
    redirect("/admin/pengumuman?error=Maksimal 3 pengumuman yang bisa disematkan.");
  }

  const { error } = await supabase
    .from("announcements")
    .update({ is_pinned: !announcement.is_pinned })
    .eq("id", id);

  if (error) {
    console.error("Gagal mengubah pin:", error.message);
    redirect("/admin/pengumuman?error=Gagal mengubah status semat.");
  }

  revalidatePath("/pengumuman");
  revalidatePath("/dashboard");
  revalidatePath("/admin/pengumuman");
  redirect("/admin/pengumuman?ok=Status semat diperbarui.");
}

export async function deleteAnnouncementAction(formData: FormData) {
  const admin = await isAdmin();
  if (!admin) redirect("/login");

  const id = getString(formData, "id");
  if (!id) redirect("/admin/pengumuman?error=Pengumuman tidak valid.");

  const supabase = getSupabaseAdmin();
  const { data: announcement } = await supabase
    .from("announcements")
    .select("id,lampiran_path")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!announcement) {
    redirect("/admin/pengumuman?error=Pengumuman tidak ditemukan.");
  }

  const { error } = await supabase
    .from("announcements")
    .update({ deleted_at: new Date().toISOString(), is_pinned: false })
    .eq("id", id);

  if (error) {
    console.error("Gagal menghapus pengumuman:", error.message);
    redirect("/admin/pengumuman?error=Gagal menghapus pengumuman.");
  }

  if (announcement.lampiran_path) {
    await removeFile(STORAGE_BUCKETS.attachments, announcement.lampiran_path);
  }

  revalidatePath("/pengumuman");
  revalidatePath("/dashboard");
  revalidatePath("/admin/pengumuman");
  redirect("/admin/pengumuman?ok=Pengumuman dihapus.");
}
