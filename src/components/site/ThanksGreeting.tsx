"use client";

import { useState, useSyncExternalStore } from "react";

/**
 * "Got it, Ray." on /thank-you. A quote form writes the customer's first
 * name, and only that, to sessionStorage right before it goes there; the page
 * reads it once and removes it, so a later visit doesn't greet the wrong
 * person. Its own key: GoogleAdsConversion reads and deletes
 * "tj_ec_user_data" on its own schedule.
 */
export const THANKS_NAME_KEY = "tj_thanks_first_name";

const MAX_NAME = 30;

/** "  Ray Smith " → "Ray". The first word as typed, capped; null when there is none. */
export function firstNameOf(name: string): string | null {
  const first = (name.trim().split(/\s+/)[0] ?? "").replace(/[.,;:!?]+$/, "");
  return Array.from(first).slice(0, MAX_NAME).join("") || null;
}

/** Called by a quote form after a successful send, right before it goes to /thank-you. */
export function stashThanksName(name: string): void {
  try {
    const first = firstNameOf(name);
    if (first) sessionStorage.setItem(THANKS_NAME_KEY, first);
    else sessionStorage.removeItem(THANKS_NAME_KEY);
  } catch {
    // Private mode: the page says "Got it." without the name.
  }
}

/** The stashed first name, removed as it is read. Null when there is none. */
export function takeThanksName(): string | null {
  try {
    const raw = sessionStorage.getItem(THANKS_NAME_KEY);
    sessionStorage.removeItem(THANKS_NAME_KEY);
    return raw ? firstNameOf(raw) : null;
  } catch {
    return null;
  }
}

/**
 * One page view's name. It is read once the page is on screen (React
 * subscribes after it renders), so the server and the first client render
 * both say "Got it." and the name is added after, with no mismatch. A second
 * subscribe (StrictMode) keeps the name it already has.
 */
export function nameStore() {
  let name: string | null = null;
  return {
    subscribe: (onChange: () => void) => {
      if (name === null) {
        name = takeThanksName();
        if (name) onChange();
      }
      return () => {};
    },
    get: () => name,
  };
}

const noName = () => null;

/** The first line of the thank-you heading. Rendered as text, never as HTML. */
export function ThanksGreeting() {
  const [store] = useState(nameStore);
  const name = useSyncExternalStore(store.subscribe, store.get, noName);
  return <>{name ? `Got it, ${name}.` : "Got it."}</>;
}
