/**
 * Server-side hCaptcha token verifier.
 *
 * Used by /api/leads and /api/partner-inquiries to validate the captcha token
 * produced by the `@hcaptcha/react-hcaptcha` widget before accepting a form
 * submission.
 *
 * Dev escape hatch: if HCAPTCHA_SECRET_KEY is not set (typical in a dev
 * environment without the key), verification is SKIPPED and treated as
 * successful. Production MUST have the env var set — `vercel env ls` should
 * always show HCAPTCHA_SECRET_KEY present. This skip-if-unset pattern means
 * every dev can run `npm run dev` and exercise the form without needing their
 * own hCaptcha account.
 */

type HCaptchaResponse = {
  success: boolean
  'error-codes'?: string[]
  challenge_ts?: string
  hostname?: string
}

export type CaptchaVerifyResult = {
  success: boolean
  /** Reason codes if failure — useful for logging but don't surface to end users. */
  errorCodes?: string[]
  /** True when verification was skipped because HCAPTCHA_SECRET_KEY is unset. */
  skipped?: boolean
}

export async function verifyHCaptchaToken(
  token: string | null | undefined,
  remoteIp?: string | null,
): Promise<CaptchaVerifyResult> {
  const secret = process.env.HCAPTCHA_SECRET_KEY
  if (!secret) {
    // Gated on the *public* site key rather than NODE_ENV, deliberately.
    //
    // If the site key is unset the widget never renders, so there is no token to
    // verify and failing closed here would reject every legitimate lead. If the
    // site key IS set, the form is showing a captcha the server isn't checking —
    // that's the dangerous half-configured state, and it fails closed.
    if (process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY) {
      console.error(
        '[captcha] site key configured but HCAPTCHA_SECRET_KEY is missing — rejecting submission'
      )
      return { success: false, errorCodes: ['missing-secret'] }
    }
    console.warn('[captcha] hCaptcha not configured — skipping verification')
    return { success: true, skipped: true }
  }

  if (!token || typeof token !== 'string') {
    return { success: false, errorCodes: ['missing-input-response'] }
  }

  const body = new URLSearchParams({ secret, response: token })
  if (remoteIp) body.set('remoteip', remoteIp)

  try {
    const res = await fetch('https://api.hcaptcha.com/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      // Don't let a hCaptcha outage pin the request indefinitely.
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) {
      return { success: false, errorCodes: [`hcaptcha-http-${res.status}`] }
    }
    const data = (await res.json()) as HCaptchaResponse
    if (data.success) return { success: true }
    return { success: false, errorCodes: data['error-codes'] ?? ['unknown'] }
  } catch (err) {
    // Network timeout or DNS failure — treat as failure rather than silently
    // pass. A real hCaptcha outage is rare; if it happens and this blocks
    // legitimate submissions, the fix is to temporarily unset
    // HCAPTCHA_SECRET_KEY in Vercel, which re-enables the skip path.
    console.error('[captcha] verify failed:', err)
    return { success: false, errorCodes: ['network-error'] }
  }
}
