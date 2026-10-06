import { describe, it, expect } from 'vitest'
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import {
  DRAFT_VERSION,
  FIELD_KEYS,
  FIELD_LABELS,
  acknowledge,
  clearDraft,
  completedCount,
  draftHref,
  draftKey,
  draftTitle,
  emptyDraft,
  hasUnsavedWork,
  listUnsavedDrafts,
  isDraftLead,
  loadDraft,
  mergeServerDraft,
  missingCaptureFields,
  normalizeTenDigits,
  cityOrZipPayload,
  parseDraft,
  saveDraft,
  serializeDraft,
  type CaptureDraft,
  type CapturedLead,
  type DraftStore,
} from './capture-draft'

/** Map-backed stand-in for localStorage; node env has no window. */
function fakeStore(initial: Record<string, string> = {}) {
  const m = new Map(Object.entries(initial))
  const store: DraftStore & { map: Map<string, string> } = {
    map: m,
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, v),
    removeItem: (k) => void m.delete(k),
  }
  return store
}

/** The slice of Storage that listUnsavedDrafts walks. */
function listingStore(entries: Record<string, string>): Pick<Storage, 'getItem' | 'key' | 'length'> {
  const keys = Object.keys(entries)
  return {
    length: keys.length,
    key: (i) => keys[i] ?? null,
    getItem: (k) => entries[k] ?? null,
  }
}

/** Safari private mode: setItem throws rather than no-opping. */
const throwingStore: DraftStore = {
  getItem: () => null,
  setItem: () => {
    throw new DOMException('QuotaExceededError')
  },
  removeItem: () => {
    throw new DOMException('nope')
  },
}

describe('the interruption path', () => {
  it('restores the exact value, field and caret after the PWA is killed mid-keystroke', () => {
    const store = fakeStore()
    const typing: CaptureDraft = {
      ...emptyDraft('lead-1'),
      fields: { phone: '2545550118', name: 'Dana Ru' },
      pending: ['name'],
      focused: 'name',
      caret: 7,
    }
    saveDraft(typing, store)

    // …call comes in, iOS tears the app down, operator reopens.
    const restored = loadDraft('lead-1', store)
    expect(restored).not.toBeNull()
    expect(restored!.fields.name).toBe('Dana Ru')
    expect(restored!.focused).toBe('name')
    expect(restored!.caret).toBe(7)
  })

  it('keeps drafts for different leads apart', () => {
    const store = fakeStore()
    saveDraft({ ...emptyDraft('a'), fields: { name: 'A' } }, store)
    saveDraft({ ...emptyDraft('b'), fields: { name: 'B' } }, store)
    expect(loadDraft('a', store)!.fields.name).toBe('A')
    expect(loadDraft('b', store)!.fields.name).toBe('B')
  })

  it('parks a pre-server capture under the "new" key', () => {
    expect(draftKey(null)).toBe('hq_capture_draft:new')
    expect(draftKey('abc')).toBe('hq_capture_draft:abc')
  })

  it('survives a storage backend that throws instead of storing', () => {
    expect(saveDraft(emptyDraft('x'), throwingStore)).toBe(false)
    expect(loadDraft('x', throwingStore)).toBeNull()
    expect(() => clearDraft('x', throwingStore)).not.toThrow()
  })
})

describe('call notes', () => {
  it('survive the PWA being killed before there is a phone number', () => {
    const store = fakeStore()
    saveDraft({ ...emptyDraft(null), notes: '15x21 on the concrete\nHunter Green', notesPending: true }, store)
    const restored = loadDraft(null, store)!
    expect(restored.notes).toBe('15x21 on the concrete\nHunter Green')
    expect(restored.notesPending).toBe(true)
  })

  it('read as empty on a draft saved before notes were mirrored, instead of dropping the draft', () => {
    const legacy = JSON.stringify({ v: DRAFT_VERSION, leadId: 'l1', fields: { name: 'Dana' }, pending: ['name'] })
    const d = parseDraft(legacy)!
    expect(d.fields.name).toBe('Dana')
    expect(d.notes).toBe('')
    expect(d.notesPending).toBe(false)
  })

  it('prefer the phone copy while unacknowledged, the server copy once acknowledged', () => {
    const pending = { ...emptyDraft('l1'), notes: 'newer on the phone', notesPending: true }
    expect(mergeServerDraft(pending, {}, 'older on the server').notes).toBe('newer on the phone')

    const acked = { ...emptyDraft('l1'), notes: 'stale phone copy', notesPending: false }
    expect(mergeServerDraft(acked, {}, 'edited on the lead screen').notes).toBe('edited on the lead screen')

    expect(mergeServerDraft(null, {}, 'server only').notes).toBe('server only')
  })
})

describe('acknowledge', () => {
  it('clears only what the server now holds', () => {
    const d: CaptureDraft = {
      ...emptyDraft('l1'),
      fields: { name: 'Dana', city: 'Temple' },
      pending: ['name', 'city'],
      notes: 'two windows',
      notesPending: true,
    }
    const after = acknowledge(d, { fields: { name: 'Dana', city: 'Temple' }, notes: 'two windows' }, 1000)
    expect(after.pending).toEqual([])
    expect(after.notesPending).toBe(false)
    expect(after.savedAt).toBe(1000)
    expect(hasUnsavedWork(after)).toBe(false)
  })

  it('keeps a row typed into while the request was in flight', () => {
    // Sent "Dan", then the operator finished typing "Dana" before the 2xx.
    const d: CaptureDraft = { ...emptyDraft('l1'), fields: { name: 'Dana' }, pending: ['name'] }
    const after = acknowledge(d, { fields: { name: 'Dan' }, notes: '' }, 1000)
    expect(after.pending).toEqual(['name'])
    expect(hasUnsavedWork(after)).toBe(true)
  })

  it('keeps notes typed into while the request was in flight', () => {
    const d: CaptureDraft = { ...emptyDraft('l1'), notes: 'two windows, gutters', notesPending: true }
    const after = acknowledge(d, { fields: {}, notes: 'two windows' }, 1000)
    expect(after.notesPending).toBe(true)
  })
})

describe('listUnsavedDrafts', () => {
  const draft = (over: Partial<CaptureDraft>) => serializeDraft({ ...emptyDraft(), ...over })

  it('lists only drafts the server has not acknowledged, newest edit first', () => {
    const store = listingStore({
      [draftKey(null)]: draft({ notes: 'caller from Belton', notesPending: true, editedAt: 100 }),
      [draftKey('l1')]: draft({ leadId: 'l1', fields: { name: 'Dana' }, pending: ['name'], editedAt: 300 }),
      [draftKey('l2')]: draft({ leadId: 'l2', fields: { name: 'Saved' }, pending: [], editedAt: 500 }),
      unrelated_key: 'x',
      [draftKey('broken')]: '{"v":1,"fields":',
    })
    const list = listUnsavedDrafts(store)
    expect(list.map((d) => d.leadId)).toEqual(['l1', null])
  })

  it('returns what it has rather than throwing when storage does', () => {
    const store = {
      length: 1,
      key: () => {
        throw new DOMException('SecurityError')
      },
      getItem: () => null,
    }
    expect(listUnsavedDrafts(store)).toEqual([])
  })
})

describe('draftTitle and draftHref', () => {
  it('names a draft by name, then phone, then the first line of the notes', () => {
    expect(draftTitle({ ...emptyDraft(), fields: { name: 'Topliff', phone: '5125550199' } })).toBe('Topliff')
    expect(draftTitle({ ...emptyDraft(), fields: { phone: '5125550199' } })).toBe('5125550199')
    expect(draftTitle({ ...emptyDraft(), notes: '\n  14x20 garage\nBelton' })).toBe('14x20 garage')
    expect(draftTitle(emptyDraft())).toBe('Unnamed call')
  })

  it('reopens a saved lead by id and an unsaved capture on the bare screen', () => {
    expect(draftHref(emptyDraft('l1'))).toBe('/hq/capture?id=l1')
    expect(draftHref(emptyDraft(null))).toBe('/hq/capture')
  })
})

describe('parseDraft never throws', () => {
  it.each([
    ['null input', null],
    ['empty string', ''],
    ['truncated JSON', '{"v":1,"fields":{"name":"Da'],
    ['not an object', '"hello"'],
    ['literal null', 'null'],
    ['an array', '[]'],
    ['a stale version', JSON.stringify({ ...emptyDraft(), v: 0 })],
    ['a missing fields bag', JSON.stringify({ v: DRAFT_VERSION })],
    ['fields as an array', JSON.stringify({ v: DRAFT_VERSION, fields: [] })],
  ])('returns null for %s', (_label, raw) => {
    expect(parseDraft(raw as string | null)).toBeNull()
  })

  it('drops unknown keys and non-string values rather than trusting them', () => {
    const raw = JSON.stringify({
      v: DRAFT_VERSION,
      leadId: 'l1',
      fields: { name: 'Dana', bogus: 'x', size: 42 },
      pending: ['name', 'nonsense'],
      focused: 'nonsense',
      caret: 'nope',
    })
    const d = parseDraft(raw)!
    expect(d.fields).toEqual({ name: 'Dana' })
    expect(d.pending).toEqual(['name'])
    expect(d.focused).toBeNull()
    expect(d.caret).toBeNull()
  })

  it('round-trips a full draft', () => {
    const d: CaptureDraft = {
      ...emptyDraft('l9'),
      fields: { phone: '2545550118', name: 'Dana', service: 'carport' },
      pending: ['service'],
      savedAt: 1_725_000_000_000,
      focused: 'service',
      caret: 3,
    }
    expect(parseDraft(serializeDraft(d))).toEqual(d)
  })
})

describe('mergeServerDraft', () => {
  it('prefers the phone for fields the server never acknowledged', () => {
    const local: CaptureDraft = {
      ...emptyDraft('l1'),
      fields: { name: 'Dana Ruiz', city: 'Temple' },
      pending: ['name'],
    }
    const merged = mergeServerDraft(local, { name: 'Dana', city: 'Belton' })
    expect(merged.fields.name).toBe('Dana Ruiz') // pending — local wins
    expect(merged.fields.city).toBe('Belton') // acknowledged — server wins
  })

  it('falls back to the server copy when there is no local draft', () => {
    const merged = mergeServerDraft(null, { name: 'Dana' })
    expect(merged.fields).toEqual({ name: 'Dana' })
    expect(merged.pending).toEqual([])
  })
})

describe('completedCount', () => {
  it('counts only non-blank fields', () => {
    expect(completedCount({})).toBe(0)
    expect(completedCount({ phone: '2545550118' })).toBe(1)
    expect(completedCount({ phone: '2545550118', name: '   ' })).toBe(1)
    expect(completedCount(Object.fromEntries(FIELD_KEYS.map((k) => [k, 'x'])))).toBe(7)
  })
})

describe('isDraftLead mirrors migration 033', () => {
  // (name is null or service_type is null) — size is deliberately excluded.
  it.each([
    ['phone only', null, null, true],
    ['name but no service', 'Dana', null, true],
    ['service but no name', null, 'carport', true],
    ['both present', 'Dana', 'carport', false],
    ['empty strings are not null — the DB would agree', '', '', false],
  ])('%s', (_l, name, service_type, expected) => {
    expect(isDraftLead({ name, service_type })).toBe(expected)
  })
})

describe('normalizeTenDigits', () => {
  it.each([
    ['254-555-0118', '2545550118'],
    ['(254) 555-0118', '2545550118'],
    ['+1 254 555 0118', '2545550118'],
    ['12545550118', '2545550118'],
  ])('%s -> %s', (raw, expected) => {
    expect(normalizeTenDigits(raw)).toBe(expected)
  })

  it.each([['', null], ['254555', null], ['abc', null]])('rejects %s', (raw, expected) => {
    expect(normalizeTenDigits(raw as string)).toBe(expected)
  })
})

describe('test-collection guard', () => {
  // vitest.config.ts includes `src/**/*.test.ts` only, in a node environment.
  // A `.test.tsx` file is collected by nothing and passes by never running,
  // which is a silent hole rather than a failure. Fail loudly instead.
  it('has no .test.tsx anywhere under src/', () => {
    const found: string[] = []
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        const p = join(dir, entry)
        if (statSync(p).isDirectory()) walk(p)
        else if (entry.endsWith('.test.tsx')) found.push(p)
      }
    }
    walk('src')
    expect(found).toEqual([])
  })
})

describe('cityOrZipPayload keeps ZIPs out of leads.city', () => {
  it('sends a five-digit value as a ZIP, never as a city', () => {
    expect(cityOrZipPayload('76501')).toEqual({ zip: '76501', city: null })
    expect(cityOrZipPayload('76501-1234')).toEqual({ zip: '76501-1234', city: null })
  })

  it('sends a name as a city', () => {
    expect(cityOrZipPayload('Temple')).toEqual({ city: 'Temple' })
    expect(cityOrZipPayload('  Round Rock ')).toEqual({ city: 'Round Rock' })
  })

  it('clears both columns when the row is emptied', () => {
    expect(cityOrZipPayload('')).toEqual({ city: null, zip: null })
    expect(cityOrZipPayload('   ')).toEqual({ city: null, zip: null })
  })

  it('never returns a city that is all digits', () => {
    for (const v of ['76501', '78664', '00000', '76501-1234']) {
      expect(cityOrZipPayload(v).city).toBeNull()
    }
  })
})

describe('missingCaptureFields', () => {
  const full: CapturedLead = {
    phone: '5125551234',
    name: 'Ana',
    service_type: 'carport',
    size_raw: '20x30',
    email: 'a@b.com',
    city: 'Killeen',
    zip: '76542',
    needs_concrete: 'yes',
  }
  const empty: CapturedLead = {
    phone: null, name: null, service_type: null, size_raw: null,
    email: null, city: null, zip: null, needs_concrete: null,
  }

  it('returns nothing when every row is filled', () => {
    expect(missingCaptureFields(full)).toEqual([])
  })

  it('returns every key, in checklist order, when nothing is filled', () => {
    expect(missingCaptureFields(empty)).toEqual([...FIELD_KEYS])
  })

  it('treats whitespace as blank', () => {
    expect(missingCaptureFields({ ...full, name: '   ' })).toEqual(['name'])
  })

  // The city row is one field over two columns — either satisfies it.
  it('accepts a city OR a zip for the city row', () => {
    expect(missingCaptureFields({ ...full, city: null })).toEqual([])
    expect(missingCaptureFields({ ...full, zip: null })).toEqual([])
    expect(missingCaptureFields({ ...full, city: null, zip: null })).toEqual(['city'])
  })

  // needs_concrete is a string enum, not a boolean: every value is an answer.
  it('counts any concrete answer as filled, including "already_have"', () => {
    for (const v of ['yes', 'already_have', 'unsure']) {
      expect(missingCaptureFields({ ...full, needs_concrete: v })).toEqual([])
    }
    expect(missingCaptureFields({ ...full, needs_concrete: null })).toEqual(['concrete'])
  })

  it('agrees with isDraftLead on the two fields that define a draft', () => {
    const missing = missingCaptureFields({ ...full, name: null, service_type: null })
    expect(missing).toContain('name')
    expect(missing).toContain('service')
    expect(isDraftLead({ name: null, service_type: null })).toBe(true)
  })

  it('has a label for every field key', () => {
    for (const k of FIELD_KEYS) expect(FIELD_LABELS[k]).toBeTruthy()
  })
})
