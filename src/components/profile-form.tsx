"use client";

import { useActionState } from "react";

import { updateProfileAction } from "@/lib/actions/profile";
import type { ActionState } from "@/lib/types";

import { Alert } from "./ui";
import { PhotoField } from "./photo-field";
import { SubmitButton } from "./submit-button";

const initialState: ActionState = {};

export function ProfileForm({
  email,
  noHp,
  isEmailVisible,
  isPhoneVisible,
  fotoUrl,
  nama,
}: {
  email: string | null;
  noHp: string | null;
  isEmailVisible: boolean;
  isPhoneVisible: boolean;
  fotoUrl: string | null;
  nama: string;
}) {
  const [state, action] = useActionState(updateProfileAction, initialState);

  return (
    <form action={action} className="space-y-5" encType="multipart/form-data">
      {state.error ? <Alert variant="error">{state.error}</Alert> : null}
      {state.success ? <Alert variant="success">{state.success}</Alert> : null}

      <PhotoField currentUrl={fotoUrl} name={nama} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="field-label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={email ?? ""}
            placeholder="nama@email.com"
            className="field"
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="no_hp" className="field-label">
            Nomor HP / WhatsApp
          </label>
          <input
            id="no_hp"
            name="no_hp"
            type="tel"
            defaultValue={noHp ?? ""}
            placeholder="08xxxxxxxxxx"
            className="field"
            autoComplete="tel"
          />
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Privasi kontak
        </p>
        <label className="flex items-start gap-3 text-sm text-slate-700">
          <input
            type="checkbox"
            name="is_email_visible"
            defaultChecked={isEmailVisible}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span>
            Tampilkan email di direktori
            <span className="block text-xs text-slate-500">
              Jika dimatikan, teman kelas tidak bisa melihat emailmu.
            </span>
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm text-slate-700">
          <input
            type="checkbox"
            name="is_phone_visible"
            defaultChecked={isPhoneVisible}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span>
            Tampilkan nomor HP di direktori
            <span className="block text-xs text-slate-500">
              Nomor HP dipakai untuk tombol WhatsApp di profil publik.
            </span>
          </span>
        </label>
      </div>

      <div className="flex justify-end">
        <SubmitButton pendingText="Menyimpan profil...">
          Simpan Profil
        </SubmitButton>
      </div>
    </form>
  );
}
