export default function HqLoading() {
  return (
    <div className="space-y-6">
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-lg font-bold text-(--text-primary)">Recent Leads</h2>
          <span className="text-xs text-(--text-tertiary)">Loading…</span>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-xl border border-(--border-subtle) bg-(--surface-2) animate-pulse"
              aria-hidden="true"
            />
          ))}
        </div>
      </section>

      <div className="rounded-xl border border-(--border-subtle) bg-(--surface-2)">
        <div className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-(--text-tertiary)">
          <span>Pipeline & stats</span>
          <span className="text-xs">Loading…</span>
        </div>
      </div>
    </div>
  )
}
