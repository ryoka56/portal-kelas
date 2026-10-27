import type { Metadata } from "next";
import Link from "next/link";
import { LifeBuoy } from "lucide-react";

import {
  Alert,
  Badge,
  EmptyState,
  PageHeader,
  Pagination,
  buttonStyles,
} from "@/components/ui";
import { listAdminTickets } from "@/lib/data";
import {
  ticketCategoryLabels,
  ticketStatusLabels,
  ticketStatusTone,
} from "@/lib/labels";
import { formatDateShort } from "@/lib/format";
import { parsePage } from "@/lib/utils";
import { ticketStatusSchema } from "@/lib/validation";

export const metadata: Metadata = {
  title: "Manajemen Tiket",
};

const statuses = ["pending", "diproses", "selesai"] as const;

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string | string[];
    page?: string | string[];
    ok?: string | string[];
    error?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const rawStatus = Array.isArray(params.status)
    ? params.status[0]
    : params.status;
  const parsedStatus = ticketStatusSchema.safeParse(rawStatus);
  const status = parsedStatus.success ? parsedStatus.data : undefined;
  const page = parsePage(params.page);
  const ok = Array.isArray(params.ok) ? params.ok[0] : params.ok;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  const result = await listAdminTickets({ status, page });

  return (
    <div>
      <PageHeader
        eyebrow="Bantuan"
        title="Tiket mahasiswa"
        description="Baca laporan, balas, dan ubah status tiket yang dikirim mahasiswa."
      />

      {ok ? <Alert variant="success" className="mb-4">{ok}</Alert> : null}
      {error ? <Alert variant="error" className="mb-4">{error}</Alert> : null}

      <div className="mb-5 flex flex-wrap gap-1.5">
        <Link
          href="/admin/tiket"
          className={buttonStyles({
            size: "sm",
            variant: status ? "outline" : "primary",
          })}
        >
          Semua
        </Link>
        {statuses.map((value) => (
          <Link
            key={value}
            href={`/admin/tiket?status=${value}`}
            className={buttonStyles({
              size: "sm",
              variant: status === value ? "primary" : "outline",
            })}
          >
            {ticketStatusLabels[value]}
          </Link>
        ))}
      </div>

      {result.items.length === 0 ? (
        <EmptyState
          icon={LifeBuoy}
          title="Tidak ada tiket"
          description={
            status
              ? `Belum ada tiket dengan status ${ticketStatusLabels[status]}.`
              : "Belum ada tiket yang dikirim mahasiswa."
          }
        />
      ) : (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Mahasiswa</th>
                  <th>Subjek</th>
                  <th>Kategori</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="font-mono text-[11px] text-slate-500">
                      {ticket.ticket_code}
                    </td>
                    <td>
                      <p className="font-semibold text-slate-900">
                        {ticket.profiles?.nama ?? "-"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {ticket.profiles?.nim ?? "-"}
                      </p>
                    </td>
                    <td className="max-w-[260px]">
                      <p className="truncate font-medium text-slate-800">
                        {ticket.subjek}
                      </p>
                    </td>
                    <td className="text-xs text-slate-600">
                      {ticketCategoryLabels[ticket.kategori]}
                    </td>
                    <td className="text-xs text-slate-500">
                      {formatDateShort(ticket.created_at)}
                    </td>
                    <td>
                      <Badge tone={ticketStatusTone[ticket.status]}>
                        {ticketStatusLabels[ticket.status]}
                      </Badge>
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/admin/tiket/${ticket.id}`}
                        className={buttonStyles({
                          variant: "outline",
                          size: "sm",
                        })}
                      >
                        Buka
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            basePath="/admin/tiket"
            params={{ status }}
          />
        </>
      )}
    </div>
  );
}
