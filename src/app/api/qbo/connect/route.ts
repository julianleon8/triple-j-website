import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildAuthUrl, getMissingQboEnv } from '@/lib/qbo'
import { randomBytes } from 'crypto'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Only authenticated owners can initiate the OAuth flow
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const missing = getMissingQboEnv()
  if (missing.length > 0) {
    return NextResponse.redirect(
      new URL(
        `/dashboard/settings/quickbooks?error=missing_config&missing=${encodeURIComponent(
          missing.join(',')
        )}`,
        request.url
      )
    )
  }

  // Generate a random state value to prevent CSRF
  const state = randomBytes(16).toString('hex')

  // Store state in a short-lived cookie so the callback can verify it
  const response = NextResponse.redirect(buildAuthUrl(state))
  response.cookies.set('qbo_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
    path: '/',
  })

  return response
}
