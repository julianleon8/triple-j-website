import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const lineItemSchema = z.object({
  description: z.string().min(1).max(500),
  quantity: z.number().positive(),
  unit_price: z.number().min(0),
  sort_order: z.number().int().default(0),
})

const patchSchema = z.object({
  valid_until: z.string().optional(),
  notes: z.string().max(2000).optional(),
  status: z.enum(['draft', 'sent', 'accepted', 'declined', 'expired']).optional(),
  line_items: z.array(lineItemSchema).min(1).optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const db = getAdminClient()

  const { data, error } = await db
    .from('quotes')
    .select('*, customers(name, email), quote_line_items(*)')
    .eq('id', id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Quote not found' }, { status: 404 })

  return NextResponse.json(data)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const { line_items, ...quoteFields } = parsed.data
  const db = getAdminClient()

  if (Object.keys(quoteFields).length > 0) {
    let subtotal: number | undefined
    let total: number | undefined

    if (line_items) {
      subtotal = line_items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
      total = subtotal // tax_rate = 0
    }

    const statusTimestamps: Record<string, string> = {}
    const nowIso = new Date().toISOString()
    if (quoteFields.status === 'accepted') statusTimestamps.accepted_at = nowIso
    if (quoteFields.status === 'declined') statusTimestamps.declined_at = nowIso

    const { error } = await db
      .from('quotes')
      .update({
        ...quoteFields,
        ...statusTimestamps,
        ...(subtotal !== undefined ? { subtotal, total, tax_amount: 0 } : {}),
        updated_at: nowIso,
      })
      .eq('id', id)

    if (error) return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 })

    // Auto-create a job on /hq-driven acceptance, mirroring the
    // customer-facing /accept endpoint. Idempotent — skips if a job
    // already exists for this quote (e.g. the customer hit accept first).
    if (quoteFields.status === 'accepted') {
      const { data: existing } = await db
        .from('jobs')
        .select('id')
        .eq('quote_id', id)
        .maybeSingle()
      if (!existing) {
        const { data: q } = await db
          .from('quotes')
          .select('customer_id, total')
          .eq('id', id)
          .single()
        if (q) {
          const jobNumber = `JJM-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`
          await db.from('jobs').insert({
            customer_id: q.customer_id,
            quote_id: id,
            job_number: jobNumber,
            status: 'scheduled',
            contract_signed_date: nowIso.slice(0, 10),
            total_contract: Number(q.total ?? 0) || null,
          })
        }
      }
    }
  }

  if (line_items) {
    await db.from('quote_line_items').delete().eq('quote_id', id)

    const subtotal = line_items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
    const total = subtotal

    await db.from('quotes').update({ subtotal, total, tax_amount: 0, updated_at: new Date().toISOString() }).eq('id', id)

    const rows = line_items.map(item => ({
      quote_id: id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.quantity * item.unit_price,
      sort_order: item.sort_order,
    }))
    const { error } = await db.from('quote_line_items').insert(rows)
    if (error) return NextResponse.json({ error: 'Failed to update line items' }, { status: 500 })
  }

  const { data } = await db
    .from('quotes')
    .select('*, customers(name, email), quote_line_items(*)')
    .eq('id', id)
    .single()

  return NextResponse.json(data)
}
