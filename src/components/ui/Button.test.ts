import { createElement, type ComponentProps } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it, vi } from 'vitest';

// Stand-in for next/link that marks its output, so a test can tell a routed
// <Link> apart from a plain <a> (both render an <a> in static markup).
vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: unknown; className?: string }) =>
    createElement('a', { href, className, 'data-next-link': '' }, children as never),
}));

import { ButtonLink } from './Button';

type Props = ComponentProps<typeof ButtonLink>;
const render = (props: Omit<Props, 'children'>) =>
  renderToStaticMarkup(createElement(ButtonLink, { ...props, children: 'Get a Free Quote' } as Props));

it('renders a plain <a> for a same-page hash so Android in-app browsers can scroll to it', () => {
  const html = render({ href: '#quote' });
  expect(html).toContain('href="#quote"');
  expect(html).not.toContain('data-next-link');
});

it('renders a plain <a> for a cross-page hash, keeping the path', () => {
  const html = render({ href: '/#quote' });
  expect(html).toContain('href="/#quote"');
  expect(html).not.toContain('data-next-link');
});

it('keeps anchor props and drops the ones only <Link> understands', () => {
  const html = render({ href: '#quote', prefetch: false, scroll: false, replace: true, 'aria-label': 'Jump to the quote form' });
  expect(html).toContain('aria-label="Jump to the quote form"');
  expect(html).not.toMatch(/prefetch|scroll=|replace=/);
});

it('still routes ordinary page links through <Link>', () => {
  const html = render({ href: '/services/carports' });
  expect(html).toContain('href="/services/carports"');
  expect(html).toContain('data-next-link');
});
