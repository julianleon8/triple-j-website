'use client';

import { useEffect } from 'react';
import { captureAttribution } from '@/lib/marketing-attribution';

export function MarketingAttribution() {
  useEffect(() => { captureAttribution(); }, []);
  return null;
}
