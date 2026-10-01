import { expect, it } from 'vitest';

import { parseCspReports } from './csp-report';

it('reads the legacy report-uri body and drops query strings', () => {
  expect(parseCspReports({ 'csp-report': {
    'document-uri': 'https://www.example.com/quote?service=carport&city=temple',
    'violated-directive': 'frame-src',
    'effective-directive': 'frame-src',
    'blocked-uri': 'https://newassets.hcaptcha.com/captcha/v1/abc?token=secret',
  } })).toEqual([{ directive: 'frame-src', blocked: 'https://newassets.hcaptcha.com/captcha/v1/abc', page: 'https://www.example.com/quote' }]);
});

it('reads Reporting API batches and ignores other report types', () => {
  expect(parseCspReports([
    { type: 'deprecation', body: { id: 'x' } },
    { type: 'csp-violation', body: { documentURL: 'https://www.example.com/contact', effectiveDirective: 'frame-src', blockedURL: 'https://www.google.com/maps/embed' } },
  ])).toEqual([{ directive: 'frame-src', blocked: 'https://www.google.com/maps/embed', page: 'https://www.example.com/contact' }]);
});

it('returns nothing for bodies that are not CSP reports', () => {
  expect(parseCspReports(null)).toEqual([]);
  expect(parseCspReports({ hello: 'world' })).toEqual([]);
  expect(parseCspReports('csp-report')).toEqual([]);
});
