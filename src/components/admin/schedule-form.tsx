"use client";

import { useActionState } from "react";

import { scheduleTypeLabels } from "@/lib/labels";
import type { ActionState, ScheduleType } from "@/lib/types";

import { Alert } from "../ui";
import { SubmitButton } from "../submit-button";

const initialState: ActionState = {};

const days = [
  { value: 1, label: "Senin" },
  { value: 2, label: "Selasa" },
  { value: 3, label: "Rabu" },
  { value: 4, label: "Kamis" },
  { value: 5, label: "Jumat" },
  { value: 6, label: "Sabtu" },
  { value: 7, label: "Minggu" },
];

export function ScheduleForm({
  action,
  mode,
  defaults,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  mode: "create" | "edit";
  defaults?: {
    id: string;
    nama_matkul: string;
    dosen: string | null;
    hari: number;
    jam_mulai: string;
    jam_selesai: string;
    ruangan: string | null;
    jenis: ScheduleType;
    catatan: string | null;
  };
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? <Alert variant="error">{state.error}</Alert> : null}
      {state.success ? <Alert variant="success">{state.success}</Alert> : null}

      {defaults?.id ? <input type="hidden" name="id" value={defaults.id} /> : null}

      <div>
        <label htmlFor="nama_matkul" className="field-label">
          Nama mata kuliah
        </label>
        <input
          id="nama_matkul"
          name="nama_matkul"
          defaultValue={defaults?.nama_matkul}
          className="field"
          placeholder="Pemrograman Web"
          required
        />
      </div>

      <div>
        <label htmlFor="dosen" className="field-label">
          Dosen
        </label>
        <input
          id="dosen"
          name="dosen"
          defaultValue={defaults?.dosen ?? ""}
          className="field"
          placeholder="Nama dosen (opsional)"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="hari" className="field-label">
            Hari
          </label>
          <select
            id="hari"
            name="hari"
            defaultValue={defaults?.hari ?? 1}
            className="field"
          >
            {days.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="jenis" className="field-label">
            Jenis
          </label>
          <select
            id="jenis"
            name="jenis"
            defaultValue={defaults?.jenis ?? "kuliah"}
            className="field"
          >
            {Object.entries(scheduleTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="jam_mulai" className="field-label">
            Jam mulai
          </label>
          <input
            id="jam_mulai"
            name="jam_mulai"
            type="time"
            defaultValue={defaults?.jam_mulai?.slice(0, 5)}
            className="field"
            required
          />
        </div>
        <div>
          <label htmlFor="jam_selesai" className="field-label">
            Jam selesai
          </label>
          <input
            id="jam_selesai"
            name="jam_selesai"
            type="time"
            defaultValue={defaults?.jam_selesai?.slice(0, 5)}
            className="field"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="ruangan" className="field-label">
          Ruangan
        </label>
        <input
          id="ruangan"
          name="ruangan"
          defaultValue={defaults?.ruangan ?? ""}
          className="field"
          placeholder="Lab 3 / Ruang 201"
        />
      </div>

      <div>
        <label htmlFor="catatan" className="field-label">
          Catatan
        </label>
        <textarea
          id="catatan"
          name="catatan"
          defaultValue={defaults?.catatan ?? ""}
          rows={2}
          className="field resize-y"
          placeholder="Catatan tambahan (opsional)"
        />
      </div>

      <SubmitButton className="w-full" pendingText="Menyimpan...">
        {mode === "create" ? "Tambah Jadwal" : "Simpan Perubahan"}
      </SubmitButton>
    </form>
  );
}
