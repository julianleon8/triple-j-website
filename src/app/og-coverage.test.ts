import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Every public page must share an image.
 *
 * A page that sets its own `openGraph` replaces its parent's wholesale —
 * `images` included, Next does not merge them — so unless the page names
 * `images` itself or ships an `opengraph-image` file beside it, it shares no
 * og:image at all. That is how the homepage came to preview in iMessage as a
 * broken fallback (found 2026-09-28). See src/lib/og-card.tsx.
 */

const MARKETING = join(process.cwd(), 'src/app/(marketing)')
// The Spanish mirror (2026-10-03) is held to the same rule.
const SPANISH = join(process.cwd(), 'src/app/es')
const IMAGE_FILES = ['opengraph-image.tsx', 'opengraph-image.jpg', 'opengraph-image.png']

function pages(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return pages(path)
    return entry.name === 'page.tsx' ? [path] : []
  })
}

describe('share images', () => {
  const overriding = [...pages(MARKETING), ...pages(SPANISH)].filter((page) =>
    /\bopenGraph\s*:/.test(readFileSync(page, 'utf8')),
  )

  it('finds the pages that set their own openGraph', () => {
    // Guards the guard: a path or regex change must not quietly match nothing.
    expect(overriding.length).toBeGreaterThan(12)
  })

  it.each(overriding.map((page) => [relative(join(process.cwd(), 'src/app'), page), page]))(
    '%s names openGraph images or has an opengraph-image beside it',
    (_name, page) => {
      const namesImages = /\bimages\s*:/.test(readFileSync(page, 'utf8'))
      const dir = page.slice(0, -'page.tsx'.length)
      const hasImageFile = IMAGE_FILES.some((file) => existsSync(join(dir, file)))
      expect(namesImages || hasImageFile).toBe(true)
    },
  )
})
