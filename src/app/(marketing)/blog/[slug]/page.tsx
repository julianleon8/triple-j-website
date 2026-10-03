import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { BlogPostPage } from '@/components/pages/BlogPostPage'
import { localeAlternates, ogLocale } from '@/i18n/metadata'
import { BLOG_POSTS } from '@/lib/blog'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = BLOG_POSTS.find((p) => p.slug === slug)
  if (!post) return {}
  return {
    title: post.metaTitle,
    description: post.metaDescription,
    alternates: localeAlternates(`/blog/${post.slug}`, 'en'),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: ['Triple J Metal'],
      tags: post.tags,
      ...ogLocale('en'),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
  }
}

export default async function BlogPostRoute({ params }: Props) {
  const { slug } = await params
  const post = BLOG_POSTS.find((p) => p.slug === slug)
  if (!post) notFound()

  // Dynamic import of the post content component
  const PostModule = await import(`./posts/${post.slug}`).catch(() => null)
  if (!PostModule) notFound()

  return <BlogPostPage locale="en" post={post} Body={PostModule.default} />
}
