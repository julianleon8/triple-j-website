import { expect, it } from 'vitest';

import { quoteServiceForGalleryType } from './forge-quote';

it('maps gallery item types to quote services', () => {
  expect(quoteServiceForGalleryType('Carport')).toBe('carport');
  expect(quoteServiceForGalleryType('RV Cover')).toBe('carport');
  expect(quoteServiceForGalleryType('Lean-To')).toBe('lean_to');
  expect(quoteServiceForGalleryType('Porch Cover')).toBe('lean_to');
  expect(quoteServiceForGalleryType('Garage')).toBe('garage');
  expect(quoteServiceForGalleryType('Barn')).toBe('barn');
  expect(quoteServiceForGalleryType('Fencing')).toBe('fencing');
  expect(quoteServiceForGalleryType('Hybrid')).toBe('other');
  expect(quoteServiceForGalleryType(null)).toBe('other');
});
