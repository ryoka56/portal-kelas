import { z } from "zod";

export const nimSchema = z
  .string()
  .trim()
  .min(3, "NIM minimal 3 karakter.")
  .max(30, "NIM maksimal 30 karakter.")
  .regex(/^[A-Za-z0-9._-]+$/, "NIM hanya boleh huruf, angka, titik, garis bawah, atau strip.");

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Nama minimal 2 karakter.")
  .max(100, "Nama maksimal 100 karakter.");

export const passwordSchema = z
  .string()
  .min(8, "Password minimal 8 karakter.")
  .max(72, "Password maksimal 72 karakter.");

export const emailSchema = z
  .string()
  .trim()
  .max(120, "Email maksimal 120 karakter.")
  .refine(
    (value) =>
      value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    "Format email tidak valid.",
  )
  .transform((value) => (value === "" ? null : value.toLowerCase()));

export const phoneSchema = z
  .string()
  .trim()
  .max(20, "Nomor HP maksimal 20 karakter.")
  .refine(
    (value) => value === "" || /^[0-9+\-()\s]{8,20}$/.test(value),
    "Nomor HP tidak valid.",
  )
  .transform((value) => (value === "" ? null : value));

export const categorySchema = z.enum([
  "akademik",
  "tugas",
  "kegiatan",
  "umum",
]);

export const scheduleTypeSchema = z.enum(["kuliah", "praktikum", "kegiatan"]);

export const studentStatusSchema = z.enum(["aktif", "nonaktif", "cuti"]);

export const ticketCategorySchema = z.enum([
  "koreksi_data",
  "akademik",
  "teknis",
  "lainnya",
]);

export const ticketStatusSchema = z.enum(["pending", "diproses", "selesai"]);

export function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function getFile(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}
