-- Portal Kelas — skema PostgreSQL untuk Supabase
-- Jalankan lewat `pnpm db:setup` atau SQL Editor Supabase.

begin;

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- PROFIL (admin & mahasiswa)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  nim text not null,
  nama text not null,
  program_studi text,
  status text not null default 'aktif'
    check (status in ('aktif', 'nonaktif', 'cuti')),
  role text not null default 'mahasiswa'
    check (role in ('admin', 'mahasiswa')),
  password_hash text not null,
  email text,
  no_hp text,
  foto_path text,
  is_phone_visible boolean not null default false,
  is_email_visible boolean not null default false,
  is_first_login boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index if not exists profiles_nim_active_uidx
  on public.profiles (lower(nim)) where deleted_at is null;

create unique index if not exists profiles_email_active_uidx
  on public.profiles (lower(email))
  where deleted_at is null and email is not null;

create index if not exists profiles_role_status_idx
  on public.profiles (role, status) where deleted_at is null;

-- ---------------------------------------------------------------------------
-- PENGUMUMAN
-- ---------------------------------------------------------------------------
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  judul text not null,
  slug text not null,
  konten text not null,
  kategori text not null
    check (kategori in ('akademik', 'tugas', 'kegiatan', 'umum')),
  lampiran_path text,
  is_pinned boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index if not exists announcements_slug_active_uidx
  on public.announcements (slug) where deleted_at is null;

create index if not exists announcements_feed_idx
  on public.announcements (is_pinned desc, created_at desc)
  where deleted_at is null;

-- ---------------------------------------------------------------------------
-- JADWAL
-- ---------------------------------------------------------------------------
create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  nama_matkul text not null,
  dosen text,
  hari smallint not null check (hari between 1 and 7),
  jam_mulai time not null,
  jam_selesai time not null,
  ruangan text,
  jenis text not null default 'kuliah'
    check (jenis in ('kuliah', 'praktikum', 'kegiatan')),
  catatan text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint schedules_time_check check (jam_selesai > jam_mulai)
);

create index if not exists schedules_day_time_idx
  on public.schedules (hari, jam_mulai);

-- ---------------------------------------------------------------------------
-- TUGAS GLOBAL + STATUS SELESAI PER MAHASISWA
-- ---------------------------------------------------------------------------
create table if not exists public.academic_tasks (
  id uuid primary key default gen_random_uuid(),
  matakuliah text not null,
  judul text not null,
  deskripsi text,
  deadline timestamptz not null,
  status text not null default 'aktif'
    check (status in ('aktif', 'selesai')),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists academic_tasks_status_deadline_idx
  on public.academic_tasks (status, deadline);

create table if not exists public.task_completions (
  id uuid primary key default gen_random_uuid(),
  academic_task_id uuid not null
    constraint task_completions_task_fkey
    references public.academic_tasks (id) on delete cascade,
  user_id uuid not null
    constraint task_completions_user_fkey
    references public.profiles (id) on delete cascade,
  completed_at timestamptz not null default now(),
  constraint task_completions_unique unique (academic_task_id, user_id)
);

create index if not exists task_completions_user_idx
  on public.task_completions (user_id);

-- ---------------------------------------------------------------------------
-- TIKET BANTUAN
-- ---------------------------------------------------------------------------
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_code text not null unique,
  user_id uuid not null
    constraint tickets_user_fkey
    references public.profiles (id) on delete cascade,
  kategori text not null
    check (kategori in ('koreksi_data', 'akademik', 'teknis', 'lainnya')),
  subjek text not null,
  pesan text not null,
  status text not null default 'pending'
    check (status in ('pending', 'diproses', 'selesai')),
  balasan_admin text,
  handled_by uuid
    constraint tickets_handler_fkey
    references public.profiles (id) on delete set null,
  replied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tickets_user_idx on public.tickets (user_id, created_at desc);
create index if not exists tickets_status_idx on public.tickets (status, created_at desc);

-- ---------------------------------------------------------------------------
-- TRIGGER updated_at
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists announcements_touch_updated_at on public.announcements;
create trigger announcements_touch_updated_at
  before update on public.announcements
  for each row execute function public.touch_updated_at();

drop trigger if exists schedules_touch_updated_at on public.schedules;
create trigger schedules_touch_updated_at
  before update on public.schedules
  for each row execute function public.touch_updated_at();

drop trigger if exists academic_tasks_touch_updated_at on public.academic_tasks;
create trigger academic_tasks_touch_updated_at
  before update on public.academic_tasks
  for each row execute function public.touch_updated_at();

drop trigger if exists tickets_touch_updated_at on public.tickets;
create trigger tickets_touch_updated_at
  before update on public.tickets
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- RLS: aktif, tanpa policy publik. Semua akses lewat server (service role).
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.announcements enable row level security;
alter table public.schedules enable row level security;
alter table public.academic_tasks enable row level security;
alter table public.task_completions enable row level security;
alter table public.tickets enable row level security;

-- ---------------------------------------------------------------------------
-- STORAGE (hanya jika dijalankan di Supabase)
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.schemata where schema_name = 'storage'
  ) then
    insert into storage.buckets (id, name, public)
    values ('avatars', 'avatars', true)
    on conflict (id) do nothing;

    insert into storage.buckets (id, name, public)
    values ('lampiran', 'lampiran', false)
    on conflict (id) do nothing;
  end if;
end
$$;

commit;
