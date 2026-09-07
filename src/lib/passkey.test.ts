import { describe, it, expect } from 'vitest'
import { passkeyErrorMessage, passkeysSupported } from './passkey'

describe('passkeyErrorMessage', () => {
  it('returns nothing when there is no error', () => {
    expect(passkeyErrorMessage(null)).toBeNull()
    expect(passkeyErrorMessage(undefined)).toBeNull()
  })

  it('stays silent when the user dismisses the OS prompt', () => {
    // Cancelling is the most common outcome and is not a failure. Showing
    // "NotAllowedError" for it teaches people to distrust the button.
    expect(passkeyErrorMessage({ name: 'NotAllowedError' })).toBeNull()
    expect(passkeyErrorMessage({ name: 'AbortError' })).toBeNull()
  })

  it('stays silent when the cancellation is only in the message', () => {
    // supabase-js wraps the DOMException, so the name is not always preserved.
    expect(passkeyErrorMessage({ message: 'NotAllowedError: request aborted' })).toBeNull()
  })

  it('explains a project that has not enabled passkeys', () => {
    expect(passkeyErrorMessage({ code: 'passkey_disabled' })).toMatch(/not enabled/i)
  })

  it('explains an unregistered credential without dead-ending the user', () => {
    const msg = passkeyErrorMessage({ code: 'webauthn_credential_not_found' })
    expect(msg).toMatch(/password/i)
  })

  it('explains a duplicate registration', () => {
    expect(passkeyErrorMessage({ code: 'webauthn_credential_exists' })).toMatch(/already/i)
  })

  it('treats both challenge failures as a timeout', () => {
    expect(passkeyErrorMessage({ code: 'webauthn_challenge_expired' })).toMatch(/too long/i)
    expect(passkeyErrorMessage({ code: 'webauthn_challenge_not_found' })).toMatch(/too long/i)
  })

  it('falls back to the raw message for an unmapped code', () => {
    expect(passkeyErrorMessage({ code: 'something_new', message: 'Boom' })).toBe('Boom')
  })

  it('never returns an empty string for a real failure', () => {
    expect(passkeyErrorMessage({ code: 'something_new' })).toBe('Passkey sign-in failed.')
  })
})

describe('passkeysSupported', () => {
  it('is false in a non-browser environment', () => {
    // vitest runs with environment 'node', so this is the SSR path — the
    // login button must not render before hydration.
    expect(passkeysSupported()).toBe(false)
  })
})
