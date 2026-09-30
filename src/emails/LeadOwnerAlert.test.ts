import { describe, expect, it } from 'vitest';
import { leadOwnerAlertText } from './LeadOwnerAlert';

const base = {
  leadId: 'lead-1',
  name: 'Test Person',
  phone: '254-555-0100',
  city: 'Killeen',
  serviceType: 'carport',
  isMilitary: false,
  submittedAt: 'Sep 7, 2026, 9:00:00 AM CST',
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
