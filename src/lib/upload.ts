import "server-only";

import { getSupabaseAdmin, STORAGE_BUCKETS } from "./supabase";

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const MAX_ATTACHMENT_BYTES = 3 * 1024 * 1024;

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ATTACHMENT_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
  "application/x-zip-compressed",
  "image/jpeg",
  "image/png",
]);

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "application/zip": "zip",
  "application/x-zip-compressed": "zip",
};

export function validateImage(file: File) {
  if (!IMAGE_TYPES.has(file.type)) {
    return "Foto harus berupa JPG, PNG, atau WebP.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Ukuran foto maksimal 2 MB.";
  }
  return null;
}

export function validateAttachment(file: File) {
  if (!ATTACHMENT_TYPES.has(file.type)) {
    return "Lampiran harus PDF, DOCX, XLSX, PPTX, ZIP, JPG, atau PNG.";
  }
  if (file.size > MAX_ATTACHMENT_BYTES) {
    return "Ukuran lampiran maksimal 3 MB.";
  }
  return null;
}

export async function uploadFile({
  bucket,
  folder,
  file,
}: {
  bucket: string;
  folder: string;
  file: File;
}) {
  const extension =
    EXTENSION_BY_TYPE[file.type] ||
    file.name.split(".").pop()?.toLowerCase().slice(0, 8) ||
    "bin";

  const path = `${folder}/${crypto.randomUUID()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await getSupabaseAdmin()
    .storage.from(bucket)
    .upload(path, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    console.error("Gagal upload file:", error.message);
    return { error: "Gagal mengunggah file. Coba lagi." as const };
  }

  return { path };
}

export async function removeFile(bucket: string, path: string | null) {
  if (!path) return;
  const { error } = await getSupabaseAdmin().storage.from(bucket).remove([path]);
  if (error) {
    console.error("Gagal menghapus file:", error.message);
  }
}

export { STORAGE_BUCKETS };
