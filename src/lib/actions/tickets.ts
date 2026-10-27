"use server";

import { format } from "date-fns";
import { TZDate } from "@date-fns/tz";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { ActionState, TicketStatus } from "@/lib/types";
import {
  getString,
  ticketCategorySchema,
  ticketStatusSchema,
} from "@/lib/validation";

function generateTicketCode() {
  const date = format(new TZDate(new Date(), "Asia/Jakarta"), "yyyyMMdd");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `TKT-${date}-${random}`;
}

export async function createTicketAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Sesi berakhir. Silakan login lagi." };
  if (user.role !== "mahasiswa") {
    return { error: "Tiket hanya bisa dikirim oleh mahasiswa." };
  }

  const category = ticketCategorySchema.safeParse(getString(formData, "kategori"));
  if (!category.success) return { error: "Kategori tiket tidak valid." };

  const subjek = getString(formData, "subjek").trim();
  const pesan = getString(formData, "pesan").trim();

  if (subjek.length < 5 || subjek.length > 120) {
    return { error: "Subjek harus 5–120 karakter." };
  }
  if (pesan.length < 20 || pesan.length > 3000) {
    return { error: "Pesan harus 20–3000 karakter." };
  }

  const supabase = getSupabaseAdmin();

  let ticketId: string | null = null;
  let lastError: string | null = null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const ticketCode = generateTicketCode();
    const { data, error } = await supabase
      .from("tickets")
      .insert({
        ticket_code: ticketCode,
        user_id: user.id,
        kategori: category.data,
        subjek,
        pesan,
        status: "pending",
      })
      .select("id")
      .single();

    if (!error && data) {
      ticketId = data.id;
      break;
    }

    lastError = error?.message ?? "Gagal membuat tiket.";
    if (error?.code !== "23505") break;
  }

  if (!ticketId) {
    console.error("Gagal membuat tiket:", lastError);
    return { error: "Gagal membuat tiket. Coba lagi." };
  }

  revalidatePath("/bantuan");
  revalidatePath("/admin/tiket");
  redirect(`/bantuan/${ticketId}?ok=Tiket berhasil dikirim.`);
}

export async function replyTicketAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return { error: "Hanya admin yang bisa membalas tiket." };
  }

  const ticketId = getString(formData, "ticket_id");
  const balasan = getString(formData, "balasan_admin").trim();
  const statusParsed = ticketStatusSchema.safeParse(getString(formData, "status"));

  if (!ticketId) return { error: "Tiket tidak valid." };
  if (balasan.length < 5 || balasan.length > 3000) {
    return { error: "Balasan harus 5–3000 karakter." };
  }
  if (!statusParsed.success) return { error: "Status tiket tidak valid." };

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("tickets")
    .update({
      balasan_admin: balasan,
      status: statusParsed.data,
      handled_by: user.id,
      replied_at: new Date().toISOString(),
    })
    .eq("id", ticketId);

  if (error) {
    console.error("Gagal membalas tiket:", error.message);
    return { error: "Gagal menyimpan balasan. Coba lagi." };
  }

  revalidateTicketPaths(ticketId);
  redirect(`/admin/tiket/${ticketId}?ok=Balasan tersimpan.`);
}

export async function updateTicketStatusAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/login");

  const ticketId = getString(formData, "ticket_id");
  const statusParsed = ticketStatusSchema.safeParse(getString(formData, "status"));
  if (!ticketId || !statusParsed.success) redirect("/admin/tiket?error=Status tidak valid.");

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("tickets")
    .update({
      status: statusParsed.data satisfies TicketStatus,
      handled_by: user.id,
    })
    .eq("id", ticketId);

  if (error) {
    console.error("Gagal mengubah status tiket:", error.message);
    redirect(`/admin/tiket/${ticketId}?error=Gagal mengubah status.`);
  }

  revalidateTicketPaths(ticketId);
  redirect(`/admin/tiket/${ticketId}?ok=Status tiket diperbarui.`);
}

function revalidateTicketPaths(ticketId: string) {
  revalidatePath("/bantuan");
  revalidatePath(`/bantuan/${ticketId}`);
  revalidatePath("/admin/tiket");
  revalidatePath(`/admin/tiket/${ticketId}`);
}
