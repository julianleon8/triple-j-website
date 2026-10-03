import { readFileSync } from 'node:fs';
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

import { buildLeadPayload, QUOTE_FORM_INITIAL, QuoteForm, type QuoteFormProps } from './QuoteForm';
import { quoteLede } from '../forge/QuoteSection';

// Every prop is optional, so createElement's inference needs the component
// type spelled out.
const render = (props: QuoteFormProps = {}) =>
  renderToStaticMarkup(createElement(QuoteForm as FC<QuoteFormProps>, props));

it('renders the full section by default, so the inline pages are unchanged', () => {
  const html = render();
  expect(html).toContain('id="quote"');
  expect(html).toContain('aria-labelledby="quote-heading"');
  expect(html).toContain('id="quote-heading"');
  expect(html).toContain('Get a quote');
  expect(html).toContain('Military, first-responder &amp; trade discounts honored');
  expect(html).toContain('data-forge');
  // The form card itself is present in both modes.
  expect(html).toContain('id="quote-card"');
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
  expect(html).not.toContain('Get a quote');
  expect(html).not.toContain('trade discounts honored');
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

// The reassurance line sits on step 2, so these assert on the source strings
// the component renders there.
it('promises the same thing on /quote as the page headline does', () => {
  // Step 2 is not rendered on first paint; the copy lives in the component.
  const src = readFileSync(new URL('./QuoteForm.tsx', import.meta.url), 'utf8');
  expect(src).toContain('same day, guaranteed within 24 hours.');
  expect(src).toContain('reply within 24 hours.');
  // Locked Decisions: nothing may say "most replies".
  expect(src.toLowerCase()).not.toContain('most replies');
});

it('preselects the service chip from ?service=', () => {
  const html = render({ chrome: false, initialService: 'rv_cover' });
  // rv_cover lights the shared "Carport / RV Cover" chip.
  const pressed = html.split('<button').find((b) => b.includes('aria-pressed="true"')) ?? '';
  expect(pressed).toContain('Carport / RV Cover');
});

it('prefills the ZIP from ?city=', () => {
  const html = render({ chrome: false, initialZip: '76541' });
  expect(html).toContain('value="76541"');
});

it('shows fence scope instead of building construction and dimensions', () => {
  const html = render({ initialService: 'fencing' });
  expect(html).toContain('Fence Style');
  expect(html).toContain('Total fence length in linear feet');
  expect(html).toContain('Fence height in feet');
  expect(html).toContain('Old Fence Removal Needed?');
  expect(html).not.toContain('W × L × H');
  expect(html).not.toContain('Welded is permanent');
});

it('fills the lede with what the page already picked', () => {
  expect(quoteLede({})).toContain('Two quick steps. A real Texas crew');
  expect(quoteLede({ serviceName: 'Carports' })).toContain('carports is already picked');
  expect(quoteLede({ city: 'Temple' })).toContain('your Temple ZIP is already filled in');
  expect(quoteLede({ military: true })).toContain('pre-checked on step two');
  expect(quoteLede({ military: true })).not.toContain('same day');
  expect(render({ lede: quoteLede({ city: 'Belton' }) })).toContain('your Belton ZIP');
});

// Payload contract: the Forge restyle may not change a key or value of the
// /api/leads body for equivalent input. Only the permits line is new.
const filled = {
  ...QUOTE_FORM_INITIAL,
  service_type: 'carport' as const,
  structure_type: 'welded' as const,
  width: '20', length: '30', height: '12', zip: '76502',
  name: ' Maria Garcia ', phone: '254-555-0100', email: 'maria@example.com',
  needs_concrete: 'already_have' as const, current_surface: 'gravel' as const,
  timeline: 'this_month' as const, best_time_to_call: 'morning' as const,
  budget: '5_10k' as const, is_military: true, message: ' Gate code 1234 ',
};

it('keeps the lead payload identical, plus permits in the notes', () => {
  const payload = buildLeadPayload({ ...filled, permits: 'not_sure' }, { source: 'website_form', captchaToken: 'tok', referenceId: undefined });
  expect(payload).toEqual({
    name: 'Maria Garcia', phone: '254-555-0100', email: 'maria@example.com', zip: '76502',
    service_type: 'carport', structure_type: 'welded', width: '20', length: '30', height: '12',
    needs_concrete: 'already_have', current_surface: 'gravel', timeline: 'this_month',
    best_time_to_call: 'morning', source: 'website_form',
    estimated_budget_min: 5000, estimated_budget_max: 10000, is_military: true,
    message: 'Gate code 1234\n\nPermits: Not sure',
    captcha_token: 'tok', reference_project_id: undefined,
  });
});

it('omits permits from the notes when unanswered', () => {
  const payload = buildLeadPayload(filled, { source: 'quote_page', captchaToken: null });
  expect(payload.message).toBe('Gate code 1234');
  expect(payload.source).toBe('quote_page');
  expect(payload.captcha_token).toBeUndefined();
});

it('maps the new budget bands', () => {
  const over = buildLeadPayload({ ...filled, budget: 'over_20k' }, { source: 'website_form', captchaToken: null });
  expect([over.estimated_budget_min, over.estimated_budget_max]).toEqual([20000, undefined]);
  const unsure = buildLeadPayload({ ...filled, budget: 'not_sure' }, { source: 'website_form', captchaToken: null });
  expect([unsure.estimated_budget_min, unsure.estimated_budget_max]).toEqual([undefined, undefined]);
});

it('still files fencing and lean-to as other with their scope in the notes', () => {
  const fence = buildLeadPayload({ ...filled, service_type: 'fencing', message: '' }, { source: 'website_form', captchaToken: null });
  expect(fence.service_type).toBe('other');
  expect(fence.structure_type).toBeUndefined();
  expect(fence.needs_concrete).toBeUndefined();
  expect(fence.message).toContain('Requested build: Metal Fencing & Gates');
  const lean = buildLeadPayload({ ...filled, service_type: 'lean_to', message: '' }, { source: 'website_form', captchaToken: null });
  expect(lean.service_type).toBe('other');
  expect(lean.message).toBe('Requested build: Lean-To / Patio');
});
