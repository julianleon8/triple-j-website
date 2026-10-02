import { expect, it } from 'vitest';

import { buildPartnerPayload, canSendPartner, countyLine, type PartnerInput } from './PartnerInquiryForm';

const base: PartnerInput = {
  company_type: 'gc', company_name: ' Acme Builders ', contact_name: ' Dana Cole ',
  phone: '254-555-0100', email: 'dana@acme.test', counties: ['Bell', 'Coryell'],
  volume: '3–5 jobs / mo', notes: ' Mostly 30×40 shops. ',
};

it('maps onto the partner-inquiries schema, with counties and volume in the message', () => {
  expect(buildPartnerPayload(base, null)).toEqual({
    company_name: 'Acme Builders', company_type: 'gc', contact_name: 'Dana Cole',
    email: 'dana@acme.test', phone: '254-555-0100',
    message: 'Counties: Bell, Coryell · Volume: 3–5 jobs / mo\n\nMostly 30×40 shops.',
    captcha_token: undefined,
  });
});

it('always sends a message long enough for the schema', () => {
  const m = buildPartnerPayload({ ...base, counties: [], volume: '', notes: '' }, 'tok').message;
  expect(m).toBe('Counties: none picked');
  expect(m.length).toBeGreaterThanOrEqual(10);
});

it('requires company, name and an email the API will accept', () => {
  expect(canSendPartner(base)).toBe(true);
  expect(canSendPartner({ ...base, email: '' })).toBe(false);
  expect(canSendPartner({ ...base, company_name: 'A' })).toBe(false);
});

it('words the county line for the success panel', () => {
  expect(countyLine([])).toBe('Central Texas');
  expect(countyLine(['Bell'])).toBe('Bell County');
  expect(countyLine(['Bell', 'Coryell'])).toBe('Bell, Coryell counties');
});
