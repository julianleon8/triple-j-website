'use client'

import { useMemo, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { ChevronRight, Smartphone } from 'lucide-react'
import { draftHref, draftTitle, listUnsavedDrafts, type CaptureDraft } from '@/lib/hq/capture-draft'

function subscribeStorage(onChange: () => void) {
  window.addEventListener('storage', onChange)
  return () => window.removeEventListener('storage', onChange)
}

function readSnapshot(): string {
  try {
    return JSON.stringify(listUnsavedDrafts(window.localStorage))
  } catch {
    return '[]'
  }
}

/**
 * Captures that exist only on this phone — the way back to them.
 *
 * DraftsToFinish counts rows on the server, so it cannot see a capture with no
 * phone number yet (no row exists) or one whose last edits never landed (the
 * row looks finished). Both are still on the phone, and opening one sends it.
 *
 * The server snapshot is always empty, so the list appears on hydration. The
 * snapshot is a string because useSyncExternalStore compares by identity and a
 * freshly built array would never compare equal.
 */
export function SavedOnThisPhone() {
  const raw = useSyncExternalStore(subscribeStorage, readSnapshot, () => '[]')
  const drafts = useMemo(() => JSON.parse(raw) as CaptureDraft[], [raw])

  if (drafts.length === 0) return null

  return (
    <section className="overflow-hidden rounded-md border border-(--border-subtle) bg-(--surface-2)">
      <h2 className="px-4 pt-3 font-display text-[14px] font-semibold uppercase tracking-[0.1em] text-(--text-secondary)">
        Saved on this phone · not in HQ yet
      </h2>
      <ul className="divide-y divide-(--border-subtle)">
        {drafts.map((d) => (
          <li key={d.leadId ?? 'new'}>
            <Link href={draftHref(d)} className="tap-list flex min-h-[60px] items-center gap-3 px-4 py-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-(--surface-3) text-(--brand-fg)">
                <Smartphone size={17} strokeWidth={2.2} aria-hidden />
              </span>
              <span className="min-w-0 flex-1 truncate font-display text-[19px] font-semibold uppercase tracking-[0.04em] text-(--text-primary)">
                {draftTitle(d)}
              </span>
              <span className="shrink-0 font-display text-[15px] font-bold uppercase tracking-[0.04em] text-(--link-fg)">
                Finish
              </span>
              <ChevronRight size={18} strokeWidth={2.2} className="shrink-0 text-(--text-tertiary)" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
