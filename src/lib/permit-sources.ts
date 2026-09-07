/**
 * Central TX permit data sources for Lead Engine V1.
 *
 * V1 MVP: Revize-CMS jurisdictions only (static HTML + PDF, no headless browser).
 * CivicPlus / Granicus jurisdictions are disabled — require Firecrawl, next session.
 *
 * See `Lead Sources Research.md` at the repo root for the full research dossier.
 */

export type Jurisdiction =
  | 'temple'
  | 'bell_county'
  | 'harker_heights'
  | 'killeen'
  | 'copperas_cove'
  | 'waco'
  | 'mclennan_county'
  | 'belton_pz';

/**
 * Matches the href of a PDF link on a municipal index page.
 *
 * Every source used an inline copy of `/href=["']([^"']+\.pdf)["']/gi`, which
 * silently missed the only links that mattered on Bell County's page:
 *
 *   <a href= "county_government/.../docs/260105agenda.pdf?t=202601141218480">
 *
 * Two separate misses. The markup puts a **space after `href=`**, while the
 * old pattern demanded the quote immediately after the equals sign; and the
 * URL carries a **cache-busting `?t=` query string**, while the old pattern
 * demanded `.pdf` immediately before the closing quote. Between them, all 20
 * commissioners-court agendas were invisible and the scraper reported "no
 * candidate PDFs passed filter" on every run since it was written — a clean
 * HTTP 200 with nothing in it.
 *
 * The query string is matched but deliberately left OUT of the capture group:
 * downstream, `inferDateFromPath` and `looksLikeReport` read the filename, and
 * `?t=...` would corrupt both. The PDF fetches fine without it.
 *
 * Safe to share one RegExp across sources despite the /g flag — String
 * .matchAll() operates on an internal clone and does not advance lastIndex.
 */
export const PDF_HREF_PATTERN = /href\s*=\s*["']([^"']+\.pdf)(?:\?[^"']*)?["']/gi

export type PermitSource = {
  jurisdiction: Jurisdiction;
  label: string;
  indexUrl: string;
  // Matches href attributes of PDF links on the index page.
  pdfHrefPattern: RegExp;
  // Optional base URL to resolve relative hrefs.
  baseUrl?: string;
  reportType: 'weekly_permits' | 'commissioners_court' | 'edr';
  cms: 'revize' | 'joomla' | 'civicplus' | 'granicus';
  enabled: boolean;
};

export const PERMIT_SOURCES: PermitSource[] = [
  {
    jurisdiction: 'temple',
    label: 'City of Temple — Weekly Permit Report',
    // The report exists (cms9files.revize.com/templetx/…/Weekly Report - June 6-June 13, 2025.pdf)
    // but the listing page is a JS-hydrated Revize Document Center accordion — the
    // static HTML has no direct PDF hrefs. Defer to Phase 2 Firecrawl.
    indexUrl:
      'https://www.templetx.gov/departments/city_departments/building_permits___inspections/permitreports.php',
    pdfHrefPattern: PDF_HREF_PATTERN,
    reportType: 'weekly_permits',
    cms: 'revize',
    enabled: false,
  },
  {
    jurisdiction: 'bell_county',
    label: "Bell County — Commissioners' Court Agendas",
    // Per-year listing (filenames follow YYMMDDagenda.pdf under /docs/).
    //
    // Verified 2026-09-07: this URL returns 200 and lists 20 agendas spanning
    // Jan–Apr 2026. `year_2026_1.php` — which an earlier comment here said to
    // alternate to each January — is a 404. Check before swapping; do not
    // assume the alternation.
    indexUrl:
      'https://www.bellcountytx.com/county_government/commissioners_court/year_2026.php',
    pdfHrefPattern: PDF_HREF_PATTERN,
    reportType: 'commissioners_court',
    cms: 'revize',
    enabled: true,
  },
  {
    jurisdiction: 'harker_heights',
    label: 'City of Harker Heights — Economic Development Report',
    // EDR PDFs live at /images/PDF/{Month}_{YYYY}_EDR.pdf, linked from this page.
    //
    // DISABLED 2026-09-07: the host now sits behind a Cloudflare JS challenge
    // and returns 403 ("Just a moment...") to any plain fetch, regardless of
    // User-Agent. fetchLatestPdfUrl throws on !res.ok, so leaving this enabled
    // only manufactured a guaranteed error on every scrape run and taught us
    // to ignore the error list. Needs the same headless/Firecrawl work as the
    // CivicPlus sources below — re-enable together with those.
    indexUrl:
      'https://harkerheights.gov/index.php/economic-development',
    pdfHrefPattern: PDF_HREF_PATTERN,
    reportType: 'edr',
    cms: 'joomla',
    enabled: false,
  },

  // ── Deferred to next session (CivicPlus / Granicus, need Firecrawl) ────────
  {
    jurisdiction: 'killeen',
    label: 'City of Killeen — Permit Applications / P&Z',
    indexUrl:
      'https://www.killeentexas.gov/207/Permit-Applications-Forms-Reports-Refund',
    pdfHrefPattern: PDF_HREF_PATTERN,
    reportType: 'weekly_permits',
    cms: 'civicplus',
    enabled: false,
  },
  {
    jurisdiction: 'copperas_cove',
    label: 'City of Copperas Cove — Permit Reports',
    indexUrl: 'https://www.copperascovetx.gov/217/Permit-Reports',
    pdfHrefPattern: PDF_HREF_PATTERN,
    reportType: 'weekly_permits',
    cms: 'civicplus',
    enabled: false,
  },
  {
    jurisdiction: 'waco',
    label: 'City of Waco — Plan Commission',
    indexUrl:
      'https://www.waco-texas.com/Departments/Development-Services/Planning-Services/Plan-Commission',
    pdfHrefPattern: PDF_HREF_PATTERN,
    reportType: 'commissioners_court',
    cms: 'granicus',
    enabled: false,
  },
  {
    jurisdiction: 'mclennan_county',
    label: "McLennan County — Commissioners' Court",
    indexUrl: 'https://www.mclennan.gov/agendacenter',
    pdfHrefPattern: PDF_HREF_PATTERN,
    reportType: 'commissioners_court',
    cms: 'civicplus',
    enabled: false,
  },
];

export function getEnabledSources(): PermitSource[] {
  return PERMIT_SOURCES.filter(s => s.enabled);
}

export function sourceByJurisdiction(j: Jurisdiction): PermitSource | undefined {
  return PERMIT_SOURCES.find(s => s.jurisdiction === j);
}
