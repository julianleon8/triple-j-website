import { expect, it } from 'vitest';

import { MILITARY_BASES, militarySavings } from './MilitaryCalculator';

it('uses the sales-pack starting prices for each base', () => {
  expect(MILITARY_BASES.map((b) => [b.v, b.base])).toEqual([
    ['carport', 3000],
    ['garage', 5500],
    ['barn', 6500],
  ]);
});

it('rounds 7% of each base to whole dollars', () => {
  expect(MILITARY_BASES.map((b) => militarySavings(b.base, 7))).toEqual([210, 385, 455]);
  expect(militarySavings(3333, 7)).toBe(233);
});
