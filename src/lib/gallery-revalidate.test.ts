import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mock = vi.hoisted(() => ({ revalidatePath: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: mock.revalidatePath }))
import { GALLERY_PATHS, revalidateGallery } from './gallery-revalidate'

beforeEach(() => vi.clearAllMocks())

const revalidated = () => mock.revalidatePath.mock.calls.map(([path]) => path as string)

describe('revalidateGallery', () => {
  it('marks every gallery page stale plus the detail page of each changed item', () => {
    revalidateGallery(['a', 'b'])
    for (const [path, type] of GALLERY_PATHS) expect(mock.revalidatePath).toHaveBeenCalledWith(path, type)
    expect(revalidated()).toContain('/gallery/a')
    expect(revalidated()).toContain('/gallery/b')
  })

  it('accepts a single id', () => {
    revalidateGallery('a')
    expect(revalidated().filter((p) => p.startsWith('/gallery/'))).toEqual(['/gallery/a'])
  })

  it('swallows a revalidation failure — the write already landed', () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    mock.revalidatePath.mockImplementationOnce(() => { throw new Error('no store') })
    expect(() => revalidateGallery('a')).not.toThrow()
    expect(log).toHaveBeenCalled()
    log.mockRestore()
  })
})

describe('GALLERY_PATHS', () => {
  // A pattern that drifts from the file tree (route group renamed, page moved)
  // revalidates nothing and raises no error. Pin each one to a real page.
  it('gives every dynamic route as an existing page file, route group included', () => {
    const patterns = GALLERY_PATHS.filter(([path]) => path.includes('['))
    expect(patterns.length).toBeGreaterThan(0)
    for (const [path, type] of patterns) {
      expect(type).toBe('page')
      expect(path).toMatch(/^\/\(\w+\)\//)
      expect(existsSync(join('src/app', path, 'page.tsx')), path).toBe(true)
    }
  })

  // Every public file that queries the gallery tables, and the pages that
  // render it. A new reader fails here until it is listed, and its page fails
  // the next test until GALLERY_PATHS covers it. New getBuilds() callers are
  // checked separately, below.
  const READERS: Record<string, string[]> = {
    // getBuilds(): homepage strip + ticker, gallery grid, quote, partners,
    // service and location Recent builds.
    'src/lib/forge-builds.ts': [
      '/',
      '/gallery',
      '/quote',
      '/partners',
      '/(marketing)/services/[slug]',
      '/(marketing)/locations/[slug]',
    ],
    'src/app/(marketing)/gallery/[id]/page.tsx': [], // per item: revalidateGallery(id)
    'src/app/(marketing)/quote/page.tsx': ['/quote'], // ?project= reference card
    'src/app/(marketing)/services/hybrid-projects/page.tsx': ['/services/hybrid-projects'],
    'src/app/sitemap.ts': ['/sitemap.xml'],
  }

  function walk(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
      const path = join(dir, name)
      return statSync(path).isDirectory() ? walk(path) : [path]
    })
  }

  const publicSources = (pattern: RegExp, dirs = ['src/app', 'src/components', 'src/lib']) =>
    dirs
      .flatMap(walk)
      .map((path) => relative('.', path))
      .filter((path) => /\.tsx?$/.test(path) && !path.endsWith('.test.ts'))
      .filter((path) => !/^src\/(app\/api|app\/hq|components\/hq)\//.test(path))
      .filter((path) => pattern.test(readFileSync(path, 'utf8')))
  const covered = GALLERY_PATHS.map(([path]) => path)

  it('knows every public file that reads gallery_items / gallery_photos', () => {
    const readers = publicSources(/\.from\(\s*['"`]gallery_(items|photos)['"`]/)
    expect(readers.sort()).toEqual(Object.keys(READERS).sort())
  })

  it('revalidates every page those files render on', () => {
    for (const paths of Object.values(READERS)) {
      for (const path of paths) expect(covered).toContain(path)
    }
  })

  // forge-builds is the shared reader, so a new section built on it is a new
  // caller rather than a new reader — the case the test above can't see.
  it('revalidates every page that calls getBuilds()', () => {
    const callers = publicSources(/\bgetBuilds\(/, ['src/app', 'src/components'])
    expect(callers.length).toBeGreaterThan(0)
    for (const file of callers) {
      // A component has no route of its own: fetch in the page and pass props.
      expect(file, `${file} calls getBuilds() but is not a page`).toMatch(/^src\/app\/.*\/page\.tsx$/)
      const route = file.slice('src/app'.length, -'/page.tsx'.length)
      const path = route.includes('[') ? route : route.replace(/\/\([^)]+\)/g, '') || '/'
      expect(covered, file).toContain(path)
    }
  })
})
