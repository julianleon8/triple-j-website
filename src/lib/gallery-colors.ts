import { PANEL_COLORS, type PanelColor } from './colors'

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

// DB stores lowercase for `*_color_line` ('turnium' | 'sheffield') and may
// store either slug form ('Hunter-Green') or display name ('Hunter Green')
// for `*_color`. Resolver is permissive so future dashboard work can pick
// either convention.
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
      const lineMatch = !targetLine || c.line.toLowerCase() === targetLine
      return (slugMatch || nameMatch) && lineMatch
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
