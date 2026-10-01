import { expect, it } from 'vitest';

import { BLOG_POSTS } from './blog';
import { buildLlmsFullTxt, buildLlmsTxt } from './llms';
import { LOCATIONS } from './locations';
import { SERVICES } from './services';
import { SITE } from './site';

const BASE = 'https://www.example.com';
const short = buildLlmsTxt(BASE);
const full = buildLlmsFullTxt(BASE);

it('links every service, city and guide the site renders', () => {
  for (const s of Object.keys(SERVICES)) expect(short).toContain(`${BASE}/services/${s})`);
  for (const l of Object.keys(LOCATIONS)) expect(short).toContain(`${BASE}/locations/${l})`);
  for (const p of BLOG_POSTS) expect(short).toContain(`${BASE}/blog/${p.slug})`);
  expect(short).toContain(`${BASE}/llms-full.txt`);
});

it('takes contact details from SITE', () => {
  for (const text of [short, full]) {
    expect(text).toContain(SITE.phone);
    expect(text).toContain(SITE.addressOneLine);
  }
});

it('carries every service page in full, FAQs included', () => {
  for (const s of Object.values(SERVICES)) {
    expect(full).toContain(s.technicalAuthority);
    for (const f of s.faqs) expect(full).toContain(f.a);
  }
});

// The hand-kept file this replaced had drifted into all of these.
it.each([
  [/4,?000 PSI (concrete )?standard/i],
  [/4 to 16 week|4[–-]16 week/i],
  [/permits? pulled by|we pull permits|we handle permits/i],
  [/concrete (pad )?included/i],
])('never says %s', (re) => {
  expect(short).not.toMatch(re);
  expect(full).not.toMatch(re);
});
