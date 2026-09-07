import { describe, it, expect, afterEach } from 'vitest'
import { ownerEmails, isOwnerEmail } from './owner'

const ORIGINAL = process.env.OWNER_EMAIL

function setEnv(value: string | undefined) {
  if (value === undefined) delete process.env.OWNER_EMAIL
  else process.env.OWNER_EMAIL = value
}

afterEach(() => setEnv(ORIGINAL))

describe('ownerEmails', () => {
  it('returns [] when OWNER_EMAIL is unset', () => {
    setEnv(undefined)
    expect(ownerEmails()).toEqual([])
  })

  it('splits, trims and lowercases a comma list', () => {
    setEnv('Julian@Example.com,  freddy@example.com ')
    expect(ownerEmails()).toEqual(['julian@example.com', 'freddy@example.com'])
  })

  it('drops empty entries from a ragged list', () => {
    setEnv(',,julian@example.com,,')
    expect(ownerEmails()).toEqual(['julian@example.com'])
  })
})

describe('isOwnerEmail', () => {
  describe('the anti-lockout fallback', () => {
    // Deliberate: an unset var must not lock the owner out of a live business
    // tool. Disabled signups and RLS are the real control. If this test starts
    // failing, that trade-off was changed on purpose or by accident — check.
    it('allows any authenticated user when OWNER_EMAIL is unset', () => {
      setEnv(undefined)
      expect(isOwnerEmail('anyone@example.com')).toBe(true)
    })

    it('allows any authenticated user when OWNER_EMAIL is empty', () => {
      setEnv('')
      expect(isOwnerEmail('anyone@example.com')).toBe(true)
    })

    it('allows any authenticated user when OWNER_EMAIL is only commas', () => {
      setEnv(', ,')
      expect(isOwnerEmail('anyone@example.com')).toBe(true)
    })
  })

  describe('with an allowlist configured', () => {
    it('admits a listed address', () => {
      setEnv('julian@example.com')
      expect(isOwnerEmail('julian@example.com')).toBe(true)
    })

    it('admits any member of a comma list', () => {
      setEnv('julian@example.com,juan@example.com')
      expect(isOwnerEmail('juan@example.com')).toBe(true)
    })

    it('rejects an address that is not listed', () => {
      setEnv('julian@example.com')
      expect(isOwnerEmail('stranger@example.com')).toBe(false)
    })

    it('ignores case on both sides', () => {
      setEnv('Julian@Example.COM')
      expect(isOwnerEmail('JULIAN@example.com')).toBe(true)
    })

    it('ignores surrounding whitespace on both sides', () => {
      setEnv('  julian@example.com  ')
      expect(isOwnerEmail(' julian@example.com ')).toBe(true)
    })

    it('rejects a null or undefined email', () => {
      setEnv('julian@example.com')
      expect(isOwnerEmail(undefined)).toBe(false)
      expect(isOwnerEmail(null)).toBe(false)
    })

    it('rejects an empty email rather than matching a blank entry', () => {
      setEnv('julian@example.com')
      expect(isOwnerEmail('')).toBe(false)
    })
  })
})
