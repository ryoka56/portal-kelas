import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import bcrypt from "bcryptjs";

import { getSupabaseAdmin } from "./supabase";
import { signSessionToken, verifySessionToken } from "./jwt";
import { SESSION_COOKIE } from "./constants";
import type { Role, SessionUser } from "./types";

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: {
  id: string;
  nim: string;
  nama: string;
  role: Role;
  is_first_login: boolean;
}) {
  const token = await signSessionToken({
    id: user.id,
    nim: user.nim,
    nama: user.nama,
    role: user.role,
    is_first_login: user.is_first_login,
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSessionPayload() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const payload = await getSessionPayload();
  if (!payload) return null;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,nim,nama,role,is_first_login,status,foto_path")
    .eq("id", payload.sub)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error("Gagal memuat sesi pengguna:", error.message);
    return null;
  }

  if (!data || data.status !== "aktif") return null;

  return {
    id: data.id,
    nim: data.nim,
    nama: data.nama,
    role: data.role as Role,
    is_first_login: data.is_first_login,
    foto_path: data.foto_path ?? null,
  };
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireStudent() {
  const user = await requireUser();
  if (user.role !== "mahasiswa") redirect("/admin");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}
