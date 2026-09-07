import { describe, it, expect } from 'vitest';
import { summarizeBuild, indefiniteArticle } from './quote-summary';

const full = {
  service_type: 'carport',
  structure_type: 'welded',
  width: '20',
  length: '30',
  height: '12',
  zip: '76542',
};

describe('summarizeBuild', () => {
  it('composes the complete sentence', () => {
    expect(summarizeBuild(full)).toBe('A 20×30×12 welded carport in Killeen');
  });

  it('drops the height but keeps the footprint', () => {
    expect(summarizeBuild({ ...full, height: '' })).toBe('A 20×30 welded carport in Killeen');
  });

  it('drops the size entirely when the footprint is incomplete', () => {
    // A lone width is not a size; showing "20×" would be worse than nothing.
    expect(summarizeBuild({ ...full, length: '', height: '' })).toBe('A welded carport in Killeen');
    expect(summarizeBuild({ ...full, width: '', length: '', height: '' })).toBe(
      'A welded carport in Killeen',
    );
  });

  it('drops the adjective when the customer is unsure', () => {
    expect(summarizeBuild({ ...full, structure_type: 'unsure' })).toBe(
      'A 20×30×12 carport in Killeen',
    );
    expect(summarizeBuild({ ...full, structure_type: '' })).toBe('A 20×30×12 carport in Killeen');
  });

  it('never echoes an unrecognised ZIP back at the customer', () => {
    const out = summarizeBuild({ ...full, zip: '79101' });
    expect(out).toBe('A 20×30×12 welded carport');
    expect(out).not.toContain('79101');
  });

  it('returns null when the service is unknown', () => {
    expect(summarizeBuild({ ...full, service_type: '' })).toBeNull();
    expect(summarizeBuild({ ...full, service_type: 'barndominium' })).toBeNull();
    expect(summarizeBuild({})).toBeNull();
  });

  it('survives junk in the dimension fields', () => {
    for (const bad of ['abc', '0', '-5', ' ', '1e9999', '9999', '12.5', '20 30']) {
      const out = summarizeBuild({ ...full, height: bad });
      expect(out).not.toMatch(/NaN|Infinity|×\s*$|×0/);
      expect(out).toBe('A 20×30 welded carport in Killeen');
    }
  });

  it('tolerates a unit suffix on a dimension', () => {
    expect(summarizeBuild({ ...full, height: "12ft" })).toBe('A 20×30×12 welded carport in Killeen');
    expect(summarizeBuild({ ...full, height: "12'" })).toBe('A 20×30×12 welded carport in Killeen');
  });

  it('uses the service label, not the raw enum value', () => {
    expect(summarizeBuild({ service_type: 'rv_cover' })).toBe('An RV or boat cover');
    expect(summarizeBuild({ service_type: 'garage' })).toBe('A metal garage');
    expect(summarizeBuild({ service_type: 'barn' })).toBe('A metal barn');
    expect(summarizeBuild({ service_type: 'lean_to' })).toBe('A lean-to patio');
    expect(summarizeBuild({ service_type: 'other' })).toBe('A custom build');
  });

  it('never contains a price', () => {
    expect(summarizeBuild(full)).not.toMatch(/\$|\bK\b|\d{3,},\d{3}/);
  });
});

describe('indefiniteArticle', () => {
  it('handles the numbers dimensions produce', () => {
    expect(indefiniteArticle('20×30 carport')).toBe('A');
    expect(indefiniteArticle('8×10 carport')).toBe('An');
    expect(indefiniteArticle('80×100 shop')).toBe('An');
    expect(indefiniteArticle('11×20 carport')).toBe('An');
    expect(indefiniteArticle('18×24 carport')).toBe('An');
    expect(indefiniteArticle('110×20 shop')).toBe('A');
    expect(indefiniteArticle('180×20 shop')).toBe('A');
    expect(indefiniteArticle('12×20 carport')).toBe('A');
  });

  it('handles words and initialisms', () => {
    expect(indefiniteArticle('carport')).toBe('A');
    expect(indefiniteArticle('enclosed garage')).toBe('An');
    expect(indefiniteArticle('RV or boat cover')).toBe('An');
    expect(indefiniteArticle('')).toBe('A');
  });

  it('flows through to the real 8-foot summary', () => {
    expect(summarizeBuild({ service_type: 'carport', width: '8', length: '10' })).toBe(
      'An 8×10 carport',
    );
  });
});
