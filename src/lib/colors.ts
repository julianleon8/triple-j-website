/**
 * Panel color catalog.
 *
 * `PanelLine` values are kept as 'Turnium' / 'Sheffield' as **internal
 * identifiers only** (they map to existing rows in `gallery_items.panel_color_line`
 * — renaming would orphan that data). Use LINE_LABELS for any user-facing
 * display so the public site stays supplier-agnostic.
 *
 *   Standard Line: 26 & 29 gauge — exposed-fastener panels
 *   Premium Line:  26 gauge only — concealed-fastener (HOA + architectural)
 *
 * Swatches are currently sourced from a third-party CDN — see getSwatchUrl().
 * Mid-term: mirror to Supabase Storage so we don't depend on an external host.
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
  name: string
  /** URL slug used in the swatch image filename */
  slug: string
  line: PanelLine
  /** Only Turnium is available in both 26 & 29 gauge */
  gauges: ('26' | '29')[]
  /** True if this is a good match for HOA/luxury applications */
  hoaFriendly?: boolean
}

function turnium(name: string, slug: string, hoaFriendly?: boolean): PanelColor {
  return { name, slug, line: 'Turnium', gauges: ['26', '29'], hoaFriendly }
}

function sheffield(name: string, slug: string, hoaFriendly?: boolean): PanelColor {
  return { name, slug, line: 'Sheffield', gauges: ['26'], hoaFriendly }
}

export const PANEL_COLORS: PanelColor[] = [
  // ── Turnium 26 & 29 gauge ──────────────────────────────────────────────────
  turnium('Alamo White',    'Alamo-White'),
  turnium('Ash Gray',       'Ash-Gray'),
  turnium('Black',          'Black'),
  turnium('Brite Red',      'Brite-Red'),
  turnium('Brown',          'Brown'),
  turnium('Brilliant White','Brilliant-White'),
  turnium('Burgundy',       'Burgundy'),
  turnium('Burnished Slate','Burnished-Slate', true),
  turnium('Charcoal',       'Charcoal', true),
  turnium('Copper Penny',   'Copper-Penny'),
  turnium('Fern Green',     'Fern-Green'),
  turnium('Gallery Blue',   'Gallery-Blue'),
  turnium('Galvalume',      'Galvalume'),
  turnium('Hunter Green',   'Hunter-Green'),
  turnium('Light Stone',    'Light-Stone', true),
  turnium('Ocean Blue',     'Ocean-Blue'),
  turnium('Pewter Gray',    'Pewter-Gray', true),
  turnium('Polar White',    'Polar-White', true),
  turnium('Rustic Red',     'Rustic-Red'),
  turnium('Tan',            'Tan'),
  turnium('Taupe',          'Taupe', true),

  // ── Sheffield 26 gauge only ────────────────────────────────────────────────
  sheffield('Regal White',               'Regal-White', true),
  sheffield('Dove Gray',                 'Dove-Gray', true),
  sheffield('Slate Gray',                'Slate-Gray', true),
  sheffield('Ash Gray',                  'Ash-Gray'),
  sheffield('Dark Gray',                 'Dark-Gray', true),
  sheffield('Charcoal Gray',             'Charcoal-Gray', true),
  sheffield('Evergreen',                 'Evergreen'),
  sheffield('Black',                     'Black', true),
  sheffield('Antique',                   'Antique'),
  sheffield('Colonial Red',              'Colonial-Red'),
  sheffield('Terra Cotta',               'Terra-Cotta'),
  sheffield('Dark Bronze',               'Dark-Bronze', true),
  sheffield('Medium Bronze',             'Medium-Bronze', true),
  sheffield('Sandstone',                 'Sandstone', true),
  sheffield('Sierra Tan',                'Sierra-Tan', true),
  sheffield('Mansard Brown',             'Mansard-Brown'),
  sheffield('Burnished Slate',           'Burnished-Slate', true),
  sheffield('Acrylic-Coated Galvalume',  'Acrylic-Coated-Galvalume'),
]

export function getSwatchUrl(color: PanelColor): string {
  return `https://metalmax.com/wp-content/uploads/2025/12/MMRS_${color.line}_${color.slug}_swatch-300x276.jpg`
}

export const TURNIUM_COLORS = PANEL_COLORS.filter(c => c.line === 'Turnium')
export const SHEFFIELD_COLORS = PANEL_COLORS.filter(c => c.line === 'Sheffield')

/**
 * Lone-Star marketing names — Texas-evocative aliases for the most-asked-about
 * colors. NOT a replacement for technical names (people search for "Burnished
 * Slate metal panel"); shown as a subtitle under the technical name on the
 * Colors page so a buyer can connect to a regional reference instead of a
 * factory SKU. Only the colors with an obvious Texas analog are listed —
 * generic neutrals fall through to the technical name only.
 *
 * Keyed by lowercase technical name (matches PanelColor.name lower-cased).
 */
export const LONE_STAR_NAMES: Record<string, string> = {
  // Standard Line
  'black':            'Bell County Black',
  'brilliant white':  'Bandera White',
  'polar white':      'Snowfall White',
  'burgundy':         'Wine Country',
  'burnished slate':  'Storm Cloud',
  'charcoal':         'Hill Country Charcoal',
  'copper penny':     'Pecan Copper',
  'gallery blue':     'Bluebonnet Sky',
  'galvalume':        'Bare Iron',
  'hunter green':     'Pinto Green',
  'light stone':      'Limestone',
  'pewter gray':      'West Texas Pewter',
  'rustic red':       'Hayloft Red',
  'tan':              'Saddle Tan',
  'fern green':       'Live Oak Fern',
  // Premium Line
  'regal white':      "Cattleman's White",
  'evergreen':        'Cedar Evergreen',
  'terra cotta':      'Big Bend Clay',
  'dark bronze':      'Bronze Saddle',
  'sandstone':        'Hill Country Sandstone',
  'mansard brown':    'Mesquite Brown',
  'sierra tan':       'Sierra Trail',
  'slate gray':       'Slate Hill',
  'dark gray':        'Thundercloud',
}

export function getLoneStarName(color: PanelColor): string | null {
  return LONE_STAR_NAMES[color.name.toLowerCase()] ?? null
}
