"use client";

import { useActionState } from "react";

import { replyTicketAction } from "@/lib/actions/tickets";
import { ticketStatusLabels } from "@/lib/labels";
import type { ActionState, TicketStatus } from "@/lib/types";

import { Alert } from "../ui";
import { SubmitButton } from "../submit-button";

const initialState: ActionState = {};

export function TicketReplyForm({
  ticketId,
  defaultStatus,
  defaultReply,
}: {
  ticketId: string;
  defaultStatus: TicketStatus;
  defaultReply: string | null;
}) {
  const [state, action] = useActionState(replyTicketAction, initialState);

  return (
    <form action={action} className="space-y-4">
      {state.error ? <Alert variant="error">{state.error}</Alert> : null}
      {state.success ? <Alert variant="success">{state.success}</Alert> : null}

      <input type="hidden" name="ticket_id" value={ticketId} />

      <div>
        <label htmlFor="status" className="field-label">
          Status tiket
        </label>
        <select
          id="status"
          name="status"
          defaultValue={defaultStatus}
          className="field"
        >
          {Object.entries(ticketStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="balasan_admin" className="field-label">
          Balasan admin
        </label>
        <textarea
          id="balasan_admin"
          name="balasan_admin"
          defaultValue={defaultReply ?? ""}
          rows={6}
          className="field resize-y"
          placeholder="Tulis balasan, tindakan yang sudah dilakukan, atau instruksi untuk mahasiswa..."
          minLength={5}
          maxLength={3000}
          required
        />
        <p className="field-hint">
          Balasan akan terlihat oleh mahasiswa di halaman detail tiket.
        </p>
      </div>

      <SubmitButton className="w-full" pendingText="Menyimpan balasan...">
        Simpan Balasan
      </SubmitButton>
    </form>
  );
}
