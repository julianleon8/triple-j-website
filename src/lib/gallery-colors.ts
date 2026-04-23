import { PANEL_COLORS, LINE_LABELS, type PanelColor } from './colors'

export type GalleryColorInput = {
  panelColor?: string | null
  panelColorLine?: string | null
  trimColor?: string | null
  trimColorLine?: string | null
}

export type GalleryColorDescription = {
  panel: PanelColor | null
  trim: PanelColor | null
  label: string | null
}

// DB stores lowercase internal IDs for `*_color_line` ('turnium' | 'sheffield')
// and may store either slug form ('Hunter-Green'), the current display name
// ('Pinto Green'), or the LEGACY display name ('Hunter Green') for `*_color`.
// Resolver checks all three so a rename of the canonical name doesn't orphan
// existing gallery rows. Internal IDs are NOT brand names — the user-facing
// labels come from LINE_LABELS + PanelColor.name in ./colors.ts.
function resolve(
  colorIdent: string | null | undefined,
  lineIdent: string | null | undefined,
): PanelColor | null {
  if (!colorIdent) return null
  const target = colorIdent.toLowerCase()
  const targetLine = lineIdent?.toLowerCase()
  return (
    PANEL_COLORS.find((c) => {
      const slugMatch = c.slug.toLowerCase() === target
      const nameMatch = c.name.toLowerCase() === target
      const legacyMatch = c.legacyName.toLowerCase() === target
      const lineMatch = !targetLine || c.line.toLowerCase() === targetLine
      return (slugMatch || nameMatch || legacyMatch) && lineMatch
    }) ?? null
  )
}

export function describeGalleryColors(
  input: GalleryColorInput,
): GalleryColorDescription {
  const panel = resolve(input.panelColor, input.panelColorLine)
  const trim = resolve(input.trimColor, input.trimColorLine)

  let label: string | null = null
  if (panel && trim) label = `${panel.name} panels · ${trim.name} trim`
  else if (panel) label = `${panel.name} panels`
  else if (trim) label = `${trim.name} trim`

  return { panel, trim, label }
}

// ─── Dashboard editor helpers ────────────────────────────────────────────────
// Composite value "Turnium/Ash-Gray" is an INTERNAL identifier (kept stable
// for DB compatibility) — it lets duplicate names (Ash Gray, Black, Burnished
// Slate) stay distinguishable across lines. Server splits into panel_color
// (lowercase slug) + panel_color_line (lowercase). User-facing label uses
// LINE_LABELS, so an editor sees "Burnished Slate (Standard Line)" not
// "Burnished Slate (Turnium)".

export function colorOptionValue(c: PanelColor): string {
  return `${c.line}/${c.slug}`
}

export function colorOptionLabel(c: PanelColor): string {
  return `${c.name} (${LINE_LABELS[c.line]})`
}

export function colorValueFromDb(
  color: string | null | undefined,
  line: string | null | undefined,
): string {
  const match = resolve(color, line)
  return match ? colorOptionValue(match) : ''
}

export type ParsedColorValue = { color: string; line: string }

export function parseColorValue(
  value: string | null | undefined,
): ParsedColorValue | null {
  if (!value) return null
  const [line, slug] = value.split('/')
  if (!line || !slug) return null
  return { color: slug.toLowerCase(), line: line.toLowerCase() }
}

