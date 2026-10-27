"use client";

import { useActionState } from "react";

import type { ActionState } from "@/lib/types";

import { Alert } from "../ui";
import { SubmitButton } from "../submit-button";

const initialState: ActionState = {};

export function TaskForm({
  action,
  mode,
  defaults,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  mode: "create" | "edit";
  defaults?: {
    id: string;
    matakuliah: string;
    judul: string;
    deskripsi: string | null;
    deadlineLocal: string;
  };
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? <Alert variant="error">{state.error}</Alert> : null}
      {state.success ? <Alert variant="success">{state.success}</Alert> : null}

      {defaults?.id ? <input type="hidden" name="id" value={defaults.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="matakuliah" className="field-label">
            Mata kuliah
          </label>
          <input
            id="matakuliah"
            name="matakuliah"
            defaultValue={defaults?.matakuliah}
            className="field"
            placeholder="Pemrograman Web"
            required
          />
        </div>
        <div>
          <label htmlFor="deadline" className="field-label">
            Deadline
          </label>
          <input
            id="deadline"
            name="deadline"
            type="datetime-local"
            defaultValue={defaults?.deadlineLocal}
            className="field"
            required
          />
          <p className="field-hint">Waktu Indonesia Barat (WIB).</p>
        </div>
      </div>

      <div>
        <label htmlFor="judul" className="field-label">
          Judul tugas
        </label>
        <input
          id="judul"
          name="judul"
          defaultValue={defaults?.judul}
          className="field"
          placeholder="Contoh: Tugas 3 — CRUD Laravel"
          required
        />
      </div>

      <div>
        <label htmlFor="deskripsi" className="field-label">
          Deskripsi
        </label>
        <textarea
          id="deskripsi"
          name="deskripsi"
          defaultValue={defaults?.deskripsi ?? ""}
          rows={7}
          className="field resize-y"
          placeholder="Jelaskan instruksi, format pengumpulan, dan catatan penting..."
        />
      </div>

      <div className="flex justify-end">
        <SubmitButton pendingText="Menyimpan...">
          {mode === "create" ? "Buat Tugas" : "Simpan Perubahan"}
        </SubmitButton>
      </div>
    </form>
  );
}
