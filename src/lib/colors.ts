/**
 * Panel color catalog.
 *
 * Single canonical name per color — uses the supplier's technical names
 * (MetalMax / Sheffield / Turnium standard catalog). Customers and the crew
 * all see the same names. No marketing aliases, no Lone-Star renames.
 *
 * `PanelLine` values stay 'Turnium' / 'Sheffield' as **internal identifiers
 * only** — they map to existing rows in `gallery_items.panel_color_line`
 * (renaming would orphan that data). User-facing labels come from
 * LINE_LABELS.
 *
 *   Standard Line: exposed-fastener panels
 *   Premium Line:  concealed-fastener (HOA + architectural)
 *
 * Every panel in both lines is 26 gauge — Triple J builds in nothing else.
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
  Turnium:   '26-gauge exposed-fastener panels',
  Sheffield: '26-gauge concealed-fastener panels for HOA + architectural projects',
}

export type PanelColor = {
  /** Canonical display name — same on public site AND in HQ. */
  name: string
  /** URL slug used in the swatch image filename + DB storage. */
  slug: string
  line: PanelLine
  /** True if this is a good match for HOA/luxury applications */
  hoaFriendly?: boolean
  /** Cheapest pricing tier — ~$0.50–$1/sheet less than painted panels.
   *  Surfaces a "Best Value" badge on the Colors page swatch. */
  mostEconomical?: boolean
}

function standard(
  name: string,
  slug: string,
  hoaFriendly?: boolean,
  mostEconomical?: boolean,
): PanelColor {
  return { name, slug, line: 'Turnium', hoaFriendly, mostEconomical }
}

function premium(
  name: string,
  slug: string,
  hoaFriendly?: boolean,
  mostEconomical?: boolean,
): PanelColor {
  return { name, slug, line: 'Sheffield', hoaFriendly, mostEconomical }
}

export const PANEL_COLORS: PanelColor[] = [
  // ── Standard Line (legacy: Turnium) ────────────────────────────────────────
  standard('Alamo White',     'Alamo-White'),
  standard('Ash Gray',        'Ash-Gray'),
  standard('Black',           'Black'),
  standard('Brite Red',       'Brite-Red'),
  standard('Brown',           'Brown'),
  standard('Brilliant White', 'Brilliant-White'),
  standard('Burgundy',        'Burgundy'),
  standard('Burnished Slate', 'Burnished-Slate', true),
  standard('Charcoal',        'Charcoal', true),
  standard('Copper Penny',    'Copper-Penny'),
  standard('Fern Green',      'Fern-Green'),
  standard('Gallery Blue',    'Gallery-Blue'),
  standard('Galvalume',       'Galvalume',       undefined, true),  // pricing signal — customers search this name (~$0.50–$1/sheet cheaper)
  standard('Hunter Green',    'Hunter-Green'),
  standard('Light Stone',     'Light-Stone', true),
  standard('Ocean Blue',      'Ocean-Blue'),
  standard('Pewter Gray',     'Pewter-Gray', true),
  standard('Polar White',     'Polar-White', true),
  standard('Rustic Red',      'Rustic-Red'),
  standard('Tan',             'Tan'),
  standard('Taupe',           'Taupe', true),

  // ── Premium Line (legacy: Sheffield) ───────────────────────────────────────
  premium('Regal White',                'Regal-White', true),
  premium('Dove Gray',                  'Dove-Gray', true),
  premium('Slate Gray',                 'Slate-Gray', true),
  premium('Ash Gray',                   'Ash-Gray'),
  premium('Dark Gray',                  'Dark-Gray', true),
  premium('Charcoal Gray',              'Charcoal-Gray', true),
  premium('Evergreen',                  'Evergreen'),
  premium('Black',                      'Black', true),
  premium('Antique',                    'Antique'),
  premium('Colonial Red',               'Colonial-Red'),
  premium('Terra Cotta',                'Terra-Cotta'),
  premium('Dark Bronze',                'Dark-Bronze', true),
  premium('Medium Bronze',              'Medium-Bronze', true),
  premium('Sandstone',                  'Sandstone', true),
  premium('Sierra Tan',                 'Sierra-Tan', true),
  premium('Mansard Brown',              'Mansard-Brown'),
  premium('Burnished Slate',            'Burnished-Slate', true),
  premium('Acrylic-Coated Galvalume',   'Acrylic-Coated-Galvalume', undefined, true),  // pricing signal — sealed Galvalume variant
]

export function getSwatchUrl(color: PanelColor): string {
  return `https://metalmax.com/wp-content/uploads/2025/12/MMRS_${color.line}_${color.slug}_swatch-300x276.jpg`
}

export const TURNIUM_COLORS = PANEL_COLORS.filter(c => c.line === 'Turnium')
export const SHEFFIELD_COLORS = PANEL_COLORS.filter(c => c.line === 'Sheffield')
