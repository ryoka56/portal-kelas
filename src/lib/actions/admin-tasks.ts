"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { ActionState } from "@/lib/types";
import { parseJakartaDateTimeLocal } from "@/lib/format";
import { getString } from "@/lib/validation";

const taskSchema = z.object({
  matakuliah: z.string().trim().min(2, "Nama matkul minimal 2 karakter.").max(120),
  judul: z.string().trim().min(3, "Judul tugas minimal 3 karakter.").max(180),
  deskripsi: z.string().trim().max(10000),
  deadline: z.string().min(1, "Deadline wajib diisi."),
});

function parseForm(formData: FormData) {
  const parsed = taskSchema.safeParse({
    matakuliah: getString(formData, "matakuliah"),
    judul: getString(formData, "judul"),
    deskripsi: getString(formData, "deskripsi"),
    deadline: getString(formData, "deadline"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tugas tidak valid." };
  }

  const deadline = parseJakartaDateTimeLocal(parsed.data.deadline);
  if (!deadline) return { error: "Format deadline tidak valid." };

  return {
    data: {
      matakuliah: parsed.data.matakuliah,
      judul: parsed.data.judul,
      deskripsi: parsed.data.deskripsi || null,
      deadline: deadline.toISOString(),
    },
  };
}

export async function createTaskAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return { error: "Akses ditolak." };

  const parsed = parseForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const { data, error } = await getSupabaseAdmin()
    .from("academic_tasks")
    .insert({
      ...parsed.data,
      status: "aktif",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Gagal membuat tugas:", error?.message);
    return { error: "Gagal membuat tugas. Coba lagi." };
  }

  revalidatePath("/akademik");
  revalidatePath("/dashboard");
  revalidatePath("/admin/tugas");
  redirect(`/admin/tugas/${data.id}?ok=Tugas berhasil dibuat.`);
}

export async function updateTaskAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return { error: "Akses ditolak." };

  const id = getString(formData, "id");
  if (!id) return { error: "Tugas tidak valid." };

  const parsed = parseForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const { error } = await getSupabaseAdmin()
    .from("academic_tasks")
    .update(parsed.data)
    .eq("id", id);

  if (error) {
    console.error("Gagal mengubah tugas:", error.message);
    return { error: "Gagal menyimpan tugas. Coba lagi." };
  }

  revalidatePath("/akademik");
  revalidatePath(`/akademik/tugas/${id}`);
  revalidatePath("/dashboard");
  revalidatePath("/admin/tugas");
  revalidatePath(`/admin/tugas/${id}`);
  redirect(`/admin/tugas/${id}?ok=Tugas diperbarui.`);
}

export async function toggleTaskStatusAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/login");

  const id = getString(formData, "id");
  if (!id) redirect("/admin/tugas?error=Tugas tidak valid.");

  const supabase = getSupabaseAdmin();
  const { data: task } = await supabase
    .from("academic_tasks")
    .select("id,status")
    .eq("id", id)
    .maybeSingle();

  if (!task) redirect("/admin/tugas?error=Tugas tidak ditemukan.");

  const nextStatus = task.status === "aktif" ? "selesai" : "aktif";
  const { error } = await supabase
    .from("academic_tasks")
    .update({ status: nextStatus })
    .eq("id", id);

  if (error) {
    console.error("Gagal mengubah status tugas:", error.message);
    redirect(`/admin/tugas/${id}?error=Gagal mengubah status tugas.`);
  }

  revalidatePath("/akademik");
  revalidatePath(`/akademik/tugas/${id}`);
  revalidatePath("/dashboard");
  revalidatePath("/admin/tugas");
  revalidatePath(`/admin/tugas/${id}`);
  redirect(
    `/admin/tugas/${id}?ok=Tugas ${nextStatus === "selesai" ? "ditutup" : "dibuka kembali"}.`,
  );
}

export async function deleteTaskAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/login");

  const id = getString(formData, "id");
  if (!id) redirect("/admin/tugas?error=Tugas tidak valid.");

  const { error } = await getSupabaseAdmin()
    .from("academic_tasks")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Gagal menghapus tugas:", error.message);
    redirect(`/admin/tugas/${id}?error=Gagal menghapus tugas.`);
  }

  revalidatePath("/akademik");
  revalidatePath("/dashboard");
  revalidatePath("/admin/tugas");
  redirect("/admin/tugas?ok=Tugas dihapus.");
}
