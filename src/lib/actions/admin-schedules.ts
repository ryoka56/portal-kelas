"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { ActionState } from "@/lib/types";
import { getString, scheduleTypeSchema } from "@/lib/validation";

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Format jam tidak valid.");

const scheduleSchema = z.object({
  nama_matkul: z.string().trim().min(2, "Nama matkul minimal 2 karakter.").max(120),
  dosen: z.string().trim().max(120),
  hari: z.coerce.number().int().min(1).max(7),
  jam_mulai: timeSchema,
  jam_selesai: timeSchema,
  ruangan: z.string().trim().max(80),
  jenis: scheduleTypeSchema,
  catatan: z.string().trim().max(1000),
});

function parseForm(formData: FormData) {
  const parsed = scheduleSchema.safeParse({
    nama_matkul: getString(formData, "nama_matkul"),
    dosen: getString(formData, "dosen"),
    hari: getString(formData, "hari"),
    jam_mulai: getString(formData, "jam_mulai"),
    jam_selesai: getString(formData, "jam_selesai"),
    ruangan: getString(formData, "ruangan"),
    jenis: getString(formData, "jenis"),
    catatan: getString(formData, "catatan"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data jadwal tidak valid." };
  }

  if (parsed.data.jam_selesai <= parsed.data.jam_mulai) {
    return { error: "Jam selesai harus lebih besar dari jam mulai." };
  }

  return {
    data: {
      ...parsed.data,
      dosen: parsed.data.dosen || null,
      ruangan: parsed.data.ruangan || null,
      catatan: parsed.data.catatan || null,
    },
  };
}

export async function createScheduleAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return { error: "Akses ditolak." };

  const parsed = parseForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const { error } = await getSupabaseAdmin()
    .from("schedules")
    .insert(parsed.data);

  if (error) {
    console.error("Gagal menambah jadwal:", error.message);
    return { error: "Gagal menambah jadwal. Coba lagi." };
  }

  revalidatePath("/akademik");
  revalidatePath("/admin/jadwal");
  redirect("/admin/jadwal?ok=Jadwal berhasil ditambahkan.");
}

export async function updateScheduleAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return { error: "Akses ditolak." };

  const id = getString(formData, "id");
  if (!id) return { error: "Jadwal tidak valid." };

  const parsed = parseForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const { error } = await getSupabaseAdmin()
    .from("schedules")
    .update(parsed.data)
    .eq("id", id);

  if (error) {
    console.error("Gagal mengubah jadwal:", error.message);
    return { error: "Gagal menyimpan jadwal. Coba lagi." };
  }

  revalidatePath("/akademik");
  revalidatePath("/admin/jadwal");
  redirect("/admin/jadwal?ok=Jadwal diperbarui.");
}

export async function deleteScheduleAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/login");

  const id = getString(formData, "id");
  if (!id) redirect("/admin/jadwal?error=Jadwal tidak valid.");

  const { error } = await getSupabaseAdmin()
    .from("schedules")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Gagal menghapus jadwal:", error.message);
    redirect("/admin/jadwal?error=Gagal menghapus jadwal.");
  }

  revalidatePath("/akademik");
  revalidatePath("/admin/jadwal");
  redirect("/admin/jadwal?ok=Jadwal dihapus.");
}
