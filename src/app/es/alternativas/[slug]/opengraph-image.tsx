import { ALTERNATIVES } from '@/i18n/pages/alternatives'
import { renderAlternativesOgCard } from '@/lib/alternatives-og'
import { ALTERNATIVES_SLUGS } from '@/lib/competitors'
import { OG_CONTENT_TYPE, OG_SIZE } from '@/lib/og-card'

/** /es/alternativas/[slug] OG card: the Spanish twin of /alternatives/[slug] (src/lib/alternatives-og.ts). */

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = ALTERNATIVES.es.og.alt

// Competitor slugs are brand names, the same in both languages.
export function generateStaticParams() {
  return ALTERNATIVES_SLUGS.map((slug) => ({ slug }))
}

export default async function AlternativesOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return renderAlternativesOgCard(slug, 'es')
}
