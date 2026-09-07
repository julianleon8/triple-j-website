/**
 * Passkey (WebAuthn) helpers shared by the login page and HQ settings.
 *
 * Kept free of Supabase imports so the message mapping can be unit-tested
 * without a client or a browser.
 */

import { useSyncExternalStore } from 'react'

/**
 * Whether this browser can do WebAuthn at all.
 *
 * Called during render, so it must tolerate SSR — `window` is undefined on the
 * server and the passkey button simply does not render until hydration.
 */
export function passkeysSupported(): boolean {
  return typeof window !== 'undefined' && typeof window.PublicKeyCredential === 'function'
}

/** WebAuthn support never changes within a page, so there is nothing to subscribe to. */
const noopSubscribe = () => () => {}

/**
 * `passkeysSupported()` as a render-safe hook.
 *
 * The server snapshot is always false, so the passkey affordance is absent in
 * the HTML and appears on hydration. useSyncExternalStore rather than an
 * effect: React's own guidance (and the `react-hooks/set-state-in-effect`
 * lint) is that "this value differs between server and client" is exactly what
 * this hook is for, and setState-in-effect costs an extra render pass.
 */
export function usePasskeySupport(): boolean {
  return useSyncExternalStore(noopSubscribe, passkeysSupported, () => false)
}

type MaybeError = { code?: string; name?: string; message?: string } | null | undefined

/**
 * Human-readable message for a passkey failure, or **null when the failure is
 * the user simply changing their mind**.
 *
 * Cancelling the OS prompt is by far the most common outcome and is not an
 * error — surfacing "NotAllowedError" for it trains people to distrust the
 * button. The browser reports both a real timeout and a deliberate dismissal
 * as NotAllowedError, so neither can be distinguished; staying quiet is the
 * right call for both.
 */
export function passkeyErrorMessage(error: MaybeError): string | null {
  if (!error) return null

  const code = error.code ?? ''
  const name = error.name ?? ''

  if (name === 'NotAllowedError' || name === 'AbortError') return null
  if (/NotAllowedError|AbortError/.test(error.message ?? '')) return null

  switch (code) {
    case 'passkey_disabled':
      return 'Passkeys are not enabled for this project yet.'
    case 'too_many_passkeys':
      return 'This account already has the maximum number of passkeys.'
    case 'webauthn_credential_exists':
      return 'This device already has a passkey for this account.'
    case 'webauthn_credential_not_found':
      return 'That passkey is not registered. Sign in with your password instead.'
    case 'webauthn_challenge_expired':
    case 'webauthn_challenge_not_found':
      return 'That took too long — try again.'
    case 'webauthn_verification_failed':
      return 'That passkey could not be verified.'
    case 'email_not_confirmed':
    case 'phone_not_confirmed':
      return 'Confirm your email address before using a passkey.'
    case 'user_banned':
      return 'This account is not allowed to sign in.'
    default:
      return error.message || 'Passkey sign-in failed.'
  }
}
