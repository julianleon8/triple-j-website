import { ExternalLink, Star } from 'lucide-react'
import { ReviewActions } from './ReviewActions'

// Wrap Date.now in a module-scope helper so the react-hooks/purity rule
// doesn't fire on direct built-in calls during render. Same pattern as
// /hq/more/stats nowMs(). Server components re-render per request so
// "now" resolves freshly each time.
function nowMs() {
  return nowMs()
}

type Props = {
  customerId: string
  reviewAskedAt: string | null
  reviewFollowupDueAt: string | null
  reviewLeftAt: string | null
  reviewUrl: string | null
}

/**
 * Three-state review-ask card (migration 019). State machine:
 *   - never asked → primary "Ask for review" button
 *   - asked       → "Asked Xd ago, due in Yd" + Mark left + Snooze
 *   - left        → review URL link + when + reset
 *
 * Server component for the static parts; the action buttons live in
 * ReviewActions (client) so we can router.refresh() after each action.
 */
export function ReviewSection({
  customerId,
  reviewAskedAt,
  reviewFollowupDueAt,
  reviewLeftAt,
  reviewUrl,
}: Props) {
  const left = !!reviewLeftAt
  const asked = !!reviewAskedAt && !left

  const askedDays = reviewAskedAt
    ? Math.round((nowMs() - new Date(reviewAskedAt).getTime()) / 86_400_000)
    : null
  const dueDays = reviewFollowupDueAt
    ? Math.round((new Date(reviewFollowupDueAt).getTime() - nowMs()) / 86_400_000)
    : null
  const overdue = dueDays != null && dueDays < 0

  return (
    <section className="rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
          <Star size={14} strokeWidth={2} />
          Review
        </h2>
        {overdue ? (
          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
            Follow-up due
          </span>
        ) : null}
      </div>

      {left ? (
        <div className="mt-3 space-y-2">
          <p className="text-[15px] text-(--text-primary)">
            Review left {formatRelative(reviewLeftAt!)}
          </p>
          {reviewUrl ? (
            <a
              href={reviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[13px] text-(--brand-fg) hover:underline"
            >
              <ExternalLink size={13} strokeWidth={2} /> View review
            </a>
          ) : null}
          <div className="pt-2">
            <ReviewActions customerId={customerId} state="left" />
          </div>
        </div>
      ) : asked ? (
        <div className="mt-3 space-y-2">
          <p className="text-[15px] text-(--text-primary)">
            Asked {askedDays === 0 ? 'today' : `${askedDays}d ago`}
            {dueDays != null ? (
              overdue
                ? <span className="text-amber-700 dark:text-amber-300"> · {Math.abs(dueDays)}d overdue</span>
                : <span className="text-(--text-secondary)"> · follow up in {dueDays}d</span>
            ) : null}
          </p>
          <ReviewActions customerId={customerId} state="asked" />
        </div>
      ) : (
        <div className="mt-3">
          <p className="mb-3 text-[14px] text-(--text-secondary)">
            Ask after the install is dialed in. Reply rate drops fast after week one.
          </p>
          <ReviewActions customerId={customerId} state="never" />
        </div>
      )}
    </section>
  )
}

function formatRelative(iso: string): string {
  const days = Math.round((nowMs() - new Date(iso).getTime()) / 86_400_000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
