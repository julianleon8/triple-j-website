import { describe, expect, it } from 'vitest';

import {
  buttonArrowClass,
  buttonClass,
  buttonVariants,
  pillClass,
  sectionDataTone,
  sectionTones,
} from './styles';
import { isPlainAnchor } from './ForgeButton';

describe('Forge buttons', () => {
  it('maps each variant to its surface colours', () => {
    expect(buttonVariants.white).toContain('bg-white');
    expect(buttonVariants.white).toContain('hover:bg-forge-silver');
    expect(buttonVariants.navy).toContain('bg-forge-navy');
    expect(buttonVariants.navy).toContain('hover:bg-forge-navy-raised');
    expect(buttonVariants.outlineDark).toContain('border-white/40');
    expect(buttonVariants.outlineLight).toContain('border-forge-silver');
  });

  it('keeps royal blue to the one documented exception', () => {
    const blue = Object.entries(buttonVariants).filter(([, cls]) => cls.includes('forge-link'));
    expect(blue.map(([k]) => k)).toEqual(['linkAccent']);
  });

  it('colours the arrow slate only inside the white button', () => {
    expect(buttonArrowClass.white).toBe('text-forge-slate');
    expect(buttonArrowClass.navy).toBe('');
  });

  it('composes base, variant, size and width', () => {
    const cls = buttonClass('navy', 'lg', true, 'mt-4');
    expect(cls).toContain('rounded-[6px]');
    expect(cls).toContain('px-[26px] py-[15px] text-[16px]');
    expect(cls).toContain('w-full');
    expect(cls.endsWith('mt-4')).toBe(true);
    expect(buttonClass('white', 'tap')).toContain('h-11');
  });

  it('never routes in-page, phone, mail or external links through <Link>', () => {
    expect(isPlainAnchor('#quote')).toBe(true);
    expect(isPlainAnchor('/#quote')).toBe(true);
    expect(isPlainAnchor('tel:+12543467764')).toBe(true);
    expect(isPlainAnchor('mailto:a@b.c')).toBe(true);
    expect(isPlainAnchor('https://example.com')).toBe(true);
    expect(isPlainAnchor('/services/carports')).toBe(false);
  });
});

describe('Forge pills', () => {
  it('fills navy when selected and stays silver when not', () => {
    expect(pillClass(true)).toContain('bg-forge-navy');
    expect(pillClass(false)).toContain('border-forge-silver');
    expect(pillClass(false)).not.toContain('bg-forge-navy');
  });

  it('fills olive for the military calculator', () => {
    expect(pillClass(true, 'olive')).toContain('bg-forge-olive');
  });
});

describe('Forge sections', () => {
  it('maps tones to bands and marks navy as a dark surface', () => {
    expect(sectionTones.navy).toContain('bg-forge-navy');
    expect(sectionTones.fog).toContain('bg-forge-fog');
    expect(sectionDataTone('navy')).toBe('dark');
    expect(sectionDataTone('white')).toBe('light');
  });
});
