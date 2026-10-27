"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export type ToggleTaskResult = {
  ok: boolean;
  completed?: boolean;
  error?: string;
};

export async function toggleTaskCompletion(
  taskId: string,
): Promise<ToggleTaskResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sesi berakhir. Silakan login lagi." };
  if (user.role !== "mahasiswa") {
    return { ok: false, error: "Hanya mahasiswa yang bisa menandai tugas." };
  }

  const supabase = getSupabaseAdmin();

  const { data: task, error: taskError } = await supabase
    .from("academic_tasks")
    .select("id,status")
    .eq("id", taskId)
    .maybeSingle();

  if (taskError) {
    console.error("Gagal memuat tugas:", taskError.message);
    return { ok: false, error: "Tugas tidak ditemukan." };
  }

  if (!task) return { ok: false, error: "Tugas tidak ditemukan." };
  if (task.status !== "aktif") {
    return { ok: false, error: "Tugas ini sudah ditutup oleh admin." };
  }

  const { data: existing, error: existingError } = await supabase
    .from("task_completions")
    .select("id")
    .eq("academic_task_id", taskId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingError) {
    console.error("Gagal memeriksa status tugas:", existingError.message);
    return { ok: false, error: "Gagal memeriksa status tugas." };
  }

  if (existing) {
    const { error } = await supabase
      .from("task_completions")
      .delete()
      .eq("id", existing.id);

    if (error) {
      console.error("Gagal membatalkan tugas:", error.message);
      return { ok: false, error: "Gagal membatalkan status selesai." };
    }

    revalidateTaskPaths(taskId);
    return { ok: true, completed: false };
  }

  const { error } = await supabase.from("task_completions").insert({
    academic_task_id: taskId,
    user_id: user.id,
  });

  if (error) {
    console.error("Gagal menandai tugas:", error.message);
    return { ok: false, error: "Gagal menandai tugas sebagai selesai." };
  }

  revalidateTaskPaths(taskId);
  return { ok: true, completed: true };
}

function revalidateTaskPaths(taskId: string) {
  revalidatePath("/akademik");
  revalidatePath(`/akademik/tugas/${taskId}`);
  revalidatePath("/dashboard");
  revalidatePath("/admin/tugas");
  revalidatePath(`/admin/tugas/${taskId}`);
}
