import type {
  AnnouncementCategory,
  ScheduleType,
  StudentStatus,
  TicketCategory,
  TicketStatus,
} from "./types";

export const categoryLabels: Record<AnnouncementCategory, string> = {
  akademik: "Akademik",
  tugas: "Tugas",
  kegiatan: "Kegiatan",
  umum: "Umum",
};

export const categoryTone: Record<
  AnnouncementCategory,
  "indigo" | "amber" | "emerald" | "slate"
> = {
  akademik: "indigo",
  tugas: "amber",
  kegiatan: "emerald",
  umum: "slate",
};

export const scheduleTypeLabels: Record<ScheduleType, string> = {
  kuliah: "Kuliah",
  praktikum: "Praktikum",
  kegiatan: "Kegiatan",
};

export const scheduleTypeTone: Record<
  ScheduleType,
  "indigo" | "emerald" | "amber"
> = {
  kuliah: "indigo",
  praktikum: "emerald",
  kegiatan: "amber",
};

export const studentStatusLabels: Record<StudentStatus, string> = {
  aktif: "Aktif",
  nonaktif: "Nonaktif",
  cuti: "Cuti",
};

export const studentStatusTone: Record<
  StudentStatus,
  "emerald" | "rose" | "amber"
> = {
  aktif: "emerald",
  nonaktif: "rose",
  cuti: "amber",
};

export const ticketStatusLabels: Record<TicketStatus, string> = {
  pending: "Menunggu",
  diproses: "Diproses",
  selesai: "Selesai",
};

export const ticketStatusTone: Record<
  TicketStatus,
  "amber" | "sky" | "emerald"
> = {
  pending: "amber",
  diproses: "sky",
  selesai: "emerald",
};

export const ticketCategoryLabels: Record<TicketCategory, string> = {
  koreksi_data: "Koreksi Data",
  akademik: "Akademik",
  teknis: "Teknis",
  lainnya: "Lainnya",
};

export const ticketCategoryOptions = Object.entries(ticketCategoryLabels).map(
  ([value, label]) => ({ value: value as TicketCategory, label }),
);
