import { describe, it, expect } from 'vitest';
import { parseQuotePrefill } from './quote-prefill';

describe('parseQuotePrefill — service', () => {
  it('accepts every canonical service value', () => {
    for (const v of ['carport', 'garage', 'barn', 'rv_cover', 'lean_to', 'other']) {
      expect(parseQuotePrefill({ service: v }).service).toBe(v);
    }
  });

  it('maps the aliases that actually appear in ad copy', () => {
    expect(parseQuotePrefill({ service: 'rv' }).service).toBe('rv_cover');
    expect(parseQuotePrefill({ service: 'boat' }).service).toBe('rv_cover');
    expect(parseQuotePrefill({ service: 'patio' }).service).toBe('lean_to');
    expect(parseQuotePrefill({ service: 'porch' }).service).toBe('lean_to');
    expect(parseQuotePrefill({ service: 'lean-to' }).service).toBe('lean_to');
    expect(parseQuotePrefill({ service: 'shop' }).service).toBe('garage');
  });

  it('is case- and whitespace-insensitive', () => {
    expect(parseQuotePrefill({ service: '  RV_Cover ' }).service).toBe('rv_cover');
  });

  it('drops an unknown service rather than guessing', () => {
    expect(parseQuotePrefill({ service: 'barndominium' }).service).toBeUndefined();
    expect(parseQuotePrefill({ service: '' }).service).toBeUndefined();
  });

  it('drops a repeated param as ambiguous', () => {
    expect(parseQuotePrefill({ service: ['carport', 'barn'] }).service).toBeUndefined();
  });
});

describe('parseQuotePrefill — city and zip', () => {
  it('resolves a city slug to its primary ZIP', () => {
    expect(parseQuotePrefill({ city: 'killeen' }).zip).toBe('76541');
  });

  it('normalises the forms a human or an ad would write', () => {
    expect(parseQuotePrefill({ city: 'Killeen, TX' }).zip).toBe('76541');
    expect(parseQuotePrefill({ city: '  Killeen Texas ' }).zip).toBe('76541');
    expect(parseQuotePrefill({ city: 'harker_heights' }).zip).toBe(
      parseQuotePrefill({ city: 'harker-heights' }).zip,
    );
    expect(parseQuotePrefill({ city: 'harker heights' }).zip).toBeDefined();
  });

  it('accepts a bare ZIP through either param', () => {
    expect(parseQuotePrefill({ zip: '76542' }).zip).toBe('76542');
    expect(parseQuotePrefill({ city: '76542' }).zip).toBe('76542');
  });

  it('prefers an explicit zip over a city', () => {
    expect(parseQuotePrefill({ zip: '76502', city: 'killeen' }).zip).toBe('76502');
  });

  it('drops a city we do not serve rather than inventing a ZIP', () => {
    // A wrong ZIP here would land in leads.city — the corruption 028 repairs.
    expect(parseQuotePrefill({ city: 'dallas' }).zip).toBeUndefined();
    expect(parseQuotePrefill({ zip: '9021' }).zip).toBeUndefined();
    expect(parseQuotePrefill({ zip: 'abcde' }).zip).toBeUndefined();
  });
});

describe('parseQuotePrefill — project', () => {
  const uuid = '162e4b86-1a2b-4c3d-8e4f-5a6b7c8d9e0f';

  it('keeps a well-formed uuid', () => {
    expect(parseQuotePrefill({ project: uuid }).projectId).toBe(uuid);
  });

  it('drops anything that is not a uuid', () => {
    expect(parseQuotePrefill({ project: 'garbage' }).projectId).toBeUndefined();
    expect(parseQuotePrefill({ project: '' }).projectId).toBeUndefined();
    expect(parseQuotePrefill({ project: [uuid, uuid] }).projectId).toBeUndefined();
  });
});

describe('parseQuotePrefill — nothing to do', () => {
  it('returns an empty object when no recognised param is present', () => {
    expect(parseQuotePrefill({})).toEqual({});
    expect(parseQuotePrefill({ utm_source: 'fb', src: 'fb' })).toEqual({});
  });
});
