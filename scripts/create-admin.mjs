import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
const nim = process.env.ADMIN_NIM?.trim();
const nama = process.env.ADMIN_NAMA?.trim();
const password = process.env.ADMIN_PASSWORD;
const email = process.env.ADMIN_EMAIL?.trim() || null;
const phone = process.env.ADMIN_WHATSAPP?.trim() || null;

if (!databaseUrl) {
  console.error(
    "DATABASE_URL belum diset. Isi .env.local dengan connection string Supabase.",
  );
  process.exit(1);
}

if (!nim || !nama || !password) {
  console.error(
    "Isi ADMIN_NIM, ADMIN_NAMA, dan ADMIN_PASSWORD di .env.local sebelum menjalankan `pnpm db:admin`.",
  );
  process.exit(1);
}

if (password.length < 8) {
  console.error("ADMIN_PASSWORD minimal 8 karakter.");
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
  const passwordHash = await bcrypt.hash(password, 10);

  const [existing] = await sql`
    select id
    from public.profiles
    where lower(nim) = lower(${nim})
      and deleted_at is null
    limit 1
  `;

  if (existing) {
    await sql`
      update public.profiles
      set nama = ${nama},
          role = 'admin',
          status = 'aktif',
          password_hash = ${passwordHash},
          email = ${email},
          no_hp = ${phone},
          is_first_login = false,
          is_phone_visible = true,
          is_email_visible = true,
          deleted_at = null
      where id = ${existing.id}
    `;
    console.log(`✓ Akun admin ${nim} diperbarui.`);
  } else {
    await sql`
      insert into public.profiles (
        id, nim, nama, program_studi, status, role, password_hash,
        email, no_hp, is_phone_visible, is_email_visible, is_first_login
      ) values (
        ${randomUUID()}, ${nim}, ${nama}, null, 'aktif', 'admin', ${passwordHash},
        ${email}, ${phone}, true, true, false
      )
    `;
    console.log(`✓ Akun admin ${nim} dibuat.`);
  }

  console.log("  Login memakai NIM dan password yang kamu isi di .env.local.");
} catch (error) {
  console.error("✗ Gagal membuat akun admin:", error);
  process.exitCode = 1;
} finally {
  await sql.end();
}
