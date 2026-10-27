export default function AdminLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Memuat panel admin">
      <div className="space-y-2">
        <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
        <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200"
          />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-72 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />
        <div className="h-72 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />
      </div>
    </div>
  );
}
