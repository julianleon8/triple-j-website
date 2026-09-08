import { describe, it, expect } from 'vitest'
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import {
  DRAFT_VERSION,
  FIELD_KEYS,
  clearDraft,
  completedCount,
  draftKey,
  emptyDraft,
  isDraftLead,
  loadDraft,
  mergeServerDraft,
  normalizeTenDigits,
  cityOrZipPayload,
  parseDraft,
  saveDraft,
  serializeDraft,
  type CaptureDraft,
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
