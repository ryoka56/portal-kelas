import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { TZDate } from "@date-fns/tz";

export const APP_TIME_ZONE = "Asia/Jakarta";

const DAY_NAMES = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

export function toJakarta(value: string | Date) {
  return new TZDate(value instanceof Date ? value : new Date(value), APP_TIME_ZONE);
}

export function formatDate(value: string | Date) {
  return format(toJakarta(value), "d MMMM yyyy", { locale: localeId });
}

export function formatDateShort(value: string | Date) {
  return format(toJakarta(value), "d MMM yyyy", { locale: localeId });
}

export function formatDateTime(value: string | Date) {
  return `${formatDate(value)} · ${format(toJakarta(value), "HH.mm", {
    locale: localeId,
  })} WIB`;
}

export function formatDateTimeLocal(value: string | Date) {
  return format(toJakarta(value), "yyyy-MM-dd'T'HH:mm");
}

export function parseJakartaDateTimeLocal(value: string) {
  // WIB tidak memakai DST; offset +07:00 aman untuk input datetime-local.
  const parsed = new Date(`${value}:00+07:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatTime(value: string) {
  return value.slice(0, 5);
}

export function dayName(hari: number) {
  return DAY_NAMES[hari] ?? "-";
}

export function todayDayNumber() {
  return toJakarta(new Date()).getDay();
}

export function isToday(value: string | Date) {
  return formatDate(value) === formatDate(new Date());
}

export function isOverdue(deadline: string) {
  return new Date(deadline).getTime() < Date.now();
}

export function deadlineLabel(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return "Sudah lewat";
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days} hari ${hours % 24} jam lagi`;
  if (hours > 0) return `${hours} jam ${minutes % 60} menit lagi`;
  return `${Math.max(minutes, 1)} menit lagi`;
}
