'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Check, ChevronDown, TriangleAlert, X } from 'lucide-react'
import { useHaptics } from '@/lib/hq/haptics'
import {
  FIELD_KEYS,
  completedCount,
  clearDraft,
  emptyDraft,
  loadDraft,
  mergeServerDraft,
  cityOrZipPayload,
  normalizeTenDigits,
  saveDraft,
  type CaptureDraft,
  type FieldKey,
} from '@/lib/hq/capture-draft'
import { ChecklistRow, type RowSpec } from './ChecklistRow'
import type { DuplicateMatch } from '@/app/api/hq/leads/lookup/route'

const ROWS: RowSpec[] = [
  { key: 'phone', label: 'Phone · saves the lead', inputMode: 'tel', placeholder: '(254) 555-0118' },
  { key: 'name', label: 'Name', inputMode: 'text', placeholder: 'Who is calling' },
  {
    key: 'service',
    label: 'Service',
    inputMode: 'text',
    placeholder: 'Carport, garage…',
    options: [
      { value: 'carport', label: 'Carport' },
      { value: 'garage', label: 'Garage' },
      { value: 'barn', label: 'Barn' },
      { value: 'rv_cover', label: 'RV cover' },
      { value: 'other', label: 'Other' },
    ],
  },
  { key: 'size', label: 'Size', inputMode: 'text', placeholder: '20x30x10' },
  { key: 'email', label: 'Email', inputMode: 'email', placeholder: 'Optional' },
  { key: 'city', label: 'City or ZIP', inputMode: 'text', placeholder: 'Temple or 76501' },
  {
    key: 'concrete',
    label: 'Concrete',
    inputMode: 'text',
    placeholder: '',
    options: [
      { value: 'yes', label: 'Needs slab' },
      { value: 'already_have', label: 'Has slab' },
      { value: 'unsure', label: 'Not sure' },
    ],
  },
]



const AUTOSAVE_MS = 400

/**
 * Every save sends the WHOLE field set, not just the field that changed.
 *
 * Over LTE mid-call, requests get dropped. With per-field deltas a dropped
 * PATCH strands that value on the server until the operator happens to edit
 * that same row again — and they will not, because the phone shows it as
 * saved. Sending everything makes the next keystroke anywhere re-sync
 * everything, so the failure heals itself. The payload is a few hundred bytes.
 */
function fullPayload(fields: Partial<Record<FieldKey, string>>, notes: string): Record<string, unknown> {
  const val = (k: FieldKey) => {
    const v = (fields[k] ?? '').trim()
    return v === '' ? null : v
  }
  return {
    phone: val('phone'),
    name: val('name'),
    service_type: val('service'),
    size_raw: val('size'),
    email: val('email'),
    needs_concrete: val('concrete'),
    owner_notes: notes.trim() === '' ? null : notes,
    ...cityOrZipPayload(fields.city ?? ''),
  }
}

export function CaptureScreen({
  initialLeadId,
  initialFields,
  initialNotes,
}: {
  initialLeadId: string | null
  initialFields: Partial<Record<FieldKey, string>>
  initialNotes: string
}) {
  const router = useRouter()
  const haptics = useHaptics()

  const [draft, setDraft] = useState<CaptureDraft>(() => ({
    ...emptyDraft(initialLeadId),
    fields: initialFields,
  }))
  const [notes, setNotes] = useState(initialNotes)
  const [notesOpen, setNotesOpen] = useState(false)
  const [editing, setEditing] = useState<FieldKey | null>(null)
  const [restoredCaret, setRestoredCaret] = useState<number | null>(null)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [offline, setOffline] = useState(false)
  const [dupes, setDupes] = useState<DuplicateMatch[] | null>(null)
  const [dupAck, setDupAck] = useState(false)
  const [tick, setTick] = useState(0)

  const leadIdRef = useRef<string | null>(initialLeadId)
  const stateRef = useRef({ fields: initialFields, notes: initialNotes })
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const creating = useRef(false)
  const firstSaveDone = useRef(initialLeadId != null)

  // ── Reopen: the local mirror is newer than the server for anything still
  // queued, because the server never acknowledged those. Everything else
  // defers to the row, which may have been edited from the lead detail screen.
  useEffect(() => {
    const local = loadDraft(initialLeadId, window.localStorage)
    if (!local) return
    const merged = mergeServerDraft(local, initialFields)
    setDraft(merged)
    setSavedAt(merged.savedAt)
    if (merged.focused) {
      setEditing(merged.focused)
      setRestoredCaret(merged.caret)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // "Saved 3s ago" has to keep counting while nothing else happens.
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000)
    return () => clearInterval(t)
  }, [])

  /** Synchronous, and deliberately not inside the debounce. */
  const mirror = useCallback((next: CaptureDraft) => {
    saveDraft(next, window.localStorage)
  }, [])

  const patch = useCallback(async (id: string, payload: Record<string, unknown>) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(String(res.status))
      setOffline(false)
      const now = Date.now()
      setSavedAt(now)
      setDraft((d) => {
        // The whole set went, so nothing is outstanding any more.
        const next = { ...d, savedAt: now, pending: [] }
        mirror(next)
        return next
      })
    } catch {
      // The service worker sends every non-GET through NetworkOnly, so this is
      // the normal offline path. The value is already on the phone; say so
      // honestly rather than claiming a save that did not happen.
      setOffline(true)
    }
  }, [mirror])

  /** Ten digits buys the row. Everything after that is a PATCH. */
  const ensureLead = useCallback(async (phone: string): Promise<string | null> => {
    if (leadIdRef.current) return leadIdRef.current
    if (creating.current) return null
    creating.current = true
    try {
      const res = await fetch('/api/hq/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      if (!res.ok) throw new Error(String(res.status))
      const body = (await res.json()) as { id: string }
      leadIdRef.current = body.id
      setDraft((d) => {
        const next = { ...d, leadId: body.id }
        // Re-key the mirror, and drop the "new" copy so a later capture does
        // not reopen this one.
        mirror(next)
        clearDraft(null, window.localStorage)
        return next
      })
      if (!firstSaveDone.current) {
        firstSaveDone.current = true
        haptics.success()
      }
      setSavedAt(Date.now())
      setOffline(false)
      // replace, not push: the back button should leave capture, not walk
      // through its own URL history.
      router.replace(`/hq/capture?id=${body.id}`)
      return body.id
    } catch {
      setOffline(true)
      return null
    } finally {
      creating.current = false
    }
  }, [haptics, mirror, router])

  const lookupDupes = useCallback(async (phone: string) => {
    try {
      const res = await fetch(`/api/hq/leads/lookup?phone=${encodeURIComponent(phone)}`)
      if (!res.ok) return
      const body = (await res.json()) as { matches: DuplicateMatch[] }
      if (body.matches.length > 0) {
        setDupes(body.matches)
        haptics.warn()
      } else {
        setDupes(null)
      }
    } catch {
      /* a duplicate we failed to look up must never block typing */
    }
  }, [haptics])

  const setField = useCallback(
    (key: FieldKey, value: string) => {
      setDraft((d) => {
        const next: CaptureDraft = {
          ...d,
          fields: { ...d.fields, [key]: value },
          pending: d.pending.includes(key) ? d.pending : [...d.pending, key],
          focused: key,
        }
        mirror(next) // ← before the network, every keystroke
        return next
      })

      const existing = timers.current.get(key)
      if (existing) clearTimeout(existing)
      timers.current.set(
        key,
        setTimeout(async () => {
          if (key === 'phone') {
            const digits = normalizeTenDigits(value)
            if (!digits) return
            const id = await ensureLead(value)
            if (id) void patch(id, fullPayload(stateRef.current.fields, stateRef.current.notes))
            void lookupDupes(value)
            return
          }
          const id = leadIdRef.current
          if (!id) return // no row yet — the mirror is holding it
          void patch(id, fullPayload(stateRef.current.fields, stateRef.current.notes))
        }, AUTOSAVE_MS),
      )
    },
    [ensureLead, lookupDupes, mirror, patch],
  )

  const saveNotes = useCallback(
    (value: string) => {
      setNotes(value)
      const existing = timers.current.get('__notes')
      if (existing) clearTimeout(existing)
      timers.current.set(
        '__notes',
        setTimeout(() => {
          const id = leadIdRef.current
          if (id) void patch(id, fullPayload(stateRef.current.fields, stateRef.current.notes))
        }, AUTOSAVE_MS),
      )
    },
    [patch],
  )

  // Kept current so a flush always sends the latest values, not the ones
  // captured when its timer was set.
  useEffect(() => {
    stateRef.current = { fields: draft.fields, notes }
  }, [draft.fields, notes])

  useEffect(() => () => timers.current.forEach((t) => clearTimeout(t)), [])

  const done = completedCount(draft.fields)
  const savedLabel = useMemo(() => {
    void tick
    if (offline) return 'Saved on this phone'
    if (!savedAt) return 'Nothing to lose'
    const s = Math.max(0, Math.round((Date.now() - savedAt) / 1000))
    if (s < 3) return 'Saved just now'
    if (s < 60) return `Saved ${s}s ago`
    return `Saved ${Math.round(s / 60)}m ago`
  }, [savedAt, offline, tick])

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between gap-3 pt-1">
        <h1 className="font-display text-[30px] font-bold uppercase leading-none tracking-[0.03em] text-(--text-primary)">
          New lead
        </h1>
        <Link
          href="/hq"
          aria-label="Close capture"
          className="tap-solid flex h-9 w-9 items-center justify-center rounded-md bg-(--surface-3) text-(--text-secondary)"
        >
          <X size={19} strokeWidth={2.2} />
        </Link>
      </div>

      {/* Progress — how much of the call you have actually written down. */}
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <span className="font-display text-[14px] font-semibold uppercase tracking-[0.1em] text-(--text-secondary)">
          {done} of {FIELD_KEYS.length} details
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-(--text-tertiary)">
          {!offline && savedAt ? (
            <Check size={13} strokeWidth={3} className="text-(--brand-fg)" aria-hidden />
          ) : null}
          {savedLabel}
        </span>
      </div>
      <div className="mt-2 grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${FIELD_KEYS.length}, 1fr)` }}>
        {FIELD_KEYS.map((k) => (
          <span
            key={k}
            className={`h-[5px] rounded-[2px] ${
              (draft.fields[k] ?? '').trim() !== '' ? 'bg-(--brand-fg)' : 'bg-(--surface-3)'
            }`}
          />
        ))}
      </div>

      {dupes && !dupAck && (
        <div className="relative mt-4 overflow-hidden rounded-md border border-(--hq-red)/40 bg-(--hq-red)/10 p-3.5">
          <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-(--urgent-bg)" />
          <div className="flex items-center gap-2 pl-2">
            <TriangleAlert size={15} strokeWidth={2.4} className="text-(--urgent-bg)" aria-hidden />
            <span className="font-display text-[15px] font-bold uppercase tracking-[0.1em] text-(--urgent-bg)">
              Already in HQ
            </span>
          </div>
          <ul className="mt-2 space-y-1.5 pl-2">
            {dupes.map((m) => (
              <li key={`${m.kind}-${m.id}`} className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-[15px] text-(--text-primary)">
                  {m.name ?? 'Unnamed'}
                  <span className="ml-2 font-mono text-[11px] uppercase text-(--text-tertiary)">
                    {m.kind}
                    {m.detail ? ` · ${m.detail}` : ''}
                  </span>
                </span>
                <Link
                  href={m.href}
                  className="tap-solid shrink-0 rounded-sm bg-(--brand-fg) px-3 py-1.5 font-display text-[15px] font-bold uppercase tracking-[0.04em] text-(--text-on-brand)"
                >
                  Open
                </Link>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              setDupAck(true)
              const id = leadIdRef.current
              if (id) void patch(id, { dup_ack: true })
            }}
            className="tap-solid mt-2.5 ml-2 rounded-sm border border-(--border-strong) px-3 py-1.5 font-display text-[15px] font-semibold uppercase tracking-[0.04em] text-(--text-primary)"
          >
            New anyway
          </button>
        </div>
      )}

      {/* Scratchpad first: what the caller says does not arrive in field order. */}
      <div className="mt-4 rounded-md border border-(--border-subtle) bg-(--surface-2)">
        <button
          type="button"
          onClick={() => setNotesOpen((o) => !o)}
          className="tap-list flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        >
          <span className="font-display text-[14px] font-semibold uppercase tracking-[0.1em] text-(--text-secondary)">
            Notes from the call
          </span>
          <ChevronDown
            size={18}
            strokeWidth={2.2}
            className={`shrink-0 text-(--text-tertiary) transition-transform ${notesOpen ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </button>
        {notesOpen ? (
          <textarea
            value={notes}
            onChange={(e) => saveNotes(e.target.value)}
            rows={6}
            placeholder="Anything they said — you can sort it out after."
            className="w-full resize-none border-t border-(--border-subtle) bg-transparent px-4 py-3 text-[15px] leading-relaxed text-(--text-primary) outline-none placeholder:text-(--text-tertiary)"
          />
        ) : notes.trim() ? (
          <p className="line-clamp-2 border-t border-(--border-subtle) px-4 py-3 text-[15px] text-(--text-secondary)">
            {notes}
          </p>
        ) : null}
      </div>

      <div className="mt-3.5 overflow-hidden rounded-md border border-(--border-subtle) bg-(--surface-2)">
        {ROWS.map((spec) => (
          <ChecklistRow
            key={spec.key}
            spec={spec}
            emphasized={spec.key === 'phone'}
            value={draft.fields[spec.key] ?? ''}
            editing={editing === spec.key}
            autoFocusCaret={editing === spec.key ? restoredCaret : null}
            onOpen={() => {
              haptics.tap()
              setEditing(spec.key)
              setRestoredCaret(null)
            }}
            onChange={(v) => setField(spec.key, v)}
            onCaret={(pos) =>
              setDraft((d) => {
                const next = { ...d, caret: pos }
                mirror(next)
                return next
              })
            }
            onCommit={() => {
              setEditing(null)
              setDraft((d) => {
                const next = { ...d, focused: null, caret: null }
                mirror(next)
                return next
              })
            }}
          />
        ))}
      </div>

      <div className="mt-4 space-y-2.5 pb-4">
        <button
          type="button"
          disabled={!leadIdRef.current}
          onClick={() => {
            const id = leadIdRef.current
            if (!id) return
            clearDraft(id, window.localStorage)
            router.push(`/hq/leads/${id}`)
          }}
          className="tap-solid flex h-14 w-full items-center justify-center gap-2 rounded-md bg-(--brand-fg) font-display text-[20px] font-bold uppercase tracking-[0.04em] text-(--text-on-brand) disabled:opacity-40"
        >
          Open the lead <ArrowRight size={19} strokeWidth={2.4} aria-hidden />
        </button>
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/hq"
            className="font-display text-[16px] font-semibold uppercase tracking-[0.06em] text-(--link-fg)"
          >
            Save for later
          </Link>
          <span className="font-mono text-[11px] text-(--text-tertiary)">
            {leadIdRef.current ? 'autosaved' : 'phone number saves it'}
          </span>
        </div>
      </div>
    </div>
  )
}
