/**
 * Infer the lead's funnel position from the form submission. Stored on
 * the leads table as intent_stage (migration 014). Exists separately
 * from `status` because status tracks our actions ("contacted", "won")
 * while intent_stage tracks the prospect's readiness.
 *
 * Rules — order matters; first match wins:
 *   - estimated_budget_min set    → 'budget_set'
 *   - timeline = asap | this_week → 'ready_to_buy'
 *   - timeline = this_month       → 'timeline_known'
 *   - else                        → 'info_gathering'
 *
 * `ready_to_buy` is also reachable via manual edit on /hq/leads/[id]
 * for cases the form rules miss.
 */

export type IntentStage =
  | 'info_gathering'
  | 'timeline_known'
  | 'budget_set'
  | 'ready_to_buy'

type Input = {
  timeline?: string | null
  estimated_budget_min?: number | null
}

export function inferIntentStage(input: Input): IntentStage {
  if (input.estimated_budget_min != null && input.estimated_budget_min > 0) {
    return 'budget_set'
  }
  if (input.timeline === 'asap' || input.timeline === 'this_week') {
    return 'ready_to_buy'
  }
  if (input.timeline === 'this_month') {
    return 'timeline_known'
  }
  return 'info_gathering'
}
