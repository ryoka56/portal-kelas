"use client";

import { useActionState } from "react";
import { Paperclip } from "lucide-react";

import { categoryLabels } from "@/lib/labels";
import type {
  ActionState,
  AnnouncementCategory,
} from "@/lib/types";

import { Alert } from "../ui";
import { SubmitButton } from "../submit-button";

const initialState: ActionState = {};

export function AnnouncementForm({
  action,
  mode,
  defaults,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  mode: "create" | "edit";
  defaults?: {
    id: string;
    judul: string;
    slug: string;
    konten: string;
    kategori: AnnouncementCategory;
    is_pinned: boolean;
    lampiran_path: string | null;
    attachmentUrl: string | null;
  };
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form
      action={formAction}
      className="space-y-5"
      encType="multipart/form-data"
    >
      {state.error ? <Alert variant="error">{state.error}</Alert> : null}
      {state.success ? <Alert variant="success">{state.success}</Alert> : null}

      {defaults?.id ? <input type="hidden" name="id" value={defaults.id} /> : null}
      {defaults?.slug ? (
        <input type="hidden" name="slug" value={defaults.slug} />
      ) : null}

      <div>
        <label htmlFor="judul" className="field-label">
          Judul
        </label>
        <input
          id="judul"
          name="judul"
          defaultValue={defaults?.judul}
          className="field"
          placeholder="Contoh: Perubahan jadwal praktikum minggu ini"
          minLength={5}
          maxLength={160}
          required
        />
      </div>

      <div>
        <label htmlFor="kategori" className="field-label">
          Kategori
        </label>
        <select
          id="kategori"
          name="kategori"
          defaultValue={defaults?.kategori ?? "umum"}
          className="field"
        >
          {Object.entries(categoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="konten" className="field-label">
          Isi pengumuman
        </label>
        <textarea
          id="konten"
          name="konten"
          defaultValue={defaults?.konten}
          rows={9}
          className="field resize-y"
          placeholder="Tulis informasi lengkap di sini..."
          minLength={20}
          maxLength={20000}
          required
        />
        <p className="field-hint">
          Baris baru akan dipertahankan saat ditampilkan ke mahasiswa.
        </p>
      </div>

      <div>
        <label htmlFor="lampiran" className="field-label">
          Lampiran (opsional)
        </label>
        <input
          id="lampiran"
          name="lampiran"
          type="file"
          accept=".pdf,.docx,.xlsx,.pptx,.zip,.jpg,.jpeg,.png"
          className="field file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-700"
        />
        <p className="field-hint">
          PDF, DOCX, XLSX, PPTX, ZIP, JPG, atau PNG. Maksimal 3 MB.
        </p>

        {defaults?.lampiran_path ? (
          <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                <Paperclip className="h-3.5 w-3.5" />
                Lampiran saat ini
              </span>
              {defaults.attachmentUrl ? (
                <a
                  href={defaults.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  Buka
                </a>
              ) : null}
            </div>
            <label className="mt-2 flex items-center gap-2 text-xs text-rose-600">
              <input
                type="checkbox"
                name="remove_lampiran"
                className="h-3.5 w-3.5 rounded border-slate-300"
              />
              Hapus lampiran saat menyimpan
            </label>
          </div>
        ) : null}
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <input
          type="checkbox"
          name="is_pinned"
          defaultChecked={defaults?.is_pinned}
          className="mt-0.5 h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
        />
        <span>
          Sematkan di beranda
          <span className="block text-xs text-amber-700">
            Maksimal 3 pengumuman yang disematkan.
          </span>
        </span>
      </label>

      <div className="flex justify-end">
        <SubmitButton pendingText="Menyimpan...">
          {mode === "create" ? "Publikasikan" : "Simpan Perubahan"}
        </SubmitButton>
      </div>
    </form>
  );
}
