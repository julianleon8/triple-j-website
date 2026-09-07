import { createBrowserClient } from '@supabase/ssr'

/**
 * Browser Supabase client.
 *
 * `experimental.passkey` opts into WebAuthn. Without it every method on
 * `auth.passkey`, plus `registerPasskey()` and `signInWithPasskey()`, throws.
 * Supabase ships passkeys as experimental and reserves the right to change the
 * API without a major version, so treat a supabase-js upgrade as something to
 * re-test the login page against rather than a routine bump.
 *
 * Requires supabase-js >= 2.105.0.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        experimental: { passkey: true },
      },
    },
  )
}
