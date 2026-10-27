"use client";

import { useActionState } from "react";
import { KeyRound, UserRound } from "lucide-react";

import { loginAction } from "@/lib/actions/auth";
import type { ActionState } from "@/lib/types";

import { Alert } from "./ui";
import { SubmitButton } from "./submit-button";

const initialState: ActionState = {};

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const [state, action] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="space-y-5">
      {state.error ? <Alert variant="error">{state.error}</Alert> : null}

      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}

      <div>
        <label htmlFor="nim" className="field-label">
          NIM
        </label>
        <div className="relative">
          <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="nim"
            name="nim"
            type="text"
            autoComplete="username"
            placeholder="Contoh: 20241001"
            className="field pl-10"
            required
            autoFocus
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="field-label">
          Password
        </label>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Masukkan password"
            className="field pl-10"
            required
          />
        </div>
      </div>

      <SubmitButton className="w-full" size="lg" pendingText="Memeriksa...">
        Masuk ke Portal
      </SubmitButton>

      <p className="text-center text-xs leading-5 text-slate-500">
        Akun dibuat oleh admin kelas. Tidak ada pendaftaran mandiri.
      </p>
    </form>
  );
}
