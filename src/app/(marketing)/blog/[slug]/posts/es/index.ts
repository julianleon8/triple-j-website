import type { ComponentType } from 'react'

/**
 * The Spanish post bodies, keyed by the English slug (the key POST_SLUG_ES and
 * BLOG_POSTS_ES use). Lazy, so a page only loads its own body. A literal map
 * rather than a template-string import: the route path has `[slug]` in it,
 * which a bundler's directory glob would read as a character class.
 * posts.es.test.ts fails if a post has no body here.
 */
export const POST_BODIES_ES: Record<string, () => Promise<{ default: ComponentType }>> = {
  'welded-vs-bolted-metal-buildings-central-texas': () => import('./welded-vs-bolted-metal-buildings-central-texas'),
  'bell-county-metal-building-permit-guide': () => import('./bell-county-metal-building-permit-guide'),
  'fort-cavazos-pcs-metal-carport': () => import('./fort-cavazos-pcs-metal-carport'),
  'blackland-prairie-soil-metal-building-foundation': () => import('./blackland-prairie-soil-metal-building-foundation'),
  'hoa-compliant-metal-buildings-heritage-oaks-bella-charca': () =>
    import('./hoa-compliant-metal-buildings-heritage-oaks-bella-charca'),
}
