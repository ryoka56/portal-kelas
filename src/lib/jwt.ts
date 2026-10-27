import { SignJWT, jwtVerify } from "jose";

import type { Role } from "./types";

export type SessionPayload = {
  sub: string;
  nim: string;
  nama: string;
  role: Role;
  firstLogin: boolean;
};

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET belum diset.");
  }
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(input: {
  id: string;
  nim: string;
  nama: string;
  role: Role;
  is_first_login: boolean;
}) {
  return new SignJWT({
    nim: input.nim,
    nama: input.nama,
    role: input.role,
    firstLogin: input.is_first_login,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(input.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());

    if (!payload.sub) return null;
    if (payload.role !== "admin" && payload.role !== "mahasiswa") return null;

    return {
      sub: payload.sub,
      nim: typeof payload.nim === "string" ? payload.nim : "",
      nama: typeof payload.nama === "string" ? payload.nama : "",
      role: payload.role,
      firstLogin: payload.firstLogin === true,
    };
  } catch {
    return null;
  }
}
