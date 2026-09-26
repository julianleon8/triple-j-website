import { describe, expect, it } from 'vitest';
import { fencingNotes } from './fencing-inquiry';

describe('fencing inquiry notes', () => {
  it('preserves linear footage, style, gates and removal for the existing lead inbox', () => {
    expect(fencingNotes({ fence_style: 'Pipe / ranch', fence_length: '250', fence_height: '5', fence_gates: '  1 driveway gate, 12 ft  ', fence_removal: 'Yes' })).toBe('Requested build: Metal Fencing & Gates\nFence style: Pipe / ranch\nFence length: 250 linear ft\nFence height: 5 ft\nGates: 1 driveway gate, 12 ft\nOld fence removal: Yes');
  });
  it('allows an undecided customer without inventing measurements', () => {
    const notes = fencingNotes({ fence_style: '', fence_length: '', fence_height: '', fence_gates: ' ', fence_removal: '' });
    expect(notes).toContain('Fence style: Not sure yet');
    expect(notes).not.toContain('ft');
    expect(notes).not.toContain('Gates:');
  });
});
