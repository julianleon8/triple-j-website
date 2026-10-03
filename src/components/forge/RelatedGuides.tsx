import Link from "next/link";

import { BLOG_POSTS, type BlogPost } from "@/lib/blog";

import { ForgeReveal } from "./ForgeReveal";
import { ForgeSection } from "./layout";
import { SectionHeading } from "./SectionHeading";
import type { SectionTone } from "./styles";

/**
 * Up to three blog posts, as a row of cards. Drop it on a service, city or home
 * page so a reader deciding between options has something to read next; the
 * posts it points at are chosen by the page's `relatedPosts` slugs.
 *
 * Renders nothing when no slug resolves to a post.
 */
export function RelatedGuides({
  postSlugs,
  eyebrow = "Further reading",
  tone = "white",
}: {
  postSlugs: readonly string[];
  eyebrow?: string;
  tone?: SectionTone;
}) {
  const posts = postSlugs
    .map((slug) => BLOG_POSTS.find((p) => p.slug === slug))
    .filter((p): p is BlogPost => Boolean(p))
    .slice(0, 3);
  if (posts.length === 0) return null;

  return (
    <ForgeSection tone={tone} aria-label="Guides from the crew" className="border-t border-forge-mist">
      <ForgeReveal className="max-w-[720px]">
        <SectionHeading eyebrow={eyebrow} line1="Guides from the crew." />
      </ForgeReveal>
      <ForgeReveal stagger className="mt-9 grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-4">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col rounded-[12px] border border-forge-silver bg-white p-6 transition-colors duration-200 hover:border-forge-navy"
          >
            <p className="m-0 text-[11px] font-bold uppercase tracking-[.16em] text-forge-slate">
              {post.category} · {post.readTime}
            </p>
            <h3 className="mt-3 font-forge-display text-[19px] font-bold leading-[1.3] text-forge-navy [text-wrap:balance]">
              {post.title}
            </h3>
            <span className="mt-auto inline-flex w-fit items-center border-b border-forge-silver pt-5 pb-0.5 text-[15px] font-semibold text-forge-navy transition-colors group-hover:border-forge-navy">
              Read the guide →
            </span>
          </Link>
        ))}
      </ForgeReveal>
    </ForgeSection>
  );
}
