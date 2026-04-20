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
    indexUrl:
      'https://www.templetx.gov/departments/city_departments/building_permits___inspections/permitreports.php',
    // Temple posts Weekly-Permit-Report-<Month>-<Day>-<Year>.pdf under /files/
    pdfHrefPattern: /href=["']([^"']+\.pdf)["']/gi,
    reportType: 'weekly_permits',
    cms: 'revize',
    enabled: true,
  },
  {
    jurisdiction: 'bell_county',
    label: "Bell County — Commissioners' Court Agendas",
    indexUrl:
      'https://www.bellcountytx.com/county_government/commissioners_court/index.php',
    pdfHrefPattern: /href=["']([^"']+\.pdf)["']/gi,
    reportType: 'commissioners_court',
    cms: 'revize',
    enabled: true,
  },
  {
    jurisdiction: 'harker_heights',
    label: 'City of Harker Heights — Economic Development Report',
    indexUrl:
      'https://harkerheights.gov/index.php/building-permits-and-forms',
    pdfHrefPattern: /href=["']([^"']+\.pdf)["']/gi,
    reportType: 'edr',
    cms: 'joomla',
    enabled: true,
  },

  // ── Deferred to next session (CivicPlus / Granicus, need Firecrawl) ────────
  {
    jurisdiction: 'killeen',
    label: 'City of Killeen — Permit Applications / P&Z',
    indexUrl:
      'https://www.killeentexas.gov/207/Permit-Applications-Forms-Reports-Refund',
    pdfHrefPattern: /href=["']([^"']+\.pdf)["']/gi,
    reportType: 'weekly_permits',
    cms: 'civicplus',
    enabled: false,
  },
  {
    jurisdiction: 'copperas_cove',
    label: 'City of Copperas Cove — Permit Reports',
    indexUrl: 'https://www.copperascovetx.gov/217/Permit-Reports',
    pdfHrefPattern: /href=["']([^"']+\.pdf)["']/gi,
    reportType: 'weekly_permits',
    cms: 'civicplus',
    enabled: false,
  },
  {
    jurisdiction: 'waco',
    label: 'City of Waco — Plan Commission',
    indexUrl:
      'https://www.waco-texas.com/Departments/Development-Services/Planning-Services/Plan-Commission',
    pdfHrefPattern: /href=["']([^"']+\.pdf)["']/gi,
    reportType: 'commissioners_court',
    cms: 'granicus',
    enabled: false,
  },
  {
    jurisdiction: 'mclennan_county',
    label: "McLennan County — Commissioners' Court",
    indexUrl: 'https://www.mclennan.gov/agendacenter',
    pdfHrefPattern: /href=["']([^"']+\.pdf)["']/gi,
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
