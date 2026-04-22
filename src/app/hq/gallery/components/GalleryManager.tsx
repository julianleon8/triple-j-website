'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

type GalleryItem = {
  id: string
  title: string
  city: string
  type: string
  tag: string
  alt_text: string
  image_url: string
  sort_order: number
  is_active: boolean
}

const TYPE_OPTIONS = ['Carport', 'Garage', 'Barn', 'RV Cover', 'Lean-To', 'Porch Cover', 'Other']
const TAG_OPTIONS = ['Welded', 'Bolted', 'Turnkey']

const TAG_COLORS: Record<string, string> = {
  Welded:  'bg-blue-100 text-blue-700',
  Bolted:  'bg-gray-100 text-gray-600',
  Turnkey: 'bg-amber-100 text-amber-700',
}

function fileBaseName(file: File) {
  const n = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim()
  return n || 'Photo'
}

export default function GalleryManager({ initialItems }: { initialItems: GalleryItem[] }) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [selectedCount, setSelectedCount] = useState(0)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // ── Upload (single or many; phones can pick multiple from library) ──────
  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setUploadError(null)
    const form = e.currentTarget
    const files = fileRef.current?.files
    if (!files?.length) {
      setUploadError('Please choose at least one photo.')
      return
    }
    const fileArr = Array.from(files)
    const fd = new FormData(form)
    const titleInput = (fd.get('title') as string | null)?.trim() ?? ''
    const city = (fd.get('city') as string | null)?.trim() || 'Central Texas'
    const type = (fd.get('type') as string | null)?.trim() || 'Carport'
    const tag = (fd.get('tag') as string | null)?.trim() || 'Welded'
    const alt_text = (fd.get('alt_text') as string | null)?.trim() || ''

    if (fileArr.length === 1 && !titleInput) {
      setUploadError('Please enter a title for this photo.')
      return
    }

    setUploading(true)
    let lastError: string | null = null

    for (let i = 0; i < fileArr.length; i++) {
      const file = fileArr[i]
      setUploadProgress(
        fileArr.length > 1 ? `Uploading ${i + 1} of ${fileArr.length}…` : 'Uploading…'
      )
      const base = fileBaseName(file)
      const title =
        fileArr.length === 1
          ? titleInput
          : titleInput
            ? `${titleInput} — ${base}`
            : base

      const body = new FormData()
      body.append('file', file)
      body.append('title', title)
      body.append('city', city)
      body.append('type', type)
      body.append('tag', tag)
      body.append('alt_text', alt_text || title)

      const res = await fetch('/api/gallery', { method: 'POST', body })
      if (res.ok) {
        const { item } = await res.json()
        setItems(prev => [...prev, item])
      } else {
        const { error } = await res.json().catch(() => ({ error: 'Upload failed' }))
        lastError = error ?? 'Upload failed'
        break
      }
    }

    setUploadProgress(null)
    setUploading(false)
    form.reset()
    setSelectedCount(0)
    if (lastError) setUploadError(lastError)
  }

  // ── Toggle active ─────────────────────────────────────────────────────────
  async function toggleActive(item: GalleryItem) {
    setBusyId(item.id)
    const next = !item.is_active
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_active: next } : i))
    const res = await fetch(`/api/gallery/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: next }),
    })
    if (!res.ok) {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_active: item.is_active } : i))
    }
    setBusyId(null)
  }

  // ── Reorder ───────────────────────────────────────────────────────────────
  async function move(item: GalleryItem, direction: 'up' | 'down') {
    const idx = items.findIndex(i => i.id === item.id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= items.length) return

    const next = [...items]
    const aOrder = next[idx].sort_order
    const bOrder = next[swapIdx].sort_order
    next[idx] = { ...next[idx], sort_order: bOrder }
    next[swapIdx] = { ...next[swapIdx], sort_order: aOrder }
    next.sort((a, b) => a.sort_order - b.sort_order)
    setItems(next)

    await Promise.all([
      fetch(`/api/gallery/${next[idx].id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sort_order: next[idx].sort_order }),
      }),
      fetch(`/api/gallery/${next[swapIdx].id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sort_order: next[swapIdx].sort_order }),
      }),
    ])
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function handleDelete(item: GalleryItem) {
    if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return
    setBusyId(item.id)
    const res = await fetch(`/api/gallery/${item.id}`, { method: 'DELETE' })
    if (res.ok) {
      setItems(prev => prev.filter(i => i.id !== item.id))
    }
    setBusyId(null)
  }

  return (
    <div className="space-y-8">
      {/* ── Upload form ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-base font-bold text-gray-900 mb-1">Upload photos</h2>
        <p className="text-xs text-gray-500 mb-4 sm:text-sm">
          On your phone you can choose <strong className="font-semibold text-gray-700">Take Photo</strong> or{' '}
          <strong className="font-semibold text-gray-700">Photo Library</strong>, and select many images at once.
        </p>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Photos <span className="text-red-500">*</span>
              </label>
              <input
                ref={fileRef}
                name="file"
                type="file"
                accept="image/*"
                multiple
                required
                onChange={e => setSelectedCount(e.target.files?.length ?? 0)}
                className="block w-full text-sm text-gray-600 file:mr-3 file:min-h-11 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer touch-manipulation"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Title{selectedCount > 1 ? ' (prefix for batch)' : ''}{' '}
                {selectedCount <= 1 && <span className="text-red-500">*</span>}
              </label>
              <input
                name="title"
                type="text"
                required={selectedCount <= 1}
                placeholder={
                  selectedCount > 1
                    ? 'e.g. Killeen install (optional — uses file names if empty)'
                    : 'e.g. 30x40 Welded Carport'
                }
                className="w-full min-h-11 rounded-lg border border-gray-300 px-3 py-2.5 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 touch-manipulation"
              />
              {selectedCount > 1 && (
                <p className="mt-1 text-[11px] text-gray-400">
                  Each photo is titled &ldquo;prefix — filename&rdquo;, or just the filename if you leave this blank.
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">City</label>
              <input
                name="city"
                type="text"
                placeholder="e.g. Killeen, TX"
                defaultValue="Central Texas"
                className="w-full min-h-11 rounded-lg border border-gray-300 px-3 py-2.5 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 touch-manipulation"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Type</label>
              <select name="type" className="w-full min-h-11 rounded-lg border border-gray-300 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 touch-manipulation">
                {TYPE_OPTIONS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tag</label>
              <select name="tag" className="w-full min-h-11 rounded-lg border border-gray-300 px-3 py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 touch-manipulation">
                {TAG_OPTIONS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Alt text (for accessibility)</label>
              <input
                name="alt_text"
                type="text"
                placeholder="Brief description of the photo"
                className="w-full min-h-11 rounded-lg border border-gray-300 px-3 py-2.5 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 touch-manipulation"
              />
            </div>
          </div>
          {uploadError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{uploadError}</p>
          )}
          {uploadProgress && (
            <p className="text-sm font-medium text-blue-700 bg-blue-50 rounded-lg px-3 py-2">{uploadProgress}</p>
          )}
          <button
            type="submit"
            disabled={uploading}
            className="min-h-12 w-full rounded-lg bg-blue-600 px-5 py-3 text-base font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors touch-manipulation sm:w-auto sm:py-2.5 sm:text-sm"
          >
            {uploading ? 'Working…' : selectedCount > 1 ? `Upload ${selectedCount} photos` : 'Upload photo'}
          </button>
        </form>
      </div>

      {/* ── Current items ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">
          All Photos ({items.length})
        </h2>
        {items.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">No photos yet. Upload one above.</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className={`rounded-xl border overflow-hidden transition-opacity ${
                item.is_active ? 'border-gray-200' : 'border-gray-100 opacity-60'
              }`}
            >
              {/* Thumbnail */}
              <div className="relative aspect-[4/3] bg-gray-100">
                <Image
                  src={item.image_url}
                  alt={item.alt_text || item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                  unoptimized={item.image_url.startsWith('/')}
                />
                {!item.is_active && (
                  <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                    <span className="bg-gray-700 text-white text-xs font-bold px-2 py-1 rounded">Hidden</span>
                  </div>
                )}
              </div>

              {/* Meta */}
              <div className="p-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-900 leading-snug">{item.title}</p>
                  <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${TAG_COLORS[item.tag] ?? 'bg-gray-100 text-gray-600'}`}>
                    {item.tag}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{item.type} · {item.city}</p>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-2 px-3 pb-3">
                {/* Reorder */}
                <button
                  type="button"
                  onClick={() => move(item, 'up')}
                  disabled={idx === 0 || busyId === item.id}
                  title="Move up"
                  className="min-h-10 min-w-10 rounded-lg text-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 disabled:opacity-30 touch-manipulation"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(item, 'down')}
                  disabled={idx === items.length - 1 || busyId === item.id}
                  title="Move down"
                  className="min-h-10 min-w-10 rounded-lg text-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 disabled:opacity-30 touch-manipulation"
                >
                  ↓
                </button>

                {/* Toggle visible */}
                <button
                  type="button"
                  onClick={() => toggleActive(item)}
                  disabled={busyId === item.id}
                  className={`min-h-10 rounded-full px-3 text-xs font-semibold transition-colors disabled:opacity-50 touch-manipulation sm:ml-auto ${
                    item.is_active
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {item.is_active ? 'Visible' : 'Hidden'}
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  disabled={busyId === item.id}
                  title="Delete photo"
                  className="min-h-10 min-w-10 rounded-lg text-lg text-red-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 touch-manipulation"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
