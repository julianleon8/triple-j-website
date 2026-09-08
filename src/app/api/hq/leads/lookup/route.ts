import { NextRequest, NextResponse } from 'next/server'
import { requireOwner } from '@/lib/auth'
import { getAdminClient } from '@/lib/supabase/admin'
import { normalizeTenDigits } from '@/lib/hq/capture-draft'

export const dynamic = 'force-dynamic'

export type DuplicateMatch = {
  kind: 'lead' | 'customer'
  id: string
  name: string | null
  href: string
  detail: string | null
}

/**
 * GET /api/hq/leads/lookup?phone=… — has this number called before?
 *
 * Runs when the capture screen sees ten digits, and its answer is rendered
 * inline, never as a modal: the operator is mid-call and typing, and a dialog
 * that steals focus would cost more than the duplicate does.
 *
 * Stored phone numbers are not normalised — they arrive from a public form, a
 * voice memo and now capture, in whatever shape the person typed. So the
 * comparison normalises both sides in code rather than trusting the column, and
 * matching is on the last ten digits, which is the only part that is stable
 * across "+1 254…", "(254) …" and "254…".
 */
export async function GET(request: NextRequest) {
  const denied = await requireOwner()
  if (denied) return denied

  const raw = request.nextUrl.searchParams.get('phone') ?? ''
  const digits = normalizeTenDigits(raw)
  if (!digits) return NextResponse.json({ matches: [] })

  const db = getAdminClient()

  // `like` on the last four digits narrows the scan cheaply; the exact match is
  // then done in code on normalised values. Doing it purely in SQL would need a
  // functional index on a regexp-stripped phone, which is not worth a migration
  // at this table size.
  const tail = `%${digits.slice(-4)}`
  const [leadsRes, customersRes] = await Promise.all([
    db.from('leads').select('id, name, phone, status, created_at').like('phone', tail).limit(25),
    db.from('customers').select('id, name, phone, city').like('phone', tail).limit(25),
  ])

  const matches: DuplicateMatch[] = []

  for (const l of (leadsRes.data ?? []) as { id: string; name: string | null; phone: string | null; status: string | null; created_at: string }[]) {
    if (l.phone && normalizeTenDigits(l.phone) === digits) {
      matches.push({
        kind: 'lead',
        id: l.id,
        name: l.name,
        href: `/hq/leads/${l.id}`,
        detail: l.status ? l.status.toUpperCase() : null,
      })
    }
  }
  for (const c of (customersRes.data ?? []) as { id: string; name: string | null; phone: string | null; city: string | null }[]) {
    if (c.phone && normalizeTenDigits(c.phone) === digits) {
      matches.push({
        kind: 'customer',
        id: c.id,
        name: c.name,
        href: `/hq/customers/${c.id}`,
        detail: c.city,
      })
    }
  }

  // A customer outranks a lead: "they are already a customer" is the more
  // useful thing to say first when the phone is still ringing.
  matches.sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'customer' ? -1 : 1))

  return NextResponse.json({ matches })
}
