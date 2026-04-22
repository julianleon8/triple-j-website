'use client'

import { useState } from 'react'

export type Device = {
  id: string
  endpoint: string
  userAgent: string | null
  createdAt: string
}

function endpointHost(ep: string): string {
  try { return new URL(ep).host } catch { return ep.slice(0, 40) + '…' }
}

function shortUA(ua: string | null): string {
  if (!ua) return 'Unknown device'
  if (/iPhone/.test(ua)) return 'iPhone · Safari'
  if (/iPad/.test(ua))   return 'iPad · Safari'
  if (/Android/.test(ua)) return 'Android · Chrome'
  if (/Macintosh/.test(ua)) {
    if (/Chrome/.test(ua)) return 'Mac · Chrome'
    if (/Safari/.test(ua)) return 'Mac · Safari'
    return 'Mac'
  }
  return ua.slice(0, 40)
}

function relative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const days = Math.floor(ms / (86400_000))
  if (days >= 1) return `${days}d ago`
  const hrs = Math.floor(ms / 3600_000)
  if (hrs >= 1)  return `${hrs}h ago`
  const mins = Math.floor(ms / 60_000)
  if (mins >= 1) return `${mins}m ago`
  return 'just now'
}

export function DevicesList({ initial }: { initial: Device[] }) {
  const [devices, setDevices] = useState(initial)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function remove(device: Device) {
    if (typeof window !== 'undefined' && !window.confirm('Remove this device from push notifications?')) return
    setBusyId(device.id)
    try {
      const res = await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: device.endpoint }),
      })
      if (res.ok) setDevices((prev) => prev.filter((d) => d.id !== device.id))
    } finally {
      setBusyId(null)
    }
  }

  if (devices.length === 0) {
    return (
      <div className="rounded-xl border border-(--border-subtle) bg-(--surface-2) p-6 text-center">
        <p className="text-sm text-(--text-secondary)">No devices subscribed yet.</p>
        <p className="mt-1 text-xs text-(--text-tertiary)">
          Tap <strong>Enable</strong> above on each device you want to be pinged on.
        </p>
      </div>
    )
  }

  return (
    <ul className="overflow-hidden rounded-xl border border-(--border-subtle) bg-(--surface-2) divide-y divide-(--border-subtle)">
      {devices.map((d) => (
        <li key={d.id} className="flex items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-medium text-(--text-primary) truncate">
              {shortUA(d.userAgent)}
            </div>
            <div className="mt-0.5 text-[12px] text-(--text-tertiary) truncate">
              Registered {relative(d.createdAt)} · {endpointHost(d.endpoint)}
            </div>
          </div>
          <button
            type="button"
            onClick={() => remove(d)}
            disabled={busyId === d.id}
            className="shrink-0 min-h-9 px-3 rounded-lg text-[12px] font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
          >
            {busyId === d.id ? '…' : 'Remove'}
          </button>
        </li>
      ))}
    </ul>
  )
}
