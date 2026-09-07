/**
 * Central TX permit data sources for the Lead Engine.
 *
 * Rebuilt 2026-09-07 around the City of Temple weekly building-permit report,
 * the one source in the service area that is static HTML, current, weekly, and
 * lists permits one per row. Everything the scraper learned the hard way about
 * these Revize pages is recorded on the fields below rather than in a comment
 * somewhere else, so the next person changes the registry, not the parser.
 *
 * See `research/Lead Sources Research.md` for the original dossier and
 * `Decisions.md` (2026-09-07) for why Bell County was switched off.
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
 * Group 1 is the path without its query string; group 2 is the query string
 * (including the `?`) when present. Every consumer reads group 1 as the path.
 *
 * Why it looks like this — three real-world misses, each of which produced a
 * clean HTTP 200 and zero permits:
 *
 *   - Bell County writes `<a href= "docs/260105agenda.pdf?t=...">` with a
 *     **space after `href=`**. The original pattern demanded the quote
 *     immediately after the equals sign.
 *   - Revize appends a **`?t=YYYYMMDDhhmmss…` cache-buster** to nearly every
 *     document link. The original pattern demanded `.pdf` right before the
 *     closing quote. That stamp is the publisher's upload time and is the most
 *     reliable "which report is newest" signal on the page — Temple's filenames
 *     ("Aug 21-27.pdf") carry no year and no parseable date — so it is captured
 *     as group 2 rather than thrown away. See `uploadStampOf()` in
 *     `src/lib/jobs/scrape-permits.ts`.
 *   - Paths contain spaces, ampersands and parentheses
 *     (`Building Permits & Inspections/Weekly Permit Reports/Aug 21-27.pdf`),
 *     so the path class is "anything but a quote".
 *
 * Both pages also declare `<base href="https://<host>/">` and emit
 * **root-relative hrefs with no leading slash**. Resolving against the index
 * URL doubles the path and 404s; resolve against the `<base>`. That is
 * `baseHrefOf()` / `resolvePdfUrl()`, not this pattern.
 *
 * Safe to share one RegExp across sources despite the /g flag — String
 * .matchAll() operates on an internal clone and does not advance lastIndex.
 */
export const PDF_HREF_PATTERN = /href\s*=\s*["']([^"']+\.pdf)(\?[^"']*)?["']/gi

export type PermitSource = {
  jurisdiction: Jurisdiction;
  label: string;
  indexUrl: string;
  /** Matches href attributes of PDF links on the index page. */
  pdfHrefPattern: RegExp;
  /**
   * Tested against the FULL href path, directories included. Temple's weekly
   * reports are recognisable only by their folder ("Weekly Permit Reports/")
   * — the filename is often just "Aug 21-27.pdf".
   */
  pathFilter: RegExp;
  /** Also tested against the full href path; a match drops the candidate. */
  exclude?: RegExp;
  reportType: 'weekly_permits' | 'commissioners_court' | 'edr';
  cms: 'revize' | 'joomla' | 'civicplus' | 'granicus';
  enabled: boolean;
};

export const PERMIT_SOURCES: PermitSource[] = [
  {
    jurisdiction: 'temple',
    label: 'City of Temple — Weekly Building Permit Report',
    // Verified 2026-09-07: the page is STATIC. An earlier note here called it
    // a JS-hydrated accordion with no PDF hrefs; that was wrong — the static
    // HTML lists ~110 weekly reports back to March 2024, each a per-permit
    // table (Job ID, owner, type, description, status, address, applicant,
    // general contractor). Roughly 190 permits a week, of which ~10% are
    // accessory buildings, shops, additions and slabs, and ~13% are new homes
    // with the builder named.
    //
    // The same page also links "Monthly Permit Totals" PDFs — aggregate counts
    // only, no addresses — and a "NewspaperReport" in the weekly folder. Both
    // excluded below.
    indexUrl:
      'https://www.templetx.gov/departments/city_departments/building_permits___inspections/permitreports.php',
    pdfHrefPattern: PDF_HREF_PATTERN,
    pathFilter: /weekly/i,
    exclude: /monthly|totals|ytd|newspaper/i,
    reportType: 'weekly_permits',
    cms: 'revize',
    enabled: true,
  },
  {
    jurisdiction: 'bell_county',
    label: "Bell County — Commissioners' Court Agendas",
    // DISABLED 2026-09-07, three independent reasons, any one sufficient:
    //   1. The agenda PDFs are scanned images with no text layer — `unpdf`
    //      extracts a single character from each, so nothing ever reaches
    //      Claude.
    //   2. year_2026.php stops at the 2026-04-21 meeting and no newer agenda
    //      is linked anywhere on the site (index.php and
    //      agendas_and_minutes.php checked).
    //   3. Court agendas are plats, contracts and budget items, not building
    //      permits; even OCR'd they would rarely name a structure Triple J
    //      builds.
    // Kept for history and because the entry documents the URL scheme.
    indexUrl:
      'https://www.bellcountytx.com/county_government/commissioners_court/year_2026.php',
    pdfHrefPattern: PDF_HREF_PATTERN,
    pathFilter: /agenda/i,
    exclude: /animal|budget|cip|slfrf/i,
    reportType: 'commissioners_court',
    cms: 'revize',
    enabled: false,
  },
  {
    jurisdiction: 'harker_heights',
    label: 'City of Harker Heights — Economic Development Report',
    // DISABLED 2026-09-07: the host sits behind a Cloudflare JS challenge and
    // returns 403 ("Just a moment...") to any plain fetch, regardless of
    // User-Agent. Needs the same headless work as the CivicPlus sources below.
    indexUrl: 'https://harkerheights.gov/index.php/economic-development',
    pdfHrefPattern: PDF_HREF_PATTERN,
    pathFilter: /edr|economic/i,
    reportType: 'edr',
    cms: 'joomla',
    enabled: false,
  },

  // ── Deferred (CivicPlus / Granicus, need a headless browser) ─────────────
  {
    jurisdiction: 'killeen',
    label: 'City of Killeen — Permit Applications / P&Z',
    indexUrl:
      'https://www.killeentexas.gov/207/Permit-Applications-Forms-Reports-Refund',
    pdfHrefPattern: PDF_HREF_PATTERN,
    pathFilter: /permit|report/i,
    reportType: 'weekly_permits',
    cms: 'civicplus',
    enabled: false,
  },
  {
    jurisdiction: 'copperas_cove',
    label: 'City of Copperas Cove — Permit Reports',
    indexUrl: 'https://www.copperascovetx.gov/217/Permit-Reports',
    pdfHrefPattern: PDF_HREF_PATTERN,
    pathFilter: /permit|report/i,
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
    pathFilter: /agenda|commission/i,
    reportType: 'commissioners_court',
    cms: 'granicus',
    enabled: false,
  },
  {
    jurisdiction: 'mclennan_county',
    label: "McLennan County — Commissioners' Court",
    indexUrl: 'https://www.mclennan.gov/agendacenter',
    pdfHrefPattern: PDF_HREF_PATTERN,
    pathFilter: /agenda/i,
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
