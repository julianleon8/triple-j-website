/**
 * Thin red banner shown above a lead row (or inside a lead detail hero)
 * when the lead has been sitting untouched past the cold threshold.
 * Uses `--urgent-bg` (light #dc2626 · dark #ef4444).
 */
export function ColdBanner({ ageHours }: { ageHours: number }) {
  const hrs = Math.max(1, Math.round(ageHours))
  return (
    <div
      role="alert"
      className="flex items-center gap-1.5 bg-(--urgent-bg) px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white"
    >
      <span aria-hidden="true">●</span>
      <span>COLD — {hrs}hr no reply</span>
    </div>
  )
}
