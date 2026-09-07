'use client';

import type { ReactNode } from 'react';

export function QuoteShortcut({ service, children, className }: { service: string; children: ReactNode; className?: string }) {
  return <a href="#quote" className={className} onClick={() => {
    window.dispatchEvent(new CustomEvent('triplej:quote-service', { detail: service }));
  }}>{children}</a>;
}
