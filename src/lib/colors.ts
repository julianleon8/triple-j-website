/**
 * Panel color catalog.
 *
 * `name` is the **single canonical display name** used everywhere — the public
 * Colors page, the HQ color picker, alt text, gallery cards, schema. There's
 * no separate "marketing alias" anymore: when a customer says "Storm Cloud"
 * Julian/Freddy see "Storm Cloud" in HQ, no translation needed.
 *
 * `legacyName` is the original supplier/technical name (e.g. "Burnished
 * Slate"). Kept in source as a maintenance reference and for backward-compat
 * matching in `gallery-colors.ts` resolve() — never rendered to anyone.
 *
 * `PanelLine` values stay 'Turnium' / 'Sheffield' as **internal identifiers
 * only** — they map to existing rows in `gallery_items.panel_color_line`
 * (renaming would orphan that data). User-facing labels come from
 * LINE_LABELS.
 *
 *   Standard Line: 26 & 29 gauge — exposed-fastener panels
 *   Premium Line:  26 gauge only — concealed-fastener (HOA + architectural)
 *
 * Swatches are sourced from a third-party CDN — see getSwatchUrl(). Mid-term:
 * mirror to Supabase Storage so we don't depend on an external host.
 */

export type PanelLine = 'Turnium' | 'Sheffield'

/** Display labels — never expose `PanelLine` enum values directly to users. */
export const LINE_LABELS: Record<PanelLine, string> = {
  Turnium:   'Standard Line',
  Sheffield: 'Premium Line',
}

/** Subtitle copy for each line — used on /services/colors. */
export const LINE_SUBTITLES: Record<PanelLine, string> = {
  Turnium:   '26 & 29-gauge exposed-fastener panels',
  Sheffield: '26-gauge concealed-fastener panels for HOA + architectural projects',
}

export type PanelColor = {
  /** Canonical display name — same on public site AND in HQ. */
  name: string
  /** Original supplier/technical name. Source-only reference for resolve()
   *  backward-compat with rows that stored the old name. Never rendered. */
  legacyName: string
  /** URL slug used in the swatch image filename + DB storage. */
  slug: string
  line: PanelLine
  /** Only Standard Line is available in both 26 & 29 gauge */
  gauges: ('26' | '29')[]
  /** True if this is a good match for HOA/luxury applications */
  hoaFriendly?: boolean
}

function standard(name: string, legacyName: string, slug: string, hoaFriendly?: boolean): PanelColor {
  return { name, legacyName, slug, line: 'Turnium', gauges: ['26', '29'], hoaFriendly }
}

function premium(name: string, legacyName: string, slug: string, hoaFriendly?: boolean): PanelColor {
  return { name, legacyName, slug, line: 'Sheffield', gauges: ['26'], hoaFriendly }
}

export const PANEL_COLORS: PanelColor[] = [
  // ── Standard Line — 26 & 29 gauge (legacy: Turnium) ────────────────────────
  standard('Alamo Pearl',           'Alamo White',     'Alamo-White'),
  standard('Caprock Ash',           'Ash Gray',        'Ash-Gray'),
  standard('Bell County Black',     'Black',           'Black'),
  standard('Texas Sunset',          'Brite Red',       'Brite-Red'),
  standard('Cedar Bark',            'Brown',           'Brown'),
  standard('Bandera White',         'Brilliant White', 'Brilliant-White'),
  standard('Wine Country',          'Burgundy',        'Burgundy'),
  standard('Storm Cloud',           'Burnished Slate', 'Burnished-Slate', true),
  standard('Hill Country Charcoal', 'Charcoal',        'Charcoal', true),
  standard('Pecan Copper',          'Copper Penny',    'Copper-Penny'),
  standard('Live Oak Fern',         'Fern Green',      'Fern-Green'),
  standard('Bluebonnet Sky',        'Gallery Blue',    'Gallery-Blue'),
  standard('Bare Iron',             'Galvalume',       'Galvalume'),
  standard('Pinto Green',           'Hunter Green',    'Hunter-Green'),
  standard('Limestone',             'Light Stone',     'Light-Stone', true),
  standard('Gulf Coast Blue',       'Ocean Blue',      'Ocean-Blue'),
  standard('West Texas Pewter',     'Pewter Gray',     'Pewter-Gray', true),
  standard('Snowfall White',        'Polar White',     'Polar-White', true),
  standard('Hayloft Red',           'Rustic Red',      'Rustic-Red'),
  standard('Saddle Tan',            'Tan',             'Tan'),
  standard('Mesa Taupe',            'Taupe',           'Taupe', true),

  // ── Premium Line — 26 gauge only (legacy: Sheffield) ───────────────────────
  premium('Cattleman\'s White',     'Regal White',                'Regal-White', true),
  premium('Mourning Dove',          'Dove Gray',                  'Dove-Gray', true),
  premium('Slate Hill',             'Slate Gray',                 'Slate-Gray', true),
  premium('Caprock Ash',            'Ash Gray',                   'Ash-Gray'),
  premium('Thundercloud',           'Dark Gray',                  'Dark-Gray', true),
  premium('Pecos Charcoal',         'Charcoal Gray',              'Charcoal-Gray', true),
  premium('Cedar Evergreen',        'Evergreen',                  'Evergreen'),
  premium('Bell County Black',      'Black',                      'Black', true),
  premium('Heritage Antique',       'Antique',                    'Antique'),
  premium('Lone Star Red',          'Colonial Red',               'Colonial-Red'),
  premium('Big Bend Clay',          'Terra Cotta',                'Terra-Cotta'),
  premium('Bronze Saddle',          'Dark Bronze',                'Dark-Bronze', true),
  premium('Brushed Bronze',         'Medium Bronze',              'Medium-Bronze', true),
  premium('Hill Country Sandstone', 'Sandstone',                  'Sandstone', true),
  premium('Sierra Trail',           'Sierra Tan',                 'Sierra-Tan', true),
  premium('Mesquite Brown',         'Mansard Brown',              'Mansard-Brown'),
  premium('Storm Cloud',            'Burnished Slate',            'Burnished-Slate', true),
  premium('Bare Iron — Sealed','Acrylic-Coated Galvalume',   'Acrylic-Coated-Galvalume'),
]

export function getSwatchUrl(color: PanelColor): string {
  return `https://metalmax.com/wp-content/uploads/2025/12/MMRS_${color.line}_${color.slug}_swatch-300x276.jpg`
}

export const TURNIUM_COLORS = PANEL_COLORS.filter(c => c.line === 'Turnium')
export const SHEFFIELD_COLORS = PANEL_COLORS.filter(c => c.line === 'Sheffield')
