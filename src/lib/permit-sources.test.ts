import { describe, it, expect } from 'vitest'
import { PDF_HREF_PATTERN, PERMIT_SOURCES, getEnabledSources } from './permit-sources'

/** Mirrors how fetchLatestPdfUrl consumes the pattern. */
function hrefs(html: string): string[] {
  const out = new Set<string>()
  for (const m of html.matchAll(PDF_HREF_PATTERN)) out.add(m[1])
  return [...out]
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

  it('strips a cache-busting query string from the capture', () => {
    // The second half of the same bug. ?t=... must not reach the capture
    // group: inferDateFromPath and looksLikeReport both read the filename.
    expect(hrefs('<a href="docs/260105agenda.pdf?t=202601141218480">Agenda</a>')).toEqual([
      'docs/260105agenda.pdf',
    ])
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

  it('enables only sources reachable without a headless browser', () => {
    // Harker Heights went behind Cloudflare (403) and Temple's listing is
    // JS-hydrated; both are disabled until the Firecrawl work lands.
    expect(getEnabledSources().map((s) => s.jurisdiction)).toEqual(['bell_county'])
  })
})
