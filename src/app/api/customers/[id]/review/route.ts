import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const SNOOZE_DAYS = 7

const bodySchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('asked') }),
  z.object({ action: z.literal('snoozed') }),
  z.object({ action: z.literal('left'), url: z.string().url().max(2000).optional() }),
  z.object({ action: z.literal('reset') }),
])

/**
 * POST /api/customers/[id]/review
 *
 * Drives the customer-flywheel review-ask flow (migration 019).
 *   - asked   → stamp review_asked_at = now, review_followup_due_at = +7d
 *   - snoozed → bump review_followup_due_at by another 7d
 *   - left    → stamp review_left_at = now, persist optional review_url,
 *               clear review_followup_due_at
 *   - reset   → clear all four fields (in case Julian asked the wrong customer)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const json = await request.json().catch(() => ({}))
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const now = new Date()
  const due = new Date(now.getTime() + SNOOZE_DAYS * 86400 * 1000)
  const update: Record<string, unknown> = { updated_at: now.toISOString() }

  if (parsed.data.action === 'asked') {
    update.review_asked_at = now.toISOString()
    update.review_followup_due_at = due.toISOString()
  } else if (parsed.data.action === 'snoozed') {
    update.review_followup_due_at = due.toISOString()
  } else if (parsed.data.action === 'left') {
    update.review_left_at = now.toISOString()
    update.review_followup_due_at = null
    if (parsed.data.url) update.review_url = parsed.data.url
  } else {
    update.review_asked_at = null
    update.review_followup_due_at = null
    update.review_left_at = null
    update.review_url = null
  }

  const { error } = await getAdminClient()
    .from('customers')
    .update(update)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
