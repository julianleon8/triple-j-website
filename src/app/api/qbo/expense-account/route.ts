import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  account_id:   z.string().trim().min(1).nullable(),
  account_name: z.string().trim().nullable().optional(),
})

/**
 * POST /api/qbo/expense-account
 * Body: { account_id, account_name? }
 *
 * Saves the QBO Account.Id every Phase 4.2 receipt push will book to.
 * Persisted on the qbo_tokens row via the columns added in migration 013.
 * Pass `account_id: null` to clear the configuration.
 *
 * Owner-auth only.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: z.infer<typeof bodySchema>
  try {
    const json = await request.json()
    const parsed = bodySchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
    }
    body = parsed.data
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const db = getAdminClient()
  const { data: tokens } = await db
    .from('qbo_tokens')
    .select('id')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle<{ id: string }>()

  if (!tokens) {
    return NextResponse.json(
      { error: 'QuickBooks is not connected.' },
      { status: 503 },
    )
  }

  const { error } = await db
    .from('qbo_tokens')
    .update({
      expense_account_id:   body.account_id,
      expense_account_name: body.account_name ?? null,
    })
    .eq('id', tokens.id)
  if (error) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
