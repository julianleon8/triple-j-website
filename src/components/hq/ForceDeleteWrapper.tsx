'use client'

import { useCallback, useRef } from 'react'
import type { PipelineRow } from '@/lib/pipeline'
import { useHaptics } from '@/lib/hq/haptics'

const LONG_PRESS_MS = 600

const KIND_LABEL: Record<PipelineRow['kind'], string> = {
  lead:     'lead',
  permit:   'permit',
  customer: 'customer',
  quote:    'quote',
  job:      'job',
}

type Props = {
  row: PipelineRow
  onDeleted: (id: string) => void
  children: React.ReactNode
}

/**
 * Long-press wrapper that triggers a Force Delete confirmation on any
 * pipeline row. Used by the Needs Attention feed to give the operator an
 * "escape hatch" — permits, quotes, and jobs have no swipe-delete, and the
 * lead swipe-delete fails when there are FK references. Force Delete
 * cleans up the references first, then hard-deletes the row.
 *
 * - Hold ≥600ms → warn haptic → window.confirm → POST /api/pipeline/force-delete
 * - On confirm + success: parent removes the row from the feed
 * - onContextMenu is suppressed so the OS callout/right-click menu doesn't
 *   fight the long-press.
 */
export function ForceDeleteWrapper({ row, onDeleted, children }: Props) {
  const haptics = useHaptics()
  const timerRef = useRef<number | null>(null)
  const firedRef = useRef(false)

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const trigger = useCallback(async () => {
    if (row.kind === 'customer') return
    firedRef.current = true
    haptics.warn()
    const label = KIND_LABEL[row.kind]
    const ok = window.confirm(
      `Force delete this ${label}?\n\nThis permanently removes the record and detaches any related rows. This cannot be undone.`,
    )
    if (!ok) return
    const res = await fetch('/api/pipeline/force-delete', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ kind: row.kind, id: row.id }),
    })
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      window.alert(d.error ?? 'Force delete failed')
      return
    }
    haptics.success()
    onDeleted(row.id)
  }, [row, haptics, onDeleted])

  function onPointerDown() {
    firedRef.current = false
    clearTimer()
    timerRef.current = window.setTimeout(trigger, LONG_PRESS_MS)
  }

  function onPointerEnd() {
    clearTimer()
  }

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerUp={onPointerEnd}
      onPointerLeave={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onContextMenu={(e) => {
        // Suppress the OS context menu while long-press is in flight or just fired,
        // so the confirm dialog isn't competing with a callout.
        e.preventDefault()
      }}
      onClickCapture={(e) => {
        // If the long-press already fired, swallow the trailing click so the
        // row's <Link> doesn't navigate away mid-confirm.
        if (firedRef.current) {
          e.preventDefault()
          e.stopPropagation()
          firedRef.current = false
        }
      }}
    >
      {children}
    </div>
  )
}
