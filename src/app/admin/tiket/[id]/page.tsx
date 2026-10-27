import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  Phone,
  UserRound,
} from "lucide-react";

import { TicketReplyForm } from "@/components/admin/ticket-reply-form";
import {
  Alert,
  Badge,
  Card,
  PageHeader,
} from "@/components/ui";
import { getAdminTicket } from "@/lib/data";
import {
  ticketCategoryLabels,
  ticketStatusLabels,
  ticketStatusTone,
} from "@/lib/labels";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "Detail Tiket",
};

export default async function AdminTicketDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string | string[]; error?: string | string[] }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const ticket = await getAdminTicket(id);
  if (!ticket) notFound();

  const ok = Array.isArray(query.ok) ? query.ok[0] : query.ok;
  const error = Array.isArray(query.error) ? query.error[0] : query.error;

  return (
    <div>
      <Link
        href="/admin/tiket"
        className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Kembali ke tiket
      </Link>

      <PageHeader
        eyebrow={ticket.ticket_code}
        title={ticket.subjek}
        description={`Dikirim ${formatDateTime(ticket.created_at)}`}
        actions={
          <Badge tone={ticketStatusTone[ticket.status]}>
            {ticketStatusLabels[ticket.status]}
          </Badge>
        }
      />

      {ok ? <Alert variant="success" className="mb-4">{ok}</Alert> : null}
      {error ? <Alert variant="error" className="mb-4">{error}</Alert> : null}

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="slate">
                {ticketCategoryLabels[ticket.kategori]}
              </Badge>
              <span className="text-[11px] text-slate-400">
                {ticket.ticket_code}
              </span>
            </div>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Pesan mahasiswa
            </p>
            <div className="content-text mt-2">{ticket.pesan}</div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-bold text-slate-900">
                Data mahasiswa
              </h2>
            </div>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Nama</dt>
                <dd className="font-semibold text-slate-800">
                  {ticket.profiles?.nama ?? "-"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">NIM</dt>
                <dd className="font-semibold text-slate-800">
                  {ticket.profiles?.nim ?? "-"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Program studi</dt>
                <dd className="text-right font-medium text-slate-800">
                  {ticket.profiles?.program_studi ?? "-"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="inline-flex items-center gap-1 text-slate-500">
                  <Mail className="h-3 w-3" /> Email
                </dt>
                <dd className="text-right font-medium text-slate-800">
                  {ticket.profiles?.email ?? "-"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="inline-flex items-center gap-1 text-slate-500">
                  <Phone className="h-3 w-3" /> HP
                </dt>
                <dd className="text-right font-medium text-slate-800">
                  {ticket.profiles?.no_hp ?? "-"}
                </dd>
              </div>
            </dl>
          </Card>
        </div>

        <Card className="h-fit p-5">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <MessageSquare className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Balas tiket
              </h2>
              <p className="text-[11px] text-slate-500">
                Balasan dan status akan terlihat oleh mahasiswa.
              </p>
            </div>
          </div>

          <div className="mt-4">
            <TicketReplyForm
              ticketId={ticket.id}
              defaultStatus={ticket.status}
              defaultReply={ticket.balasan_admin}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
