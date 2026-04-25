/**
 * Twilio SMS client (stub).
 *
 * Mirrors the CallRail pattern from src/lib/call-tracking.ts: build the
 * infrastructure now, leave credentials unprovisioned, return a clean
 * 503 with setup instructions until env vars land.
 *
 * When a Twilio account is created:
 *   1. Drop these into Vercel Production env (and .env.local for dev):
 *        TWILIO_ACCOUNT_SID
 *        TWILIO_AUTH_TOKEN
 *        TWILIO_FROM_NUMBER     (the phone number messages send from)
 *   2. That's it. sendSms() picks up the env vars and starts shipping.
 *      No code changes required.
 *
 * No npm dependency yet — uses fetch + basic-auth against the Twilio
 * REST API. If Twilio's official Node SDK is later preferred, swap
 * in `import twilio from 'twilio'` and re-implement sendSms's body.
 *
 * See docs/QUOTE-CALCULATOR.md for the wiring path.
 */

export type SmsResult =
  | { ok: true; sid: string }
  | { ok: false; reason: 'not_configured'; message: string }
  | { ok: false; reason: 'send_failed'; message: string; status?: number }

export type SmsRequest = {
  /** E.164 destination number, e.g. "+12545551234". */
  to: string
  /** SMS body. ≤1600 chars per Twilio; we hard-cap at 1500 for safety margin. */
  body: string
}

const ENDPOINT = (sid: string) =>
  `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`

function loadConfig(): { sid: string; token: string; from: string } | null {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim()
  const token = process.env.TWILIO_AUTH_TOKEN?.trim()
  const from = process.env.TWILIO_FROM_NUMBER?.trim()
  if (!sid || !token || !from) return null
  return { sid, token, from }
}

export function isTwilioConfigured(): boolean {
  return loadConfig() !== null
}

/** Normalize a US-shape phone string to E.164 (+1XXXXXXXXXX). */
export function toE164(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  if (raw.startsWith('+') && digits.length >= 10) return `+${digits}`
  return null
}

export async function sendSms({ to, body }: SmsRequest): Promise<SmsResult> {
  const cfg = loadConfig()
  if (!cfg) {
    return {
      ok: false,
      reason: 'not_configured',
      message:
        'Twilio is not configured. Set TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + ' +
        'TWILIO_FROM_NUMBER in Vercel Production env. See docs/QUOTE-CALCULATOR.md.',
    }
  }

  const trimmedBody = body.length > 1500 ? body.slice(0, 1497) + '...' : body

  const params = new URLSearchParams()
  params.set('To', to)
  params.set('From', cfg.from)
  params.set('Body', trimmedBody)

  const auth = Buffer.from(`${cfg.sid}:${cfg.token}`).toString('base64')

  let res: Response
  try {
    res = await fetch(ENDPOINT(cfg.sid), {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })
  } catch (err) {
    return {
      ok: false,
      reason: 'send_failed',
      message: err instanceof Error ? err.message : 'Twilio request failed',
    }
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    return {
      ok: false,
      reason: 'send_failed',
      status: res.status,
      message: `Twilio API ${res.status}: ${text.slice(0, 200)}`,
    }
  }

  const data = (await res.json().catch(() => ({}))) as { sid?: string }
  if (!data.sid) {
    return { ok: false, reason: 'send_failed', message: 'Twilio response missing sid' }
  }
  return { ok: true, sid: data.sid }
}
