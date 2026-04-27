import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const schema = z.object({
  kind: z.enum(['lead', 'permit', 'quote', 'job']),
  id:   z.string().uuid(),
})

// Hard-delete any pipeline entity surfaced on the Needs Attention feed,
// clearing FK references that would otherwise block the delete (no ON DELETE
// CASCADE was configured for these back-refs in the original schema):
//
//   leads   ← customers.lead_id, quotes.lead_id   (null out)
//   quotes  ← jobs.quote_id                       (null out)
//   permits — no inbound refs                     (straight delete)
//   jobs    — receipts/time/cost cascade, gallery SET NULL (straight delete)
//
// Cascading children (lead_appointments, quote_line_items, job_receipts,
// time_entries, job_costs) and SET NULL refs (email_events, gallery_items)
// are handled by the database itself.
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const { kind, id } = parsed.data
  const db = getAdminClient()

  switch (kind) {
    case 'lead': {
      const { error: cErr } = await db.from('customers').update({ lead_id: null }).eq('lead_id', id)
      if (cErr) return NextResponse.json({ error: 'Failed to detach customers' }, { status: 500 })
      const { error: qErr } = await db.from('quotes').update({ lead_id: null }).eq('lead_id', id)
      if (qErr) return NextResponse.json({ error: 'Failed to detach quotes' }, { status: 500 })
      const { error } = await db.from('leads').delete().eq('id', id)
      if (error) return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 })
      break
    }
    case 'permit': {
      const { error } = await db.from('permit_leads').delete().eq('id', id)
      if (error) return NextResponse.json({ error: 'Failed to delete permit' }, { status: 500 })
      break
    }
    case 'quote': {
      const { error: jErr } = await db.from('jobs').update({ quote_id: null }).eq('quote_id', id)
      if (jErr) return NextResponse.json({ error: 'Failed to detach jobs' }, { status: 500 })
      const { error } = await db.from('quotes').delete().eq('id', id)
      if (error) return NextResponse.json({ error: 'Failed to delete quote' }, { status: 500 })
      break
    }
    case 'job': {
      const { error } = await db.from('jobs').delete().eq('id', id)
      if (error) return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 })
      break
    }
  }

  return NextResponse.json({ success: true })
}
