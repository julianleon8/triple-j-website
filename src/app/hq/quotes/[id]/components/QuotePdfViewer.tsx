'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Download, RotateCw, Share } from 'lucide-react'

type Props = {
  /** Where the PDF comes from — /api/quotes/[id]/pdf in HQ. */
  src: string
  quoteNumber: string
}

type ViewState =
  | { phase: 'loading' }
  | { phase: 'ready' }
  | { phase: 'error'; message: string }

const noopSubscribe = () => () => {}

/**
 * Standalone = launched from the Home Screen icon. There is no browser chrome
 * there, so anything that navigates to a bare file (a download, a blob URL)
 * strands the user on it with no way back — the bug this viewer replaces.
 */
function isStandalone(): boolean {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches === true ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function canShareFiles(): boolean {
  if (typeof navigator.canShare !== 'function') return false
  try {
    return navigator.canShare({
      files: [new File([], 'quote.pdf', { type: 'application/pdf' })],
    })
  } catch {
    return false
  }
}

/**
 * Draws the quote PDF inside the HQ page with pdf.js, one canvas per page.
 *
 * Not an <iframe>: iOS draws an embedded PDF as a fixed-size image of page one
 * that overflows a phone screen, and opening the PDF directly takes over the
 * whole installed app. pdf.js renders at exactly the column width everywhere.
 *
 * The library (~1.8 MB with its worker) loads only when this page opens, and
 * next.config.ts keeps it out of the service worker's precache so website
 * visitors never download it.
 */
export function QuotePdfViewer({ src, quoteNumber }: Props) {
  const pagesRef = useRef<HTMLDivElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [view, setView] = useState<ViewState>({ phase: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const [actionError, setActionError] = useState<string | null>(null)

  const shareable = useSyncExternalStore(noopSubscribe, canShareFiles, () => false)
  const standalone = useSyncExternalStore(noopSubscribe, isStandalone, () => false)
  // In the installed app the share sheet is the way out ("Save to Files",
  // Mail, Messages, Print). A plain download is offered wherever it can't
  // strand anyone: in a browser tab, or where there is no share sheet.
  const showDownload = !shareable || !standalone

  useEffect(() => {
    let cancelled = false
    let destroyTask: (() => void) | null = null

    ;(async () => {
      try {
        const res = await fetch(src, { cache: 'no-store' })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(typeof body.error === 'string' ? body.error : `PDF failed to load (${res.status})`)
        }
        const blob = await res.blob()
        // The route owns the filename (Content-Disposition); reuse it so a
        // shared or saved file is named the same as a browser download.
        const name =
          /filename="([^"]+)"/.exec(res.headers.get('Content-Disposition') ?? '')?.[1] ??
          `quote-${quoteNumber}.pdf`
        if (cancelled) return
        setFile(new File([blob], name, { type: 'application/pdf' }))

        // Legacy build: same output, transpiled for older Safari. Field
        // phones are not always on the newest iOS.
        const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
          import.meta.url,
        ).toString()

        // getDocument transfers the buffer to the worker, so it gets its own
        // copy — `file` above must stay intact for Share/Download.
        const task = pdfjs.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) })
        destroyTask = () => void task.destroy()
        const doc = await task.promise

        const host = pagesRef.current
        if (cancelled || !host) return
        host.replaceChildren()

        // Render at the column's device-pixel width so text is sharp on a
        // retina screen; CSS then scales the canvas to the column.
        const cssWidth = host.clientWidth
        const dpr = Math.min(window.devicePixelRatio || 1, 3)
        for (let n = 1; n <= doc.numPages; n++) {
          const page = await doc.getPage(n)
          if (cancelled) return
          const unscaled = page.getViewport({ scale: 1 })
          const viewport = page.getViewport({ scale: (cssWidth * dpr) / unscaled.width })
          const canvas = document.createElement('canvas')
          canvas.width = Math.floor(viewport.width)
          canvas.height = Math.floor(viewport.height)
          canvas.className = 'block h-auto w-full rounded-md bg-white shadow-lg'
          canvas.setAttribute('role', 'img')
          canvas.setAttribute('aria-label', `Quote ${quoteNumber}, page ${n} of ${doc.numPages}`)
          host.appendChild(canvas)
          await page.render({ canvas, viewport }).promise
        }
        if (!cancelled) setView({ phase: 'ready' })
      } catch (err) {
        if (cancelled) return
        pagesRef.current?.replaceChildren()
        setView({
          phase: 'error',
          message: err instanceof Error ? err.message : 'Could not show the PDF',
        })
      }
    })()

    return () => {
      cancelled = true
      destroyTask?.()
    }
  }, [src, quoteNumber, attempt])

  function retry() {
    setView({ phase: 'loading' })
    setAttempt((a) => a + 1)
  }

  async function share() {
    if (!file) return
    setActionError(null)
    try {
      await navigator.share({ files: [file], title: `Quote ${quoteNumber}` })
    } catch (err) {
      // Closing the share sheet rejects with AbortError — that's a choice,
      // not a failure.
      if (err instanceof DOMException && err.name === 'AbortError') return
      setActionError(err instanceof Error ? err.message : 'Share failed')
    }
  }

  function download() {
    if (!file) return
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 truncate font-mono text-[12px] text-(--text-tertiary)">{quoteNumber}</p>
        <div className="flex shrink-0 gap-2">
          {shareable && (
            <button
              type="button"
              onClick={share}
              disabled={!file}
              className="inline-flex items-center gap-2 rounded-xl bg-(--brand-fg) px-4 py-2.5 text-[14px] font-semibold text-(--text-on-brand) tap-solid disabled:opacity-50"
            >
              <Share size={16} strokeWidth={2} /> Share
            </button>
          )}
          {showDownload && (
            <button
              type="button"
              onClick={download}
              disabled={!file}
              className="inline-flex items-center gap-2 rounded-xl border border-(--border-subtle) bg-(--surface-2) px-4 py-2.5 text-[14px] font-semibold text-(--text-primary) tap-solid hover:bg-(--surface-3) disabled:opacity-50"
            >
              <Download size={16} strokeWidth={2} /> Download
            </button>
          )}
        </div>
      </div>

      {actionError && <p className="text-[13px] text-red-500">{actionError}</p>}

      {/* pdf.js owns this node's children — React must never render into it. */}
      <div ref={pagesRef} className="space-y-4" />

      {view.phase === 'loading' && (
        <div className="flex aspect-[8.5/11] w-full items-center justify-center rounded-md border border-(--border-subtle) bg-(--surface-2)">
          <p className="text-[14px] text-(--text-tertiary)">Loading PDF…</p>
        </div>
      )}

      {view.phase === 'error' && (
        <div className="rounded-md border border-(--border-subtle) bg-(--surface-2) p-4">
          <p className="text-[15px] text-(--text-primary)">Couldn&apos;t show the PDF.</p>
          <p className="mt-1 text-[13px] text-(--text-tertiary)">{view.message}</p>
          <button
            type="button"
            onClick={retry}
            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-(--border-subtle) bg-(--surface-3) px-4 py-2.5 text-[14px] font-semibold text-(--text-primary) tap-solid"
          >
            <RotateCw size={16} strokeWidth={2} /> Try again
          </button>
        </div>
      )}
    </div>
  )
}
