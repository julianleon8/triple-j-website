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
