import type { Locale } from '@/i18n/config'
import { SHARED } from '@/i18n/copy/shared'
import { localizeHref } from '@/i18n/routes'
import { getSiteUrl } from '@/lib/site-url'

/**
 * BreadcrumbList JSON-LD. Pass the trail from Home → … → current page.
 * Renders the hierarchy Google uses to show breadcrumb chips under search
 * results, which boosts CTR on service + location landing pages.
 *
 * Example:
 *   <BreadcrumbJsonLd items={[
 *     { name: 'Services', path: '/services' },
 *     { name: 'Carports',  path: '/services/carports' },
 *   ]} />
 *
 * Paths are English; a Spanish page passes `locale="es"` and they map to the
 * Spanish URLs (src/i18n/routes.ts).
 */
export function BreadcrumbJsonLd({
  items,
  locale = 'en',
}: {
  items: { name: string; path: string }[]
  locale?: Locale
}) {
  const url = getSiteUrl()

  const trail = [{ name: SHARED[locale].home, path: '/' }, ...items].map((item) => ({
    ...item,
    path: localizeHref(item.path, locale),
  }))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${url}${item.path}`,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
      }}
    />
  )
}
