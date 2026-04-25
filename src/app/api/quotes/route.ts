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

const schema = z.object({
  customer_id: z.string().uuid(),
  valid_until: z.string(),
  notes: z.string().max(2000).optional(),
  /** Internal-use only — never shown on the customer accept-token page.
   *  The quote calculator stuffs its inputs + result + flags here as a
   *  JSON blob; future migration normalizes. See docs/QUOTE-CALCULATOR.md. */
  internal_notes: z.string().max(20000).optional(),
  line_items: z.array(lineItemSchema).min(1, 'At least one line item required'),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const { customer_id, valid_until, notes, internal_notes, line_items } = parsed.data
  const db = getAdminClient()

  // Generate quote number: JJM-YYYY-NNN
  const year = new Date().getFullYear()
  const { data: existing } = await db
    .from('quotes')
    .select('quote_number')
    .like('quote_number', `JJM-${year}-%`)
    .order('quote_number', { ascending: false })
    .limit(1)

  let seq = 1
  if (existing && existing.length > 0) {
    const last = existing[0].quote_number
    const parts = last.split('-')
    seq = parseInt(parts[2] ?? '0', 10) + 1
  }
  const quote_number = `JJM-${year}-${String(seq).padStart(3, '0')}`

  // Calculate totals
  const subtotal = line_items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  const tax_rate = 0 // Metal structures typically exempt from TX sales tax
  const tax_amount = subtotal * tax_rate
  const total = subtotal + tax_amount

  const { data: quote, error: quoteError } = await db
    .from('quotes')
    .insert({
      customer_id,
      valid_until,
      notes,
      internal_notes,
      quote_number,
      subtotal,
      tax_rate,
      tax_amount,
      total,
      status: 'draft',
    })
    .select('id, quote_number, accept_token')
    .single()

  if (quoteError || !quote) {
    console.error('Quote insert error:', quoteError)
    return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 })
  }

  // Batch insert line items
  const lineItemRows = line_items.map(item => ({
    quote_id: quote.id,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total_price: item.quantity * item.unit_price,
    sort_order: item.sort_order,
  }))

  const { error: itemsError } = await db.from('quote_line_items').insert(lineItemRows)
  if (itemsError) {
    console.error('Line items insert error:', itemsError)
    return NextResponse.json({ error: 'Failed to save line items' }, { status: 500 })
  }

  return NextResponse.json(quote, { status: 201 })
}
