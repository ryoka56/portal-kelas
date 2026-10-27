import { readFile } from "node:fs/promises";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error(
    "DATABASE_URL belum diset. Isi .env.local dengan connection string Supabase.",
  );
  process.exit(1);
}

const isLocal =
  databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1");

const sql = postgres(databaseUrl, {
  ssl: isLocal ? false : "require",
  prepare: false,
  max: 1,
});

try {
  const schema = await readFile(
    new URL("../supabase/schema.sql", import.meta.url),
    "utf8",
  );

  await sql.unsafe(schema);
  console.log("✓ Schema berhasil diterapkan.");
} catch (error) {
  console.error("✗ Gagal menerapkan schema:", error);
  process.exitCode = 1;
} finally {
  await sql.end();
}
