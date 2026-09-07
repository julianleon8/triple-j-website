/**
 * Route-handler authorization.
 *
 * The proxy only matches /hq/:path*, so nothing gates /api/* except the routes
 * themselves. These helpers make every one of them enforce the same rule the
 * proxy does — owner, not merely authenticated. Next's own guidance is that the
 * proxy is an optimistic check and not the authorization boundary; this is.
 *
 * Reads go through the cookie-bound anon client; the service-role client
 * bypasses RLS and must never be used to answer "who is this?".
 */

import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { isOwnerEmail } from '@/lib/owner'

/**
 * Exactly one of the two is set, so `if (denied) return denied` narrows `user`
 * to non-null for the rest of the handler — no second round-trip to Supabase
 * just to read `user.id`.
 */
type OwnerCheck =
  | { user: User; denied: null }
  | { user: null; denied: NextResponse }

/**
 * The one auth round-trip. 401 and 403 are kept distinct — "nobody is signed
 * in" and "this account is not allowed here" are different events, and only
 * the second is worth paying attention to in the logs.
 */
export async function checkOwner(): Promise<OwnerCheck> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      user: null,
      denied: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }
  if (!isOwnerEmail(user.email)) {
    return {
      user: null,
      denied: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }
  return { user, denied: null }
}

/**
 * Guard for the routes that only need to know whether to proceed:
 *
 *   const denied = await requireOwner()
 *   if (denied) return denied
 */
export async function requireOwner(): Promise<NextResponse | null> {
  return (await checkOwner()).denied
}

/**
 * The signed-in owner, or null — for routes that answer a failed check with
 * something other than the standard response (a redirect, or a 404 that hides
 * whether the record exists at all).
 */
export async function getOwner(): Promise<User | null> {
  return (await checkOwner()).user
}
