import { NextResponse } from 'next/server'
import { requireOwner } from '@/lib/auth'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  const denied = await requireOwner()
  if (denied) return denied

  const { data } = await getAdminClient()
    .from('quote_templates')
    .select('*')
    .eq('is_active', true)
    .order('name')

  return NextResponse.json(data ?? [])
}
