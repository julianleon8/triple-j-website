import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { PANEL_COLORS } from './colors'
import { LOCATIONS } from './locations'
import { SERVICE_SLUGS } from './services'
import {
  AREAS_HREF,
  COMPANY_LINKS,
  MEGA_AREAS,
  MEGA_GUIDES,
  MEGA_MORE_SERVICES,
  MEGA_SERVICES,
  NAV_LINKS,
  SERVICES,
  SERVICE_CITIES,
} from './site'

/**
 * Every link in the header, mobile menu and footer must reach a real page.
 *
 * These constants are the only place the global nav is written down, so this
 * is the one guard against a menu link that 404s (or a page that quietly
 * stops being linked). Colors and PBR vs PBU were unreachable from the nav for
 * months; the last block pins that they stay reachable from all three surfaces.
 */

const MARKETING = join(process.cwd(), 'src/app/(marketing)')

function routeExists(href: string): boolean {
  const path = href.split(/[?#]/)[0]
  if (path === '/') return true
  const segments = path.split('/').filter(Boolean)
  const [first, second] = segments

  if (first === 'services' && second && SERVICE_SLUGS.includes(second)) return segments.length === 2
  if (first === 'locations' && second) return second in LOCATIONS
  return existsSync(join(MARKETING, ...segments, 'page.tsx'))
}

const headerAndFooterLinks: [string, string][] = [
  ...NAV_LINKS.map((l): [string, string] => ['NAV_LINKS', l.href]),
  ...COMPANY_LINKS.map((l): [string, string] => ['COMPANY_LINKS', l.href]),
  ...MEGA_SERVICES.map((l): [string, string] => ['MEGA_SERVICES', l.href]),
  ...MEGA_MORE_SERVICES.map((l): [string, string] => ['MEGA_MORE_SERVICES', l.href]),
  ...MEGA_GUIDES.map((l): [string, string] => ['MEGA_GUIDES', l.href]),
  ...MEGA_AREAS.map((l): [string, string] => ['MEGA_AREAS', l.href]),
  ...SERVICES.map((l): [string, string] => ['SERVICES', l.href]),
  ...SERVICE_CITIES.map((c): [string, string] => ['SERVICE_CITIES', `/locations/${c.slug}`]),
  ['AREAS_HREF', AREAS_HREF],
]

describe('global nav links', () => {
  it('finds the links to check', () => {
    // Guards the guard: a refactor must not leave this iterating over nothing.
    expect(headerAndFooterLinks.length).toBeGreaterThan(30)
  })

  it.each(headerAndFooterLinks)('%s -> %s is a real route', (_source, href) => {
    expect(routeExists(href), href).toBe(true)
  })
})

describe('Colors, PBR vs PBU and service areas stay easy to reach', () => {
  it('sends the "Service areas" headings to /locations', () => {
    expect(AREAS_HREF).toBe('/locations')
  })

  it('puts Colors first in the header menus', () => {
    expect(MEGA_GUIDES[0].href).toBe('/services/colors')
    expect(MEGA_GUIDES.map((g) => g.href)).toContain('/services/pbr-vs-pbu-panels')
  })

  it('links Colors and PBR vs PBU from the footer', () => {
    const footer = SERVICES.map((s) => s.href)
    expect(footer).toContain('/services/colors')
    expect(footer).toContain('/services/pbr-vs-pbu-panels')
  })

  it('states the real color count', () => {
    // The menu says "39 colors"; the catalog is the source of that number.
    expect(MEGA_GUIDES[0].sub).toContain(`${PANEL_COLORS.length} colors`)
  })

  it('reaches every service page from the mega menu', () => {
    const linked = new Set<string>([
      ...MEGA_SERVICES.map((s) => s.href),
      ...MEGA_MORE_SERVICES.map((s) => s.href),
    ])
    for (const slug of SERVICE_SLUGS) {
      expect(linked.has(`/services/${slug}`), slug).toBe(true)
    }
  })
})
