export type Role = "admin" | "mahasiswa";

export type StudentStatus = "aktif" | "nonaktif" | "cuti";

export type SessionUser = {
  id: string;
  nim: string;
  nama: string;
  role: Role;
  is_first_login: boolean;
  foto_path: string | null;
};

export type ProfileSummary = {
  id: string;
  nim: string;
  nama: string;
  program_studi: string | null;
  status: StudentStatus;
  email: string | null;
  no_hp: string | null;
  foto_path: string | null;
  is_phone_visible: boolean;
  is_email_visible: boolean;
};

export type ProfileDetail = ProfileSummary & {
  role: Role;
  is_first_login: boolean;
  created_at: string;
};

export type AnnouncementCategory = "akademik" | "tugas" | "kegiatan" | "umum";

export type Announcement = {
  id: string;
  judul: string;
  slug: string;
  konten: string;
  kategori: AnnouncementCategory;
  lampiran_path: string | null;
  is_pinned: boolean;
  created_at: string;
  created_by: string | null;
  profiles?: { nama: string } | null;
};

export type ScheduleType = "kuliah" | "praktikum" | "kegiatan";

export type Schedule = {
  id: string;
  nama_matkul: string;
  dosen: string | null;
  hari: number;
  jam_mulai: string;
  jam_selesai: string;
  ruangan: string | null;
  jenis: ScheduleType;
  catatan: string | null;
};

export type TaskStatus = "aktif" | "selesai";

export type TaskCompletionProfile = {
  id: string;
  nama: string;
  nim: string;
  foto_path: string | null;
};

export type TaskCompletion = {
  user_id: string;
  completed_at: string;
  profiles: TaskCompletionProfile | null;
};

export type AcademicTask = {
  id: string;
  matakuliah: string;
  judul: string;
  deskripsi: string | null;
  deadline: string;
  status: TaskStatus;
  created_at: string;
  task_completions: TaskCompletion[];
};

export type TicketStatus = "pending" | "diproses" | "selesai";

export type TicketCategory = "koreksi_data" | "akademik" | "teknis" | "lainnya";

export type Ticket = {
  id: string;
  ticket_code: string;
  user_id: string;
  kategori: TicketCategory;
  subjek: string;
  pesan: string;
  status: TicketStatus;
  balasan_admin: string | null;
  replied_at: string | null;
  created_at: string;
  profiles?: {
    nim: string;
    nama: string;
    program_studi: string | null;
    email: string | null;
    no_hp: string | null;
  } | null;
};

export type ActionState = {
  error?: string;
  success?: string;
};
