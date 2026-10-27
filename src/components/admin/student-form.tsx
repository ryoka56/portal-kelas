"use client";

import { useActionState } from "react";

import type { ActionState, StudentStatus } from "@/lib/types";
import { studentStatusLabels } from "@/lib/labels";

import { Alert } from "../ui";
import { SubmitButton } from "../submit-button";

const initialState: ActionState = {};

export function StudentForm({
  action,
  mode,
  defaults,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  mode: "create" | "edit";
  defaults?: {
    id: string;
    nim: string;
    nama: string;
    program_studi: string | null;
    status: StudentStatus;
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
          <label htmlFor="nim" className="field-label">
            NIM
          </label>
          <input
            id="nim"
            name="nim"
            defaultValue={defaults?.nim}
            className="field"
            placeholder="20241001"
            required
            minLength={3}
            maxLength={30}
          />
          <p className="field-hint">Dipakai untuk login.</p>
        </div>
        <div>
          <label htmlFor="nama" className="field-label">
            Nama lengkap
          </label>
          <input
            id="nama"
            name="nama"
            defaultValue={defaults?.nama}
            className="field"
            placeholder="Nama mahasiswa"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="program_studi" className="field-label">
            Program studi
          </label>
          <input
            id="program_studi"
            name="program_studi"
            defaultValue={defaults?.program_studi ?? ""}
            className="field"
            placeholder="Teknik Informatika"
            required
          />
        </div>
        <div>
          <label htmlFor="status" className="field-label">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={defaults?.status ?? "aktif"}
            className="field"
          >
            {Object.entries(studentStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {mode === "create" ? (
        <div>
          <label htmlFor="password" className="field-label">
            Password awal
          </label>
          <input
            id="password"
            name="password"
            type="text"
            className="field"
            placeholder="Minimal 8 karakter"
            minLength={8}
            maxLength={72}
            required
          />
          <p className="field-hint">
            Berikan password ini ke mahasiswa. Mereka wajib menggantinya saat
            login pertama.
          </p>
        </div>
      ) : null}

      <div className="flex justify-end">
        <SubmitButton pendingText="Menyimpan...">
          {mode === "create" ? "Buat Akun" : "Simpan Perubahan"}
        </SubmitButton>
      </div>
    </form>
  );
}
