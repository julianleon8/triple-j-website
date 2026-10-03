import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { POST_BODIES_ES } from '@/app/(marketing)/blog/[slug]/posts/es'
import { BlogPostPage } from '@/components/pages/BlogPostPage'
import { localeAlternates, ogLocale } from '@/i18n/metadata'
import { localizeHref } from '@/i18n/routes'
import { localizedPost, postBySpanishSlug, SPANISH_POST_SLUGS } from '@/lib/blog.es'

type Props = {
  params: Promise<{ slug: string }>
}

// The Spanish slug (src/i18n/routes.ts) names the English post it translates.
export async function generateStaticParams() {
  return SPANISH_POST_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const english = postBySpanishSlug(slug)
  if (!english) return {}
  const post = localizedPost(english, 'es')
  return {
    title: post.metaTitle,
    description: post.metaDescription,
    alternates: localeAlternates(`/blog/${post.slug}`, 'es'),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: localizeHref(`/blog/${post.slug}`, 'es'),
      type: 'article',
      publishedTime: post.date,
      authors: ['Triple J Metal'],
      tags: post.tags,
      ...ogLocale('es'),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
  }
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  const english = postBySpanishSlug(slug)
  if (!english) notFound()
  const loadBody = POST_BODIES_ES[english.slug]
  if (!loadBody) notFound()
  const { default: Body } = await loadBody()

  return <BlogPostPage locale="es" post={localizedPost(english, 'es')} Body={Body} />
}
