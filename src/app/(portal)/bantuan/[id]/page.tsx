import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";

import { Badge, Card } from "@/components/ui";
import { requireStudent } from "@/lib/auth";
import { getTicketForUser } from "@/lib/data";
import {
  ticketCategoryLabels,
  ticketStatusLabels,
  ticketStatusTone,
} from "@/lib/labels";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "Detail Tiket",
};

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireStudent();
  const ticket = await getTicketForUser(id, user.id);

  if (!ticket) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/bantuan"
        className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Kembali ke bantuan
      </Link>

      <div className="space-y-4">
        <Card className="overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/70 p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={ticketStatusTone[ticket.status]}>
                {ticketStatusLabels[ticket.status]}
              </Badge>
              <Badge tone="slate">
                {ticketCategoryLabels[ticket.kategori]}
              </Badge>
              <span className="text-[11px] text-slate-400">
                {ticket.ticket_code}
              </span>
            </div>
            <h1 className="mt-3 text-xl font-bold tracking-tight text-slate-900">
              {ticket.subjek}
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Dikirim {formatDateTime(ticket.created_at)}
            </p>
          </div>

          <div className="p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Pesanmu
            </p>
            <div className="content-text mt-2">{ticket.pesan}</div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <MessageSquare className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Balasan admin
              </h2>
              <p className="text-[11px] text-slate-500">
                {ticket.replied_at
                  ? `Dibalas ${formatDateTime(ticket.replied_at)}`
                  : "Belum ada balasan"}
              </p>
            </div>
          </div>

          {ticket.balasan_admin ? (
            <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 text-sm leading-6 text-emerald-900">
              {ticket.balasan_admin}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-500">
              Admin belum membalas tiket ini. Kamu bisa memantau status di
              halaman ini.
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            Status saat ini: {ticketStatusLabels[ticket.status]}
          </div>
        </Card>

        <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[11px] leading-5 text-slate-500">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          Jangan membagikan kode tiket ini ke orang lain. Tiket hanya bisa
          dilihat oleh kamu dan admin kelas.
        </div>

        {ticket.status === "selesai" ? (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
            <CheckCircle2 className="h-4 w-4" />
            Tiket ini sudah selesai ditangani admin.
          </div>
        ) : null}
      </div>
    </div>
  );
}
