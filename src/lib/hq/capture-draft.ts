import { toE164 } from '@/lib/twilio'

/**
 * Capture-screen draft state, kept deliberately free of the DOM.
 *
 * The reliability requirement for /hq/capture is not "autosave works" — it is
 * "an incoming call kills the PWA mid-keystroke and nothing is lost". iOS gives
 * no beforeunload guarantee when it tears down a standalone web app for a call,
 * so the only thing that actually survives is a synchronous localStorage write
 * on every keystroke, made BEFORE the network request rather than after it.
 *
 * That makes this module the load-bearing part of the screen, and vitest here
 * runs in a node environment with no jsdom and collects only `*.test.ts` — a
 * `.test.tsx` would silently never run. So the storage backend is a parameter,
 * not `window.localStorage`, and every rule below is asserted against a fake.
 */

/** The seven checklist rows, in the order the capture screen draws them. */
export const FIELD_KEYS = [
  'phone',
  'name',
  'service',
  'size',
  'email',
  'city',
  'concrete',
] as const

export type FieldKey = (typeof FIELD_KEYS)[number]

/** Bumped only when a shape change would make an old payload misread. */
export const DRAFT_VERSION = 1

export type CaptureDraft = {
  v: number
  /** Server row id once the phone number has bought one; null before that. */
  leadId: string | null
  fields: Partial<Record<FieldKey, string>>
  /** Written locally but not yet acknowledged by a 2xx PATCH. */
  pending: FieldKey[]
  /** Epoch ms of the last acknowledged save; null if nothing has landed. */
  savedAt: number | null
  /** Restored on reopen so the caret lands back where the call interrupted. */
  focused: FieldKey | null
  caret: number | null
}

/** Minimal slice of Storage this module needs — a Map-backed fake satisfies it. */
export type DraftStore = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export function emptyDraft(leadId: string | null = null): CaptureDraft {
  return { v: DRAFT_VERSION, leadId, fields: {}, pending: [], savedAt: null, focused: null, caret: null }
}

/**
 * Per-draft key. A capture that has not reached ten digits has no server row,
 * so it parks under a single "new" key — there can only be one unsaved capture
 * at a time, because starting a second means leaving the screen.
 */
export function draftKey(leadId: string | null): string {
  return `hq_capture_draft:${leadId ?? 'new'}`
}

export function serializeDraft(d: CaptureDraft): string {
  return JSON.stringify(d)
}

/**
 * Never throws. A torn write, a stale shape or a cleared origin all mean the
 * same thing to the caller — there is no usable local draft — and the screen
 * must open on the server copy rather than on an exception.
 */
export function parseDraft(raw: string | null): CaptureDraft | null {
  if (!raw) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (typeof parsed !== 'object' || parsed === null) return null
  const d = parsed as Partial<CaptureDraft>
  if (d.v !== DRAFT_VERSION) return null
  if (typeof d.fields !== 'object' || d.fields === null || Array.isArray(d.fields)) return null

  const fields: Partial<Record<FieldKey, string>> = {}
  for (const k of FIELD_KEYS) {
    const val = (d.fields as Record<string, unknown>)[k]
    if (typeof val === 'string') fields[k] = val
  }
  const pending = Array.isArray(d.pending)
    ? d.pending.filter((k): k is FieldKey => (FIELD_KEYS as readonly string[]).includes(k as string))
    : []

  return {
    v: DRAFT_VERSION,
    leadId: typeof d.leadId === 'string' ? d.leadId : null,
    fields,
    pending,
    savedAt: typeof d.savedAt === 'number' ? d.savedAt : null,
    focused:
      typeof d.focused === 'string' && (FIELD_KEYS as readonly string[]).includes(d.focused)
        ? (d.focused as FieldKey)
        : null,
    caret: typeof d.caret === 'number' ? d.caret : null,
  }
}

/**
 * Best-effort by design. Safari in private mode throws QuotaExceededError from
 * setItem, and a capture screen must not die because the mirror is unavailable
 * — the server copy is still in flight. Returns whether the write landed so the
 * caller can decide what to tell the operator.
 */
export function saveDraft(d: CaptureDraft, store: DraftStore): boolean {
  try {
    store.setItem(draftKey(d.leadId), serializeDraft(d))
    return true
  } catch {
    return false
  }
}

export function loadDraft(leadId: string | null, store: DraftStore): CaptureDraft | null {
  try {
    return parseDraft(store.getItem(draftKey(leadId)))
  } catch {
    return null
  }
}

export function clearDraft(leadId: string | null, store: DraftStore): void {
  try {
    store.removeItem(draftKey(leadId))
  } catch {
    /* nothing to do — a mirror we cannot clear is not worth failing over */
  }
}

/**
 * Reopen reconciliation. A field the phone still has queued (`pending`) is
 * newer than anything the server holds, because the server never acknowledged
 * it. Everything else defers to the server, which may have been edited from
 * the lead detail screen since.
 */
export function mergeServerDraft(
  local: CaptureDraft | null,
  server: Partial<Record<FieldKey, string>>,
): CaptureDraft {
  if (!local) return { ...emptyDraft(), fields: { ...server } }
  const fields: Partial<Record<FieldKey, string>> = { ...server }
  for (const k of local.pending) {
    const v = local.fields[k]
    if (v !== undefined) fields[k] = v
  }
  return { ...local, fields }
}

/** Drives "4 OF 7 DETAILS" and the seven-cell progress bar. */
export function completedCount(fields: Partial<Record<FieldKey, string>>): number {
  return FIELD_KEYS.filter((k) => (fields[k] ?? '').trim() !== '').length
}

/**
 * The TypeScript mirror of migration 033's generated column:
 *   generated always as (name is null or service_type is null) stored
 *
 * Kept in one place so the inbox, Today's count and the database cannot
 * disagree about what a draft is. Size is deliberately not part of it — see
 * the migration's header for why.
 */
export function isDraftLead(lead: { name: string | null; service_type: string | null }): boolean {
  return lead.name === null || lead.service_type === null
}

/**
 * Ten digits, or null. Wraps toE164 rather than re-deriving the rules, so the
 * duplicate lookup and the SMS path can never disagree about what a phone
 * number is. Returns the bare ten digits because that is what the lookup
 * compares against stored values, which are not normalised.
 */
export function normalizeTenDigits(raw: string): string | null {
  const e164 = toE164(raw)
  if (!e164) return null
  const digits = e164.replace(/\D/g, '')
  return digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : null
}

/**
 * The "City or ZIP" checklist row is one field on screen and two columns
 * underneath. `leads.city` must hold a city name or NULL and never a ZIP —
 * `cityFromZip()` is the only thing allowed to populate it, and a ZIP sitting
 * in that column is exactly what migration 028 had to go back and clean up.
 *
 * So a five-digit value is sent as a ZIP and the server derives the city from
 * it; anything else is taken as a city name. Clearing the row clears both.
 */
export function cityOrZipPayload(value: string): Record<string, unknown> {
  const v = value.trim()
  if (v === '') return { city: null, zip: null }
  return /^\d{5}(-\d{4})?$/.test(v) ? { zip: v, city: null } : { city: v }
}

/** How each checklist row reads back on a saved lead. */
export const FIELD_LABELS: Record<FieldKey, string> = {
  phone: 'Phone',
  name: 'Name',
  service: 'Service',
  size: 'Size',
  email: 'Email',
  city: 'City or ZIP',
  concrete: 'Concrete',
}

/** The lead columns each checklist row writes to. */
export type CapturedLead = {
  phone: string | null
  name: string | null
  service_type: string | null
  size_raw: string | null
  email: string | null
  city: string | null
  zip: string | null
  needs_concrete: string | null
}

/**
 * Which checklist rows are still blank on a saved lead, in checklist order.
 *
 * The lead detail screen's "Missing from capture" card renders this, so what
 * counts as missing is defined once and shared with the capture screen rather
 * than re-derived per screen and drifting.
 *
 * `concrete` is a string enum (yes | already_have | unsure), not a boolean —
 * every one of those is a real answer, so only NULL/empty counts as missing.
 * `city` is satisfied by either column, because the checklist row is one field
 * over two (see cityOrZipPayload).
 */
export function missingCaptureFields(lead: CapturedLead): FieldKey[] {
  const blank = (v: string | null) => v === null || v.trim() === ''
  return FIELD_KEYS.filter((k) => {
    switch (k) {
      case 'phone':    return blank(lead.phone)
      case 'name':     return blank(lead.name)
      case 'service':  return blank(lead.service_type)
      case 'size':     return blank(lead.size_raw)
      case 'email':    return blank(lead.email)
      case 'city':     return blank(lead.city) && blank(lead.zip)
      case 'concrete': return blank(lead.needs_concrete)
    }
  })
}
