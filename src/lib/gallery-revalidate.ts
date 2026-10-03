import { revalidatePath } from 'next/cache'

/**
 * Every public page that renders gallery_items / gallery_photos.
 *
 * The statically cached ones (/, /services/[slug], /locations/[slug],
 * /gallery/[id]) otherwise serve the last render until their hourly
 * `revalidate = 3600` runs out — that timer is only the backstop for edits
 * made straight in Supabase. The rest are dynamic today; they are listed
 * anyway so dropping their searchParams / force-dynamic later can't quietly
 * make them stale.
 *
 * Dynamic routes must be given as the route-file pattern *including* the
 * (marketing) group. Next derives the cache tag from the file path, so
 * '/services/[slug]' matches nothing and fails silently.
 *
 * Rendering gallery data on another page (a new getBuilds() caller, a ticker
 * in a shared layout)? Add that page here — gallery-revalidate.test.ts fails
 * until you do.
 */
export const GALLERY_PATHS: ReadonlyArray<readonly [path: string, type?: 'page' | 'layout']> = [
  ['/'], // builds strip + Latest builds ticker
  ['/gallery'],
  ['/quote'], // featured builds + ?project= reference card
  ['/partners'],
  ['/services/hybrid-projects'],
  ['/(marketing)/services/[slug]', 'page'], // Recent builds
  ['/(marketing)/locations/[slug]', 'page'], // Recent builds
  ['/sitemap.xml'],
]

/**
 * Mark every page showing gallery data stale, plus the detail page of each
 * item that changed. Call after a successful write — the next visit to each
 * page re-renders from Supabase instead of waiting for a deploy.
 *
 * Never throws: the write has already landed, and a missed revalidation only
 * degrades to the old stale-until-deploy behaviour.
 */
export function revalidateGallery(itemIds: string | readonly string[] = []): void {
  const ids = typeof itemIds === 'string' ? [itemIds] : itemIds
  try {
    for (const [path, type] of GALLERY_PATHS) revalidatePath(path, type)
    for (const id of ids) revalidatePath(`/gallery/${id}`)
  } catch (error) {
    console.error('[gallery] revalidation failed', { ids, error })
  }
}
