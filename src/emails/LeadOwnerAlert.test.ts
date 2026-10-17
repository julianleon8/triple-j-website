import { describe, expect, it } from 'vitest';
import { PRESETS } from '@/lib/builder/design';
import { leadMessage } from '@/lib/builder/summary';
import LeadOwnerAlert, { formatSubmittedAt, leadOwnerAlertText } from './LeadOwnerAlert';

const base = {
  leadId: 'lead-1',
  name: 'Test Person',
  phone: '254-555-0100',
  city: 'Killeen',
  serviceType: 'carport',
  isMilitary: false,
  submittedAt: 'Sep 7, 2026, 9:00:00 AM CDT',
};

describe('leadOwnerAlertText — best time to call', () => {
  it('surfaces the call window with the contact details, not buried in the build spec', () => {
    const text = leadOwnerAlertText({ ...base, bestTimeLabel: 'Evening (after 5)' });
    expect(text).toContain('Evening (after 5)');
    // It belongs above the DETAILS divider, next to the phone number.
    expect(text.indexOf('Evening (after 5)')).toBeLessThan(text.indexOf('— DETAILS —'));
  });

  it('leaves no orphan line when the customer did not answer', () => {
    const text = leadOwnerAlertText(base);
    expect(text).not.toContain('Best time');
    expect(text).not.toContain('undefined');
    expect(text).not.toContain('null');
  });

  it('still leads with the name and phone', () => {
    const text = leadOwnerAlertText({ ...base, bestTimeLabel: 'Morning (before noon)' });
    expect(text).toContain('NEW LEAD — Test Person');
    expect(text).toContain('📞 254-555-0100');
  });
});

describe('LeadOwnerAlert — leads with no phone to dial', () => {
  const messengerLead = { ...base, phone: 'messenger', source: 'facebook_messenger' };

  it('offers Reply on Messenger, never a tel:/sms: link to the placeholder', async () => {
    const { renderToStaticMarkup } = await import('react-dom/server');
    const { default: LeadOwnerAlert } = await import('./LeadOwnerAlert');
    const html = renderToStaticMarkup(LeadOwnerAlert(messengerLead));
    expect(html).toContain('Reply on Messenger');
    expect(html).toContain('https://business.facebook.com/latest/inbox/messages');
    expect(html).not.toContain('tel:messenger');
    expect(html).not.toContain('sms:messenger');
    expect(html).not.toContain('Call now');
  });

  it('keeps Call and Text for a real number', async () => {
    const { renderToStaticMarkup } = await import('react-dom/server');
    const { default: LeadOwnerAlert } = await import('./LeadOwnerAlert');
    const html = renderToStaticMarkup(LeadOwnerAlert(base));
    expect(html).toContain('href="tel:2545550100"');
    expect(html).toContain('href="sms:2545550100"');
    expect(html).not.toContain('Reply on Messenger');
  });

  it('says so in the plain-text version instead of printing the placeholder', () => {
    expect(leadOwnerAlertText(messengerLead)).toContain('📞 None (Messenger DM');
    expect(leadOwnerAlertText({ ...base, phone: 'Not provided', source: 'facebook_lead_ads' })).toContain('📞 Not provided');
  });
});

describe('LeadOwnerAlert — 3D builder leads', () => {
  const builderLead = {
    ...base,
    source: 'builder',
    designUrl: 'https://www.triplejmetaltx.com/build#d=abc',
    message: 'Designed in the 3D builder:\nBuilding: Garage & shop · 30×30 ft\nRoof: Gabled roof · 10 ft eave',
  };

  it('links the design and keeps the summary on separate lines', async () => {
    const { renderToStaticMarkup } = await import('react-dom/server');
    const LeadOwnerAlert = (await import('./LeadOwnerAlert')).default;
    const html = renderToStaticMarkup(LeadOwnerAlert(builderLead));
    expect(html).toContain('href="https://www.triplejmetaltx.com/build#d=abc"');
    expect(html).toMatch(/white-space:\s*pre-wrap/);
    expect(leadOwnerAlertText(builderLead)).toContain('3D design: https://www.triplejmetaltx.com/build#d=abc');
  });

  it('adds no 3D row to an ordinary lead', () => {
    expect(leadOwnerAlertText(base)).not.toContain('3D design');
  });
});

describe('LeadOwnerAlert — the 3D link shows once', () => {
  const designUrl = 'https://www.triplejmetaltx.com/build#d=abc';
  const builderLead = {
    ...base,
    source: 'builder',
    designUrl,
    message: leadMessage(PRESETS.garage, designUrl, 'Gate on the north side'),
  };
  const count = (s: string, part: string) => s.split(part).length - 1;

  it('keeps the "3D design" row and drops the link line from the notes', async () => {
    const { renderToStaticMarkup } = await import('react-dom/server');
    const html = renderToStaticMarkup(LeadOwnerAlert(builderLead));
    expect(count(html, designUrl)).toBe(1);
    expect(html).not.toContain('Open the design in 3D:');
    expect(html).toContain('Designed in the 3D builder:');
    expect(html).toContain('Gate on the north side');
  });

  it('does the same in the plain-text version', () => {
    const text = leadOwnerAlertText(builderLead);
    expect(count(text, designUrl)).toBe(1);
    expect(text).toContain(`3D design: ${designUrl}`);
    expect(text).not.toContain('Open the design in 3D:');
    expect(text).toContain('Customer notes:\nGate on the north side');
  });

  it('leaves the notes alone when there is no 3D row to carry the link', () => {
    const text = leadOwnerAlertText({ ...builderLead, designUrl: null });
    expect(text).toContain(`Open the design in 3D: ${designUrl}`);
  });
});

describe('formatSubmittedAt — Central time with the right abbreviation', () => {
  it('says CDT in summer', () => {
    expect(formatSubmittedAt(new Date('2026-07-04T15:00:00Z'))).toBe('7/4/2026, 10:00:00 AM CDT');
  });

  it('says CST in winter', () => {
    expect(formatSubmittedAt(new Date('2026-01-15T15:00:00Z'))).toBe('1/15/2026, 9:00:00 AM CST');
  });

  it('switches on the night the clocks change, not on a fixed date', () => {
    // 2026-11-01: 1:59 AM CDT, then 1:00 AM CST.
    expect(formatSubmittedAt(new Date('2026-11-01T06:59:00Z'))).toMatch(/1:59:00 AM CDT$/);
    expect(formatSubmittedAt(new Date('2026-11-01T07:00:00Z'))).toMatch(/1:00:00 AM CST$/);
  });
});
