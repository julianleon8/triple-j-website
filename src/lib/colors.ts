/**
 * MetalMax panel color data.
 * Turnium line: 26 & 29 gauge
 * Sheffield line: 26 gauge only
 *
 * Swatch image URL patterns:
 *   Turnium:  https://metalmax.com/wp-content/uploads/2025/12/MMRS_Turnium_{slug}_swatch-300x276.jpg
 *   Sheffield: https://metalmax.com/wp-content/uploads/2025/12/MMRS_Sheffield_{slug}_swatch-300x276.jpg
 */

export type PanelLine = 'Turnium' | 'Sheffield'

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
