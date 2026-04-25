import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const schema = z.object({
  name:    z.string().min(2).max(100),
  phone:   z.string().min(10).max(20),
  email:   z.string().email().optional().or(z.literal('')),
  city:    z.string().max(100).optional(),
  zip:     z.string().max(10).optional(),
  notes:   z.string().max(2000).optional(),
  lead_id: z.string().uuid().optional(),
})

/**
 * GET /api/customers?q=<query>
 *
 * Lightweight search for the lead-detail ReferrerPicker. Matches name
 * (ilike) or phone (literal contains). Returns up to 10 rows. Without
 * `q`, returns the 10 most-recent customers (useful as a fallback when
 * the input is empty).
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(request.url)
  const q = (url.searchParams.get('q') ?? '').trim()

  let query = getAdminClient()
    .from('customers')
    .select('id, name, phone, city')
    .order('created_at', { ascending: false })
    .limit(10)

  if (q.length > 0) {
    // Escape PostgREST `or` reserved chars; commas + parens would split
    // the filter list. We just strip them — the search is fuzzy anyway.
    const safe = q.replace(/[,()]/g, ' ')
    query = query.or(`name.ilike.%${safe}%,phone.ilike.%${safe}%`)
  }

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
  return NextResponse.json({ customers: data ?? [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const admin = getAdminClient()
  const { data, error } = await admin
    .from('customers')
    .insert({
      name:    parsed.data.name,
      phone:   parsed.data.phone,
      email:   parsed.data.email || null,
      city:    parsed.data.city || null,
      zip:     parsed.data.zip || null,
      notes:   parsed.data.notes || null,
      lead_id: parsed.data.lead_id || null,
    })
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
  }

  // If converted from a lead, mark the lead as 'quoted'
  if (parsed.data.lead_id) {
    await admin
      .from('leads')
      .update({ status: 'quoted', updated_at: new Date().toISOString() })
      .eq('id', parsed.data.lead_id)
  }

  return NextResponse.json(data)
}
