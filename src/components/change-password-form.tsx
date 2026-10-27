"use client";

import { useActionState } from "react";
import { KeyRound } from "lucide-react";

import { changePasswordAction } from "@/lib/actions/auth";
import type { ActionState } from "@/lib/types";

import { Alert } from "./ui";
import { SubmitButton } from "./submit-button";

const initialState: ActionState = {};

export function ChangePasswordForm() {
  const [state, action] = useActionState(changePasswordAction, initialState);

  return (
    <form action={action} className="space-y-5">
      {state.error ? <Alert variant="error">{state.error}</Alert> : null}

      <div>
        <label htmlFor="current_password" className="field-label">
          Password saat ini
        </label>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="current_password"
            name="current_password"
            type="password"
            autoComplete="current-password"
            className="field pl-10"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="new_password" className="field-label">
          Password baru
        </label>
        <input
          id="new_password"
          name="new_password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          className="field"
          required
        />
        <p className="field-hint">Minimal 8 karakter.</p>
      </div>

      <div>
        <label htmlFor="confirm_password" className="field-label">
          Ulangi password baru
        </label>
        <input
          id="confirm_password"
          name="confirm_password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          className="field"
          required
        />
      </div>

      <SubmitButton className="w-full" size="lg" pendingText="Menyimpan...">
        Simpan Password
      </SubmitButton>
    </form>
  );
}
