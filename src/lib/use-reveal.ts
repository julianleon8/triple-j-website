"use client";

import { useEffect, useRef } from "react";

/**
 * One-shot scroll-triggered reveal.
 *
 * Returns a ref. Attach it to any element wearing the `.reveal` CSS class
 * (defined in globals.css). When the element enters the viewport (10%
 * threshold), this hook sets `data-revealed="true"`, which triggers the
 * fade + slide-up transition. The IntersectionObserver disconnects after
 * the first intersection — reveals don't re-fire on scroll-out.
 *
 * If `IntersectionObserver` is unavailable (very old browsers, SSR), the
 * element is revealed immediately so content never gets stuck hidden.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      node.dataset.revealed = "true";
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.revealed = "true";
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" },
    );

    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  return ref;
}
