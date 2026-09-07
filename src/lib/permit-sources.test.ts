import { describe, it, expect } from 'vitest'
import { PDF_HREF_PATTERN, PERMIT_SOURCES, getEnabledSources } from './permit-sources'

/** Mirrors how listReports consumes the pattern: group 1 is the path. */
function hrefs(html: string): string[] {
  const out = new Set<string>()
  for (const m of html.matchAll(PDF_HREF_PATTERN)) out.add(m[1])
  return [...out]
}

/** Group 2 is the query string, kept for the upload stamp. */
function queries(html: string): (string | undefined)[] {
  return [...html.matchAll(PDF_HREF_PATTERN)].map((m) => m[2])
}

describe('PDF_HREF_PATTERN', () => {
  it('matches a plain href', () => {
    expect(hrefs('<a href="docs/260105agenda.pdf">Agenda</a>')).toEqual([
      'docs/260105agenda.pdf',
    ])
  })

  it('matches despite a space after href=', () => {
    // Bell County's real markup. The original pattern required the quote
    // immediately after the equals sign and silently matched nothing.
    expect(hrefs('<a href= "docs/260105agenda.pdf" target="_blank">Agenda</a>')).toEqual([
      'docs/260105agenda.pdf',
    ])
  })

  it('keeps the cache-busting query string out of the path capture', () => {
    // ?t=... must not reach the path: the filename is what gets labelled.
    expect(hrefs('<a href="docs/260105agenda.pdf?t=202601141218480">Agenda</a>')).toEqual([
      'docs/260105agenda.pdf',
    ])
  })

  it('captures the query string separately — it is the upload timestamp', () => {
    expect(queries('<a href="docs/260105agenda.pdf?t=202601141218480">Agenda</a>')).toEqual([
      '?t=202601141218480',
    ])
    expect(queries('<a href="docs/260105agenda.pdf">Agenda</a>')).toEqual([undefined])
  })

  it('handles the exact Bell County markup — space and query together', () => {
    const html =
      '<td style="text-align: center; height: 25px;">&nbsp;<a href= ' +
      '"county_government/commissioners_court/docs/260105agenda.pdf?t=202601141218480" ' +
      ' target="_blank"  >Meeting Agenda</a></td>'
    expect(hrefs(html)).toEqual([
      'county_government/commissioners_court/docs/260105agenda.pdf',
    ])
  })

  it('handles the exact Temple markup — spaces, ampersand and parentheses in the path', () => {
    const html =
      '<a href="Building Permits & Inspections/Weekly Permit Reports/Aug 21-27.pdf?t=202608281048470" ' +
      'target="_blank"><span class="fa fa-file-text-o dot-doc" aria-hidden="true"></span>Aug 21-27</a>' +
      '<a href="City of Temple Weekly Building Permit Report (Sept 20-26, 2024).pdf?t=202409271200000">x</a>'
    expect(hrefs(html)).toEqual([
      'Building Permits & Inspections/Weekly Permit Reports/Aug 21-27.pdf',
      'City of Temple Weekly Building Permit Report (Sept 20-26, 2024).pdf',
    ])
  })

  it('matches single-quoted hrefs', () => {
    expect(hrefs("<a href='docs/260120wsagenda.pdf'>WS</a>")).toEqual([
      'docs/260120wsagenda.pdf',
    ])
  })

  it('finds every link on a page, not just the first', () => {
    const html = `
      <a href= "docs/260105agenda.pdf?t=1">a</a>
      <a href="docs/260120agenda.pdf">b</a>
      <a href='docs/260202wsagenda.pdf?t=3'>c</a>`
    expect(hrefs(html)).toHaveLength(3)
  })

  it('ignores non-PDF links', () => {
    expect(hrefs('<a href="agendas_and_minutes.php">Agendas</a>')).toEqual([])
  })

  it('is reusable across sources despite the /g flag', () => {
    // matchAll operates on an internal clone, so lastIndex never advances on
    // the shared instance. If that ever changed, the second source scraped in
    // a run would silently see fewer links than the first.
    const html = '<a href="docs/260105agenda.pdf">a</a>'
    expect(hrefs(html)).toEqual(hrefs(html))
    expect(PDF_HREF_PATTERN.lastIndex).toBe(0)
  })
})

describe('PERMIT_SOURCES', () => {
  it('shares one pattern instance rather than per-source copies', () => {
    for (const s of PERMIT_SOURCES) {
      expect(s.pdfHrefPattern).toBe(PDF_HREF_PATTERN)
    }
  })

  it('has unique jurisdictions', () => {
    const ids = PERMIT_SOURCES.map((s) => s.jurisdiction)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('enables Temple and nothing else', () => {
    // Bell County: scanned PDFs, page stale since April 2026, agendas are not
    // permits. Harker Heights: Cloudflare 403. CivicPlus/Granicus: headless.
    expect(getEnabledSources().map((s) => s.jurisdiction)).toEqual(['temple'])
  })

  it('every source declares a path filter', () => {
    for (const s of PERMIT_SOURCES) {
      expect(s.pathFilter).toBeInstanceOf(RegExp)
    }
  })
})
