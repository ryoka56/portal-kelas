import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Inbox,
  LifeBuoy,
  Mail,
  MessageCircle,
  PencilLine,
} from "lucide-react";

import { TicketForm } from "@/components/ticket-form";
import {
  Alert,
  Badge,
  Card,
  EmptyState,
  PageHeader,
} from "@/components/ui";
import { requireStudent } from "@/lib/auth";
import { getAdminContact, listTicketsForUser } from "@/lib/data";
import {
  ticketCategoryLabels,
  ticketStatusLabels,
  ticketStatusTone,
} from "@/lib/labels";
import { formatDate } from "@/lib/format";
import { normalizePhoneForWa } from "@/lib/utils";
import { ticketCategorySchema } from "@/lib/validation";

export const metadata: Metadata = {
  title: "Bantuan & Kontak Admin",
};

export default async function HelpPage({
  searchParams,
}: {
  searchParams: Promise<{
    ok?: string | string[];
    kategori?: string | string[];
    subjek?: string | string[];
  }>;
}) {
  const user = await requireStudent();
  const params = await searchParams;
  const [admin, tickets] = await Promise.all([
    getAdminContact(),
    listTicketsForUser(user.id),
  ]);

  const ok = Array.isArray(params.ok) ? params.ok[0] : params.ok;
  const rawCategory = Array.isArray(params.kategori)
    ? params.kategori[0]
    : params.kategori;
  const parsedCategory = ticketCategorySchema.safeParse(rawCategory);
  const defaultCategory = parsedCategory.success ? parsedCategory.data : undefined;
  const defaultSubject = (
    Array.isArray(params.subjek) ? params.subjek[0] : params.subjek
  )?.slice(0, 120);

  const waNumber = admin.no_hp ? normalizePhoneForWa(admin.no_hp) : null;

  return (
    <div>
      <PageHeader
        eyebrow="Bantuan"
        title="Ada data yang perlu dikoreksi?"
        description="Hubungi admin kelas atau kirim tiket. Tiket akan dicatat dan statusnya bisa kamu pantau."
      />

      {ok ? <Alert variant="success" className="mb-5">{ok}</Alert> : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="bg-slate-950 p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">
                Kontak admin
              </p>
              <h2 className="mt-1 text-xl font-bold">{admin.nama}</h2>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Untuk hal mendesak, hubungi langsung. Untuk koreksi data,
                sebaiknya lewat tiket agar tercatat.
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {waNumber ? (
                <a
                  href={`https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-slate-50"
                >
                  <span className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                      <MessageCircle className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-slate-800">
                        WhatsApp
                      </span>
                      <span className="block text-xs text-slate-500">
                        {admin.no_hp}
                      </span>
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </a>
              ) : null}

              {admin.email ? (
                <a
                  href={`mailto:${admin.email}`}
                  className="flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-slate-50"
                >
                  <span className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Mail className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-slate-800">
                        Email
                      </span>
                      <span className="block text-xs text-slate-500">
                        {admin.email}
                      </span>
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </a>
              ) : null}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-bold text-slate-900">
              Cara mengajukan koreksi
            </h2>
            <ol className="mt-3 space-y-3">
              {[
                "Cek dulu data di halaman Direktori atau Profil.",
                "Kirim tiket dengan kategori Koreksi Data dan jelaskan bagian yang salah.",
                "Admin akan memverifikasi dan memperbarui data.",
                "Pantau status tiket di halaman ini.",
              ].map((step, index) => (
                <li key={step} className="flex gap-3 text-xs leading-5 text-slate-600">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-700">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-[11px] leading-5 text-amber-800">
              <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Balasan admin biasanya 1–2 hari kuliah.
            </div>
          </Card>
        </div>

        <Card className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Kirim tiket</h2>
              <p className="mt-1 text-xs text-slate-500">
                Tiket tercatat dengan kode unik dan bisa dipantau statusnya.
              </p>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <LifeBuoy className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5">
            <TicketForm
              defaultCategory={defaultCategory}
              defaultSubject={defaultSubject}
            />
          </div>
        </Card>
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Riwayat tiket
            </h2>
            <p className="text-xs text-slate-500">
              {tickets.length} tiket pernah kamu kirim.
            </p>
          </div>
          <PencilLine className="h-4 w-4 text-slate-400" />
        </div>

        {tickets.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Belum ada tiket"
            description="Tiket yang kamu kirim akan muncul di sini beserta status dan balasan admin."
          />
        ) : (
          <div className="space-y-2">
            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/bantuan/${ticket.id}`}
                className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-indigo-200 hover:bg-slate-50"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={ticketStatusTone[ticket.status]}>
                    {ticketStatusLabels[ticket.status]}
                  </Badge>
                  <Badge tone="slate">
                    {ticketCategoryLabels[ticket.kategori]}
                  </Badge>
                  <span className="text-[11px] text-slate-400">
                    {ticket.ticket_code} · {formatDate(ticket.created_at)}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {ticket.subjek}
                </p>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                  {ticket.pesan}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
