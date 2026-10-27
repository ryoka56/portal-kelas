import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Client Supabase dengan service role.
 * HANYA dipakai di server (Server Component / Server Action / Route Handler).
 * Jangan pernah mengimpor file ini dari komponen client.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY belum diset. Salin .env.example ke .env.local.",
    );
  }

  client = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return client;
}

export const STORAGE_BUCKETS = {
  avatars: "avatars",
  attachments: "lampiran",
} as const;

export function avatarPublicUrl(path: string | null | undefined) {
  if (!path) return null;
  const { data } = getSupabaseAdmin()
    .storage.from(STORAGE_BUCKETS.avatars)
    .getPublicUrl(path);
  return data.publicUrl;
}

export async function createAttachmentSignedUrl(
  path: string | null | undefined,
  expiresIn = 60 * 60,
) {
  if (!path) return null;
  const { data, error } = await getSupabaseAdmin()
    .storage.from(STORAGE_BUCKETS.attachments)
    .createSignedUrl(path, expiresIn);

  if (error) {
    console.error("Gagal membuat signed URL lampiran:", error.message);
    return null;
  }

  return data.signedUrl;
}
