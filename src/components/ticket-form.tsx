"use client";

import { useActionState } from "react";

import { createTicketAction } from "@/lib/actions/tickets";
import { ticketCategoryOptions } from "@/lib/labels";
import type { ActionState, TicketCategory } from "@/lib/types";

import { Alert } from "./ui";
import { SubmitButton } from "./submit-button";

const initialState: ActionState = {};

export function TicketForm({
  defaultCategory,
  defaultSubject,
}: {
  defaultCategory?: TicketCategory;
  defaultSubject?: string;
}) {
  const [state, action] = useActionState(createTicketAction, initialState);

  return (
    <form action={action} className="space-y-4">
      {state.error ? <Alert variant="error">{state.error}</Alert> : null}

      <div>
        <label htmlFor="kategori" className="field-label">
          Kategori
        </label>
        <select
          id="kategori"
          name="kategori"
          defaultValue={defaultCategory ?? "koreksi_data"}
          className="field"
        >
          {ticketCategoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="subjek" className="field-label">
          Subjek
        </label>
        <input
          id="subjek"
          name="subjek"
          type="text"
          defaultValue={defaultSubject}
          placeholder="Contoh: Koreksi nomor HP saya"
          className="field"
          minLength={5}
          maxLength={120}
          required
        />
      </div>

      <div>
        <label htmlFor="pesan" className="field-label">
          Pesan
        </label>
        <textarea
          id="pesan"
          name="pesan"
          rows={5}
          placeholder="Jelaskan data yang salah atau kendala yang kamu alami..."
          className="field resize-y"
          minLength={20}
          maxLength={3000}
          required
        />
        <p className="field-hint">
          Minimal 20 karakter. Sertakan detail agar admin mudah menindaklanjuti.
        </p>
      </div>

      <SubmitButton className="w-full" pendingText="Mengirim tiket...">
        Kirim Tiket
      </SubmitButton>
    </form>
  );
}
