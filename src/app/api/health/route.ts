import { NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Health check + Supabase keep-alive.
 *
 * Dipanggil oleh Vercel Cron sekali sehari (lihat vercel.json) agar project
 * Supabase free tidak di-pause karena 7 hari tanpa aktivitas.
 * Endpoint ini hanya mengembalikan status, bukan data pengguna.
 */
export async function GET() {
  const startedAt = Date.now();

  try {
    const { error } = await getSupabaseAdmin()
      .from("profiles")
      .select("id", { count: "exact", head: true });

    if (error) {
      console.error("Health check database gagal:", error.message);
      return NextResponse.json(
        {
          ok: false,
          service: "portal-kelas",
          database: "down",
          checkedAt: new Date().toISOString(),
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        service: "portal-kelas",
        database: "up",
        latencyMs: Date.now() - startedAt,
        checkedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json(
      {
        ok: false,
        service: "portal-kelas",
        database: "down",
        checkedAt: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
