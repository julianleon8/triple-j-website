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
 */
export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; path: string }[]
}) {
  const url = getSiteUrl()

  const trail = [{ name: 'Home', path: '/' }, ...items]

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
