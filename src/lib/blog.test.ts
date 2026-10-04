import { describe, it, expect } from 'vitest'
import { BLOG_POSTS, BLOG_REVISED, postModified, relatedBlogPosts, type BlogPost } from './blog'

describe('relatedBlogPosts', () => {
  it('never suggests a post on itself, and never repeats one', () => {
    for (const post of BLOG_POSTS) {
      const slugs = relatedBlogPosts(post.slug).map((p) => p.slug)
      expect(slugs, post.slug).not.toContain(post.slug)
      expect(new Set(slugs).size, post.slug).toBe(slugs.length)
    }
  })

  it('suggests up to three, fewer only when there are fewer other posts', () => {
    for (const post of BLOG_POSTS) {
      expect(relatedBlogPosts(post.slug)).toHaveLength(Math.min(3, BLOG_POSTS.length - 1))
    }
    expect(relatedBlogPosts(BLOG_POSTS[0].slug, 1)).toHaveLength(1)
  })

  it('surfaces every post on at least one other post', () => {
    // The regression: the HOA post was last in the array, so "the first three
    // others" never included it and nothing but the blog index linked to it.
    const surfaced = new Set(BLOG_POSTS.flatMap((p) => relatedBlogPosts(p.slug).map((r) => r.slug)))
    for (const post of BLOG_POSTS) expect(surfaced.has(post.slug), post.slug).toBe(true)
  })

  it('puts a same-topic post ahead of an unrelated one', () => {
    // Bell County permits and Blackland soil are both "Local"; PCS shares the
    // Killeen tag. Both outrank the HOA post, which shares nothing.
    const related = relatedBlogPosts('bell-county-metal-building-permit-guide').map((p) => p.slug)
    expect(related.slice(0, 2)).toEqual([
      'blackland-prairie-soil-metal-building-foundation',
      'fort-cavazos-pcs-metal-carport',
    ])
  })

  it('returns nothing for an unknown slug', () => {
    expect(relatedBlogPosts('no-such-post')).toEqual([])
  })
})

describe('postModified', () => {
  const post = (date: string): BlogPost => ({ ...BLOG_POSTS[0], date })

  it('dates an older post by the shared revision, not by its publish date', () => {
    expect(postModified(post('2026-04-15'))).toBe(BLOG_REVISED)
  })

  it('keeps the publish date of a post written after the revision', () => {
    expect(postModified(post('2026-11-20'))).toBe('2026-11-20')
  })

  it('never dates a real post before it was published', () => {
    for (const p of BLOG_POSTS) {
      expect(new Date(postModified(p)).getTime(), p.slug).toBeGreaterThanOrEqual(new Date(p.date).getTime())
    }
  })
})
