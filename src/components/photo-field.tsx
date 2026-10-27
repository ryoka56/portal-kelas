"use client";

import { useEffect, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";

import { initials } from "@/lib/utils";

export function PhotoField({
  currentUrl,
  name,
}: {
  currentUrl: string | null;
  name: string;
}) {
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [remove, setRemove] = useState(false);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    setRemove(false);
  }

  const shown = remove ? null : preview;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full bg-indigo-50 text-xl font-bold text-indigo-700 ring-4 ring-white shadow">
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shown} alt={name} className="h-full w-full object-cover" />
        ) : (
          initials(name)
        )}
      </div>
      <div className="space-y-2">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
          <ImagePlus className="h-4 w-4" />
          Pilih foto
          <input
            type="file"
            name="foto"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleChange}
          />
        </label>
        <p className="text-xs text-slate-500">
          JPG, PNG, atau WebP. Maksimal 2 MB.
        </p>
        {preview ? (
          <label className="flex items-center gap-2 text-xs text-rose-600">
            <input
              type="checkbox"
              name="remove_foto"
              checked={remove}
              onChange={(event) => setRemove(event.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300"
            />
            <Trash2 className="h-3.5 w-3.5" />
            Hapus foto saat menyimpan
          </label>
        ) : null}
      </div>
    </div>
  );
}
