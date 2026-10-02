import { expect, it } from 'vitest';

import { filterByCities, filterByTypes, type BuildItem } from './forge-builds';

const b = (city: string, type = 'Carport'): BuildItem => ({
  id: city, title: city, city, type, img: '/x.jpg', alt: '', featured: false, createdAt: null, tag: null,
});

it('treats legacy city labels as the same city', () => {
  const items = [b('Temple'), b('Temple, TX'), b('Temple Texas'), b('Temple, Texas'), b('Belton')];
  expect(filterByCities(items, ['Temple']).map((i) => i.id)).toEqual(['Temple', 'Temple, TX', 'Temple Texas', 'Temple, Texas']);
});

it('filters by gallery type, case-insensitively', () => {
  const items = [b('a', 'Carport'), b('b', 'RV Cover'), b('c', 'Barn')];
  expect(filterByTypes(items, ['carport', 'rv cover']).map((i) => i.id)).toEqual(['a', 'b']);
});
