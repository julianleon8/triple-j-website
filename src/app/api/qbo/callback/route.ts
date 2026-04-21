import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { saveTokens, QBO_TOKEN_URL, getMissingQboEnv } from '@/lib/qbo'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
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

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const realmId = searchParams.get('realmId')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard/settings/quickbooks?error=${encodeURIComponent(error)}`, request.url)
    )
  }

  if (!code || !realmId) {
    return NextResponse.redirect(
      new URL('/dashboard/settings/quickbooks?error=missing_params', request.url)
    )
  }

  // Verify CSRF state
  const storedState = request.cookies.get('qbo_oauth_state')?.value
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(
      new URL('/dashboard/settings/quickbooks?error=invalid_state', request.url)
    )
  }

  // Exchange authorization code for tokens
  const credentials = Buffer.from(
    `${process.env.QBO_CLIENT_ID}:${process.env.QBO_CLIENT_SECRET}`
  ).toString('base64')

  const tokenRes = await fetch(QBO_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.QBO_REDIRECT_URI!,
    }),
  })

  if (!tokenRes.ok) {
    const text = await tokenRes.text()
    console.error('[QBO callback] token exchange failed:', text)
    return NextResponse.redirect(
      new URL('/dashboard/settings/quickbooks?error=token_exchange_failed', request.url)
    )
  }

  const tokens = await tokenRes.json()
  await saveTokens({
    realm_id: realmId,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_in: tokens.expires_in,
    x_refresh_token_expires_in: tokens.x_refresh_token_expires_in,
  })

  const response = NextResponse.redirect(
    new URL('/dashboard/settings/quickbooks?connected=1', request.url)
  )
  // Clear the state cookie
  response.cookies.delete('qbo_oauth_state')
  return response
}
