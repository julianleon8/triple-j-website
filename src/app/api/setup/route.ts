import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  setup_key: z.string(),
})

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { email, password, setup_key } = parsed.data

  if (setup_key !== process.env.SETUP_KEY) {
    return NextResponse.json({ error: 'Invalid setup key' }, { status: 403 })
  }

  const db = getAdminClient()

  // Check if any user already exists
  const { data: existing } = await db.auth.admin.listUsers()
  if (existing?.users?.length > 0) {
    return NextResponse.json({ error: 'Owner account already exists' }, { status: 409 })
  }

  const { error } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
