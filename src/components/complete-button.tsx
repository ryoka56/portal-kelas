"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, RotateCcw } from "lucide-react";

import { toggleTaskCompletion } from "@/lib/actions/tasks";
import { cn } from "@/lib/utils";

export function CompleteButton({
  taskId,
  completed,
  disabled = false,
}: {
  taskId: string;
  completed: boolean;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [done, setDone] = useState(completed);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setDone(completed);
  }, [completed]);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await toggleTaskCompletion(taskId);
      if (!result.ok) {
        setError(result.error ?? "Gagal menyimpan status tugas.");
        return;
      }
      setDone(result.completed ?? false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || pending}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
          done
            ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            : "bg-slate-900 text-white hover:bg-slate-800",
          disabled && "border-slate-200 bg-slate-100 text-slate-500",
        )}
        title={disabled ? "Tugas sudah ditutup" : undefined}
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : done ? (
          <RotateCcw className="h-3.5 w-3.5" />
        ) : (
          <CheckCircle2 className="h-3.5 w-3.5" />
        )}
        {disabled ? "Ditutup" : done ? "Batal selesai" : "Tandai selesai"}
      </button>
      {error ? <p className="text-[11px] text-rose-600">{error}</p> : null}
    </div>
  );
}
