import { describe, expect, it } from 'vitest';

import { BLOG_POSTS } from './blog';
import { ALTERNATIVES_CONTENT } from './competitors';
import { LOCATIONS } from './locations';
import { SERVICES } from './services';
import { SITE } from './site';

// The root layout's title template appends " | Triple J Metal". Google shows
// roughly 60 characters of a title and ~155 of a description before cutting.
const SUFFIX = ` | ${SITE.name}`;
const TITLE_MAX = 60;
const DESCRIPTION_MAX = 155;

const pages = [
  ...Object.values(SERVICES).map((s) => ({ page: `/services/${s.slug}`, title: s.metaTitle, description: s.metaDescription })),
  ...Object.values(LOCATIONS).map((l) => ({ page: `/locations/${l.slug}`, title: l.metaTitle, description: l.metaDescription })),
  ...BLOG_POSTS.map((p) => ({ page: `/blog/${p.slug}`, title: p.metaTitle, description: p.metaDescription })),
  ...Object.entries(ALTERNATIVES_CONTENT).map(([slug, c]) => ({ page: `/alternatives/${slug}`, title: c.metaTitle, description: c.metaDescription })),
];

describe.each(pages)('$page', ({ title, description }) => {
  it('fits the title in a search result, brand included', () => {
    expect(title.endsWith(SUFFIX), 'the template already adds the brand').toBe(false);
    expect((title + SUFFIX).length).toBeLessThanOrEqual(TITLE_MAX);
  });
  it('fits the description in a search result', () => {
    expect(description.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
  });
});
