import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { sourceByJurisdiction, type PermitSource } from '@/lib/permit-sources'
import {
  baseHrefOf,
  resolvePdfUrl,
  uploadStampOf,
  reportLabel,
  listReports,
  pickUnseen,
  clampMaxReports,
  DEFAULT_MAX_REPORTS,
  MAX_REPORTS_CEILING,
  splitPermitRows,
  normalizePermitNumber,
  preFilter,
  keepsRow,
  leadClassHint,
  chunk,
  parseJsonArrayLoose,
  hasBudget,
  REPORT_TIME_BUDGET_MS,
  ROWS_PER_CALL,
  reportStalled,
  stallPushDue,
  digestBody,
  emptyClassCounts,
} from './scrape-permits'

const fixture = (name: string) =>
  readFileSync(fileURLToPath(new URL(`./__fixtures__/${name}`, import.meta.url)), 'utf8')

const TEMPLE = sourceByJurisdiction('temple') as PermitSource
const INDEX_HTML = fixture('temple-permitreports.html')
const REPORT_TEXT = fixture('temple-weekly-2026-08-21.txt')

describe('baseHrefOf / resolvePdfUrl', () => {
  it('reads the <base href> Revize pages declare', () => {
    expect(baseHrefOf(INDEX_HTML)).toBe('https://www.templetx.gov/')
    expect(baseHrefOf('<html><head><BASE HREF=\'https://x.test/\'></head></html>')).toBe('https://x.test/')
    expect(baseHrefOf('<html><head></head></html>')).toBeNull()
  })

  it('does not double the path when a root-relative href is resolved against the base', () => {
    // The live 2026-09-07 failure: resolving against the index URL produced
    // …/commissioners_court/county_government/commissioners_court/docs/… → 404.
    const href = 'county_government/commissioners_court/docs/260421spagenda_revised.pdf'
    expect(resolvePdfUrl(href, 'https://www.bellcountytx.com/')).toBe(
      'https://www.bellcountytx.com/county_government/commissioners_court/docs/260421spagenda_revised.pdf',
    )
    // …and shows why the old behaviour was wrong.
    expect(
      resolvePdfUrl(href, 'https://www.bellcountytx.com/county_government/commissioners_court/year_2026.php'),
    ).toContain('/commissioners_court/county_government/')
  })

  it('percent-encodes spaces and keeps ampersands, matching what the server accepts', () => {
    expect(
      resolvePdfUrl('Building Permits & Inspections/Weekly Permit Reports/Aug 21-27.pdf', 'https://www.templetx.gov/'),
    ).toBe('https://www.templetx.gov/Building%20Permits%20&%20Inspections/Weekly%20Permit%20Reports/Aug%2021-27.pdf')
  })

  it('leaves absolute hrefs alone', () => {
    const abs = 'https://cms9files.revize.com/templetx25/x.pdf'
    expect(resolvePdfUrl(abs, 'https://www.templetx.gov/')).toBe(abs)
  })
})

describe('uploadStampOf', () => {
  it('parses the 15-digit Revize stamp as UTC', () => {
    expect(uploadStampOf('?t=202608281048470')?.toISOString()).toBe('2026-08-28T10:48:47.000Z')
  })
  it('accepts a bare 14-digit stamp and other params', () => {
    expect(uploadStampOf('?v=2&t=20260320173140')?.toISOString()).toBe('2026-03-20T17:31:40.000Z')
  })
  it('returns null for nothing, junk, or an impossible date', () => {
    expect(uploadStampOf(undefined)).toBeNull()
    expect(uploadStampOf('')).toBeNull()
    expect(uploadStampOf('?t=abc')).toBeNull()
    expect(uploadStampOf('?t=20261399000000')).toBeNull()
  })
})

describe('reportLabel', () => {
  it('strips the folder, extension and boilerplate prefixes', () => {
    expect(reportLabel('Building Permits & Inspections/Weekly Permit Reports/Aug 21-27.pdf')).toBe('Aug 21-27')
    expect(reportLabel('x/Weekly Report - March 13-19, 2026.pdf')).toBe('March 13-19, 2026')
    expect(reportLabel('City of Temple Weekly Building Permit 3.7.25 - 3.13.25.pdf')).toBe('3.7.25 - 3.13.25')
    expect(reportLabel('City of Temple Weekly Building Permit Report (Sept 20-26, 2024).pdf')).toBe('(Sept 20-26, 2024)')
  })
})

describe('listReports (Temple fixture)', () => {
  const reports = listReports(INDEX_HTML, TEMPLE)

  it('keeps only weekly reports: no monthly totals, no YTD, no newspaper, no charter, no .php', () => {
    expect(reports.map((r) => r.label)).toEqual([
      'Aug 21-27',
      'Aug 14-20',
      'Aug 7 -13',
      'March 13-19, 2026',
      '3.7.25 - 3.13.25',
      'Feb 20-26', // unstamped → after every stamped link, in page order
    ])
  })

  it('orders by upload stamp, newest first', () => {
    expect(reports[0].uploadedAt?.toISOString()).toBe('2026-08-28T10:48:47.000Z')
    expect(reports[1].uploadedAt?.toISOString()).toBe('2026-08-28T10:46:50.000Z')
    expect(reports.at(-1)?.uploadedAt).toBeNull()
  })

  it('resolves every URL against <base href>, decoding &amp;', () => {
    for (const r of reports) expect(r.url.startsWith('https://www.templetx.gov/')).toBe(true)
    expect(reports[2].url).toBe(
      'https://www.templetx.gov/Building%20Permits%20&%20Inspections/Weekly%20Permit%20Reports/Aug%207%20-13.pdf',
    )
  })

  it('collapses a duplicated link to one report', () => {
    expect(reports.filter((r) => r.label === 'Aug 21-27')).toHaveLength(1)
  })

  it('falls back to the index URL when a page has no <base>', () => {
    const html = '<a href="docs/report weekly.pdf?t=202601011200000">x</a>'
    const [only] = listReports(html, TEMPLE)
    expect(only.url).toBe(
      'https://www.templetx.gov/departments/city_departments/building_permits___inspections/docs/report%20weekly.pdf',
    )
  })

  it('returns nothing for a page with no PDF links', () => {
    expect(listReports('<html><body>Just a moment...</body></html>', TEMPLE)).toEqual([])
  })
})

describe('pickUnseen / clampMaxReports', () => {
  const reports = listReports(INDEX_HTML, TEMPLE)

  it('skips reports already in permit_reports and caps the rest, newest first', () => {
    const seen = [reports[0].url, reports[2].url]
    expect(pickUnseen(reports, seen, 2).map((r) => r.label)).toEqual(['Aug 14-20', 'March 13-19, 2026'])
  })

  it('defaults to a small batch so the backlog drains without a spend spike', () => {
    expect(pickUnseen(reports, [])).toHaveLength(DEFAULT_MAX_REPORTS)
    expect(DEFAULT_MAX_REPORTS).toBe(3)
  })

  it('returns nothing when everything has been seen', () => {
    expect(pickUnseen(reports, reports.map((r) => r.url))).toEqual([])
  })

  it('clamps the manual override', () => {
    expect(clampMaxReports(undefined)).toBe(DEFAULT_MAX_REPORTS)
    expect(clampMaxReports('abc')).toBe(DEFAULT_MAX_REPORTS)
    expect(clampMaxReports(0)).toBe(1)
    expect(clampMaxReports('7')).toBe(7)
    expect(clampMaxReports(999)).toBe(MAX_REPORTS_CEILING)
  })
})

describe('splitPermitRows (Temple fixture)', () => {
  const rows = splitPermitRows(REPORT_TEXT)

  it('finds every permit and drops the column header', () => {
    expect(rows).toHaveLength(18)
    expect(rows[0].text.startsWith('FY-26-100-')).toBe(true)
  })

  it('normalises the job id and reads the type code, including hyphenated ones', () => {
    const byCode = Object.fromEntries(rows.map((r) => [r.code, r.permitNumber]))
    expect(byCode.ACRS).toBe('FY-26-132-ACRS') // "FY-26-132- ACRS" in the PDF
    expect(byCode.PW).toBe('FY-26-37-PW') // no space variant
    expect(byCode['RES-FENCE']).toBe('FY-26-117-RES-FENCE')
  })

  it('treats the same number under two codes as two permits', () => {
    // Temple really does this: FY-26-150-MERR and FY-26-150-WT in one report.
    expect(rows.filter((r) => r.permitNumber.startsWith('FY-26-150-')).map((r) => r.code).sort()).toEqual([
      'MERR',
      'WT',
    ])
  })

  it('keeps the whole row on one line', () => {
    for (const r of rows) expect(r.text).not.toMatch(/\n/)
  })
})

describe('preFilter', () => {
  const rows = splitPermitRows(REPORT_TEXT)
  const kept = preFilter(rows)

  it('keeps accessory, addition, flatwork, shop, new-home and commercial rows', () => {
    expect(kept.map((r) => r.code).sort()).toEqual(
      ['ACRL', 'ACRS', 'BAR', 'BCRR', 'DUPX', 'FLAT', 'MFG', 'PW', 'SFR', 'XYZ'].sort(),
    )
  })

  it('drops the trades even when the text mentions a garage', () => {
    const waterHeater = rows.find((r) => r.code === 'PBWH')!
    expect(waterHeater.text).toMatch(/garage/i)
    expect(keepsRow(waterHeater)).toBe(false)
  })

  it('keeps an unknown code on the strength of its description', () => {
    const unknown = rows.find((r) => r.code === 'XYZ')!
    expect(keepsRow(unknown)).toBe(true)
  })

  it('drops fences, pools, roofs, gas tests, irrigation, HVAC, water taps', () => {
    for (const code of ['RES-FENCE', 'POOL', 'ROOF', 'GT', 'PBIR', 'MERR', 'WT']) {
      expect(keepsRow(rows.find((r) => r.code === code)!)).toBe(false)
    }
  })
})

describe('normalizePermitNumber / leadClassHint / chunk', () => {
  it('normalises spacing and case', () => {
    expect(normalizePermitNumber('FY-26-132- ACRS')).toBe('FY-26-132-ACRS')
    expect(normalizePermitNumber(' fy-26-37-pw ')).toBe('FY-26-37-PW')
    expect(normalizePermitNumber(null)).toBeNull()
    expect(normalizePermitNumber('   ')).toBeNull()
  })

  it('hints the class from the code', () => {
    expect(leadClassHint('SFR')).toBe('new_home')
    expect(leadClassHint('DUPX')).toBe('new_home')
    expect(leadClassHint('BCRR')).toBe('commercial')
    expect(leadClassHint('ACRL')).toBe('accessory')
    expect(leadClassHint('XYZ')).toBeNull()
    expect(leadClassHint(null)).toBeNull()
  })

  it('chunks evenly with a remainder', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
    expect(chunk([], 2)).toEqual([])
    expect(chunk([1, 2], 0)).toEqual([[1, 2]])
  })
})

describe('parseJsonArrayLoose', () => {
  it('parses a bare array', () => {
    expect(parseJsonArrayLoose('[{"a":1},{"a":2}]')).toEqual([{ a: 1 }, { a: 2 }])
  })

  it('strips a ```json fence and a prose preamble', () => {
    expect(parseJsonArrayLoose('Here you go:\n```json\n[{"a":1}]\n```\nDone.')).toEqual([{ a: 1 }])
  })

  it('returns null for output truncated mid-array — the first live run', () => {
    const truncated =
      '```json\n[\n  {\n    "permit_number": "FY-26-124-FLAT",\n    "job_type_code": "FLAT",\n' +
      '    "wheelhouse_reasons": ["sidewalk", "not metal"],\n    "lead_class": null,'
    expect(parseJsonArrayLoose(truncated)).toBeNull()
  })

  it('returns null when there is no array at all', () => {
    expect(parseJsonArrayLoose('I could not find any permits.')).toBeNull()
    expect(parseJsonArrayLoose('{"permits": 3}')).toBeNull()
  })
})

describe('time budget and batch size', () => {
  it('leaves a minute of headroom under the 300s maxDuration', () => {
    expect(REPORT_TIME_BUDGET_MS).toBeLessThanOrEqual(240_000)
    expect(hasBudget(0, REPORT_TIME_BUDGET_MS - 1)).toBe(true)
    expect(hasBudget(0, REPORT_TIME_BUDGET_MS)).toBe(false)
  })

  it('keeps batches small enough that a full batch cannot reach the output cap', () => {
    // ~250 output tokens a row; the cap is 16k. 15 rows is ~4k.
    expect(ROWS_PER_CALL).toBeLessThanOrEqual(15)
  })
})

describe('stall detection', () => {
  const uploaded = new Date('2026-08-28T10:48:47.000Z')

  it('is quiet inside the 14-day window and loud after it', () => {
    expect(reportStalled(uploaded, new Date('2026-09-07T14:00:00Z'))).toBe(false)
    expect(reportStalled(uploaded, new Date('2026-09-12T14:00:00Z'))).toBe(true)
  })

  it('does not call an empty listing a stall — that is a different failure', () => {
    expect(reportStalled(null, new Date('2026-09-30T14:00:00Z'))).toBe(false)
  })

  it('pushes only on Mondays while stalled', () => {
    expect(stallPushDue(uploaded, new Date('2026-09-14T14:00:00Z'))).toBe(true) // Monday
    expect(stallPushDue(uploaded, new Date('2026-09-15T14:00:00Z'))).toBe(false) // Tuesday
    expect(stallPushDue(uploaded, new Date('2026-09-07T14:00:00Z'))).toBe(false) // Monday, not stalled
  })
})

describe('digestBody', () => {
  it('reads like a sentence and omits zeros', () => {
    expect(digestBody({ accessory: 3, new_home: 18, commercial: 1 })).toBe('3 accessory · 18 new homes · 1 commercial')
    expect(digestBody({ accessory: 0, new_home: 1, commercial: 0 })).toBe('1 new home')
    expect(digestBody(emptyClassCounts())).toBe('no wheelhouse rows this week')
  })
})
