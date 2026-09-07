import { leadOwnerAlertText } from "@/emails/LeadOwnerAlert";
import { describe, expect, it } from 'vitest';
import { projectService, referenceNotes } from './project-reference';

describe('project references', () => {
  it('maps all recorded gallery categories to form choices', () => {
    for (const [type, service] of Object.entries({ Carport: 'carport', Garage: 'garage', Barn: 'barn', 'RV Cover': 'rv_cover', 'Lean-To': 'lean_to', 'Porch Cover': 'lean_to', Hybrid: 'other', Other: 'other', Unknown: 'other' })) {
      expect(projectService(type)).toBe(service);
    }
  });
  it('builds a reference without inventing dimensions or colors', () => {
    const note = referenceNotes({ id: 'abc', title: 'Ranch build', city: 'Temple', type: 'Barn' }, 'https://example.com/');
    expect(note).toContain('reference only');
    expect(note).toContain('https://example.com/gallery/abc');
    expect(note).not.toContain('undefined');
    expect(note).not.toContain('dimensions');
  });
});

it('includes the reference in the actual owner email text', () => {
  const message = referenceNotes({ id: 'abc', title: 'Ranch build', city: 'Temple', type: 'Barn' }, 'https://example.com');
  const email = leadOwnerAlertText({ leadId: 'test', name: 'Test', phone: 'test', city: 'Temple', serviceType: 'barn', isMilitary: false, submittedAt: 'test', message });
  expect(email).toContain('Ranch build');
  expect(email).toContain('https://example.com/gallery/abc');
});
