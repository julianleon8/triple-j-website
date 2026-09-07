import { expect, it, vi } from 'vitest';
import { createElement, type FC } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// QuoteForm is a client component. Only the initial render is exercised here —
// enough to guard the chrome split, which is the one change in this component
// that touches all fourteen pages embedding it.
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('next/dynamic', () => ({ default: () => () => null }));
vi.mock('next/image', async () => {
  const { createElement: h } = await import('react');
  return {
    default: ({ src, alt }: { src: string; alt: string }) => h('img', { src, alt }),
  };
});

import { QuoteForm, type QuoteFormProps } from './QuoteForm';

// Every prop is optional, so createElement's inference needs the component
// type spelled out.
const render = (props: QuoteFormProps = {}) =>
  renderToStaticMarkup(createElement(QuoteForm as FC<QuoteFormProps>, props));

it('renders the full section by default, so the inline pages are unchanged', () => {
  const html = render();
  expect(html).toContain('id="quote"');
  expect(html).toContain('aria-labelledby="quote-heading"');
  expect(html).toContain('id="quote-heading"');
  expect(html).toContain('Get A Quote');
  expect(html).toContain('150+ Central Texas Builds');
  // The form card itself is present in both modes.
  expect(html).toContain('Step');
});

it('defaults to chrome when called with no props at all', () => {
  // Four call sites render <QuoteForm /> with no props; the `= {}` default
  // parameter is what makes that legal.
  expect(render()).toContain('id="quote"');
});

it('drops the section, heading and eyebrows in bare mode', () => {
  const html = render({ chrome: false });
  expect(html).not.toContain('id="quote"');
  expect(html).not.toContain('quote-heading');
  expect(html).not.toContain('Get A Quote');
  expect(html).not.toContain('150+ Central Texas Builds');
  // ...but keeps the form.
  expect(html).toContain('Step');
});

it('keeps the aria reference and its target together', () => {
  const bare = render({ chrome: false });
  const full = render();
  // Either both the label and its target are present, or neither is.
  expect(bare.includes('aria-labelledby="quote-heading"')).toBe(bare.includes('id="quote-heading"'));
  expect(full.includes('aria-labelledby="quote-heading"')).toBe(full.includes('id="quote-heading"'));
});

it('promises the same thing on /quote as the page headline does', () => {
  const quotePage = render({ chrome: false, source: 'quote_page' });
  expect(quotePage).toContain('Same day, guaranteed within 24 hours.');
  expect(quotePage).not.toContain('Most replies within 24 hours');
});

it('leaves the inline reassurance copy alone', () => {
  const inline = render();
  expect(inline).toContain('Most replies within 24 hours.');
  expect(inline).not.toContain('Same day, guaranteed');
});

it('preselects the service chip from ?service=', () => {
  const html = render({ chrome: false, initialService: 'rv_cover' });
  // The selected chip carries aria-pressed on the RV option.
  expect(html).toMatch(/RV\s*(&amp;|&)?\s*Boat|RV/);
  expect(html).toContain('aria-pressed="true"');
});

it('prefills the ZIP from ?city=', () => {
  const html = render({ chrome: false, initialZip: '76541' });
  expect(html).toContain('value="76541"');
});
