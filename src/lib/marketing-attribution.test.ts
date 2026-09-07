import { afterEach, describe, expect, it, vi } from 'vitest';
import { firstTouch } from './marketing-attribution';

afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

describe('marketing attribution', () => {
  it('preserves the ad landing and referrer after browsing to an untagged contact page', () => {
    const original = firstTouch('https://example.com/blog?utm_source=google&gclid=click123', 'https://google.com/');
    expect(firstTouch('https://example.com/contact', 'https://example.com/blog', original)).toEqual(original);
    expect(original).toMatchObject({ utm_source: 'google', gclid: 'click123', referrer_url: 'https://google.com/' });
  });
  it('captures ?src= as the campaign source for our own short links', () => {
    // /quote?src=fb is the Facebook funnel target; before this it was captured
    // by nothing and the lead landed with a null utm_source.
    expect(firstTouch('https://example.com/quote?src=fb', '').utm_source).toBe('fb');
  });
  it('lets a real utm_source win over ?src=', () => {
    const out = firstTouch('https://example.com/quote?utm_source=google&src=fb', '');
    expect(out.utm_source).toBe('google');
  });
  it('ignores an empty ?src=', () => {
    expect(firstTouch('https://example.com/quote?src=', '').utm_source).toBeUndefined();
  });
  it('keeps first-touch fields together rather than mixing subsequent campaigns', () => {
    const original = firstTouch('https://example.com/?utm_source=facebook&fbclid=first', '');
    expect(firstTouch('https://example.com/?utm_source=google&gclid=second', '', original)).toEqual(original);
  });
  it('restores the first landing after a full page reload', async () => {
    const saved = { landing_url: 'https://example.com/blog?utm_source=google', utm_source: 'google' };
    vi.stubGlobal('window', { location: { href: 'https://example.com/contact' } });
    vi.stubGlobal('document', { referrer: '' });
    vi.stubGlobal('sessionStorage', { getItem: () => JSON.stringify(saved), setItem: vi.fn() });
    const { captureAttribution } = await import('./marketing-attribution');
    expect(captureAttribution()).toEqual(saved);
  });
  it('continues capturing when storage is blocked', async () => {
    vi.stubGlobal('window', { location: { href: 'https://example.com/?utm_source=google' } });
    vi.stubGlobal('document', { referrer: '' });
    vi.stubGlobal('sessionStorage', { getItem: () => { throw Error('blocked'); }, setItem: () => { throw Error('blocked'); } });
    const { captureAttribution } = await import('./marketing-attribution');
    expect(captureAttribution().utm_source).toBe('google');
  });
  it('recovers from malformed stored data', async () => {
    vi.stubGlobal('window', { location: { href: 'https://example.com/?utm_source=facebook' } });
    vi.stubGlobal('document', { referrer: '' });
    vi.stubGlobal('sessionStorage', { getItem: () => '{broken', setItem: vi.fn() });
    const { captureAttribution } = await import('./marketing-attribution');
    expect(captureAttribution().utm_source).toBe('facebook');
  });
});
