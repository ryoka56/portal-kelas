export default function PortalLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Memuat halaman">
      <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        <div className="h-64 animate-pulse rounded-3xl bg-slate-200/70 sm:h-72" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="h-28 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />
          <div className="h-28 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200"
          />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-80 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200 lg:col-span-2" />
        <div className="h-80 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />
      </div>
    </div>
  );
}
