import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { QuotePdfDocument } from '@/lib/quote-pdf'

export const dynamic = 'force-dynamic'
// PDF render is fast for typical quotes (< 1s), generous buffer just in case.
export const maxDuration = 30

/**
 * GET /api/quotes/[id]/pdf
 *
 * Streams a customer-ready PDF of the quote using @react-pdf/renderer.
 * Auth-gated (owner only); the customer-facing accept page at
 * /quotes/[token] still works via Cmd+P for ad-hoc print, this endpoint
 * is for HQ to generate a real PDF attachment for email/SMS.
 *
 * Response: 200 with PDF body + Content-Disposition that suggests
 *   triple-j-quote-JJM-2026-042.pdf
 * for the browser to save.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const db = getAdminClient()

  type QuoteRow = {
    id: string
    quote_number: string
    valid_until: string
    subtotal: number | string
    tax_amount: number | string
    total: number | string
    notes: string | null
    customers: {
      name: string
      email: string | null
      phone: string | null
      address: string | null
      city: string | null
      state: string | null
      zip: string | null
    } | null
    quote_line_items: Array<{
      description: string
      quantity: number | string
      unit_price: number | string
      total_price: number | string
      sort_order: number | null
    }>
  }

  const { data: quote, error } = await db
    .from('quotes')
    .select(
      'id, quote_number, valid_until, subtotal, tax_amount, total, notes, ' +
        'customers(name, email, phone, address, city, state, zip), ' +
        'quote_line_items(description, quantity, unit_price, total_price, sort_order)',
    )
    .eq('id', id)
    .single<QuoteRow>()

  if (error || !quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
  if (!quote.customers) return NextResponse.json({ error: 'Quote has no customer' }, { status: 400 })

  // Sort line items by sort_order so PDF order matches the editor view.
  const sortedItems = [...quote.quote_line_items].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  )

  const customerAddressLine = [
    quote.customers.address,
    quote.customers.city,
    [quote.customers.state, quote.customers.zip].filter(Boolean).join(' '),
  ]
    .filter(Boolean)
    .join(' · ') || null

  const pdfBuffer = await renderToBuffer(
    QuotePdfDocument({
      quoteNumber: quote.quote_number,
      customerName: quote.customers.name,
      customerEmail: quote.customers.email,
      customerPhone: quote.customers.phone,
      customerAddress: customerAddressLine,
      lineItems: sortedItems.map((li) => ({
        description: li.description,
        quantity: Number(li.quantity),
        unit_price: Number(li.unit_price),
        total_price: Number(li.total_price),
      })),
      subtotal: Number(quote.subtotal),
      taxAmount: Number(quote.tax_amount),
      total: Number(quote.total),
      validUntil: quote.valid_until,
      notes: quote.notes,
      generatedAt: new Date().toISOString(),
    }),
  )

  // Convert Node Buffer to a Uint8Array Response body so Next.js serializes
  // it correctly. PDF MIME + suggested filename for browser save.
  const filename = `triple-j-quote-${quote.quote_number}.pdf`

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-cache, must-revalidate',
    },
  })
}
