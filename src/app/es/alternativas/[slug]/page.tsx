import type { Metadata } from 'next'

import { AlternativesPage } from '@/components/pages/AlternativesPage'
import { localeAlternates, ogLocale } from '@/i18n/metadata'
import { localizeHref } from '@/i18n/routes'
import { ALTERNATIVES_SLUGS } from '@/lib/competitors'
import { getAlternativesContent } from '@/lib/competitors.es'
import { SITE } from '@/lib/site'

// Competitor slugs are brand names, the same in both languages.
export async function generateStaticParams() {
  return ALTERNATIVES_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata(
  { params }: PageProps<'/es/alternativas/[slug]'>,
): Promise<Metadata> {
  const { slug } = await params
  const content = getAlternativesContent(slug, 'es')
  if (!content) return {}
  return {
    title: { absolute: `${content.metaTitle} | ${SITE.name}` },
    description: content.metaDescription,
    alternates: localeAlternates(`/alternatives/${slug}`, 'es'),
    openGraph: {
      title: content.metaTitle,
      description: content.metaDescription,
      url: localizeHref(`/alternatives/${slug}`, 'es'),
      type: 'article',
      ...ogLocale('es'),
    },
    twitter: {
      card: 'summary_large_image',
      title: content.metaTitle,
      description: content.metaDescription,
    },
  }
}

export default async function Page({ params }: PageProps<'/es/alternativas/[slug]'>) {
  const { slug } = await params
  return <AlternativesPage locale="es" slug={slug} />
}
