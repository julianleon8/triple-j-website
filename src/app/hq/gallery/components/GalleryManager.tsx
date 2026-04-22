'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { PANEL_COLORS } from '@/lib/colors'
import {
  colorOptionLabel,
  colorOptionValue,
  colorValueFromDb,
  describeGalleryColors,
} from '@/lib/gallery-colors'
import { normalizeUploadFile } from '@/lib/heic-convert'

function fileBaseName(file: File) {
  const n = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim()
  return n || 'Project photo'
}

type Photo = {
  id: string
  image_url: string
  alt_text: string | null
  sort_order: number
  is_cover: boolean
}

type PhotoStatus = {
  name: string
  state: 'converting' | 'uploading' | 'done' | 'failed'
  error?: string
}

type GalleryItem = {
  id: string
  title: string
  city: string
  type: string
  tag: string
  alt_text: string
  sort_order: number
  is_active: boolean
  is_featured: boolean
  panel_color: string | null
  panel_color_line: string | null
  trim_color: string | null
  trim_color_line: string | null
  panel_profile: string | null
  gauge: string | null
  gallery_photos: Photo[]
}

const TYPE_OPTIONS = ['Carport', 'Garage', 'Barn', 'RV Cover', 'Lean-To', 'Porch Cover', 'Other']
const TAG_OPTIONS = ['Welded', 'Bolted', 'Turnkey']
const PANEL_PROFILE_OPTIONS = ['PBR', 'PBU']
const GAUGE_OPTIONS = ['26', '29']

const TAG_COLORS: Record<string, string> = {
  Welded:  'bg-blue-100 text-blue-700',
  Bolted:  'bg-gray-100 text-gray-600',
  Turnkey: 'bg-amber-100 text-amber-700',
}

function sortPhotos(photos: Photo[] | null | undefined): Photo[] {
  return (photos ?? []).slice().sort((a, b) => {
    if (a.is_cover !== b.is_cover) return a.is_cover ? -1 : 1
    return a.sort_order - b.sort_order
  })
}

function coverUrlOf(item: GalleryItem): string | null {
  const sorted = sortPhotos(item.gallery_photos)
  return sorted[0]?.image_url ?? null
}

function ColorSelect({
  name,
  defaultValue,
  label,
}: {
  name: string
  defaultValue?: string
  label: string
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <select
        name={name}
        defaultValue={defaultValue ?? ''}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option value="">— None —</option>
        {PANEL_COLORS.map((c) => (
          <option key={colorOptionValue(c)} value={colorOptionValue(c)}>
            {colorOptionLabel(c)}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function GalleryManager({ initialItems }: { initialItems: GalleryItem[] }) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [selectedCount, setSelectedCount] = useState(0)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // ── New item upload (single cover or many — each becomes its own project) ─
  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setUploadError(null)
    setUploadProgress(null)
    const form = e.currentTarget
    const files = fileRef.current?.files
    if (!files?.length) {
      setUploadError('Please choose at least one photo.')
      return
    }
    const fileArr = Array.from(files)
    const template = new FormData(form)
    const titlePrefix = ((template.get('title') as string) || '').trim()
    if (fileArr.length === 1 && !titlePrefix) {
      setUploadError('Please enter a title for this project.')
      return
    }

    setUploading(true)
    let lastError: string | null = null

    for (let i = 0; i < fileArr.length; i++) {
      const rawFile = fileArr[i]
      setUploadProgress(
        fileArr.length > 1 ? `Uploading ${i + 1} of ${fileArr.length}…` : 'Uploading…',
      )
      const base = fileBaseName(rawFile)
      const title =
        fileArr.length === 1 ? titlePrefix : titlePrefix ? `${titlePrefix} — ${base}` : base

      let prepared: File
      try {
        prepared = await normalizeUploadFile(rawFile)
      } catch (err) {
        lastError = err instanceof Error ? err.message : 'Could not prepare photo.'
        break
      }

      const data = new FormData(form)
      data.delete('file')
      data.set('file', prepared, prepared.name)
      data.set('title', title)
      const alt = (data.get('alt_text') as string)?.trim()
      if (!alt) data.set('alt_text', title)

      const res = await fetch('/api/gallery', { method: 'POST', body: data })
      if (res.ok) {
        const { item } = await res.json()
        setItems((prev) => [...prev, item])
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

  // ── Metadata save from the inline edit panel ─────────────────────────────
  async function handleSaveMetadata(item: GalleryItem, form: HTMLFormElement) {
    setBusyId(item.id)
    const data = new FormData(form)
    const panelRaw = (data.get('panel_color') as string) || ''
    const trimRaw = (data.get('trim_color') as string) || ''
    const panel = panelRaw ? panelRaw.split('/') : null
    const trim = trimRaw ? trimRaw.split('/') : null

    const panelProfileRaw = (data.get('panel_profile') as string) || ''
    const gaugeRaw = (data.get('gauge') as string) || ''

    const body = {
      title: (data.get('title') as string).trim(),
      city: (data.get('city') as string).trim(),
      type: data.get('type') as string,
      tag: data.get('tag') as string,
      alt_text: (data.get('alt_text') as string).trim(),
      panel_color: panel ? panel[1].toLowerCase() : null,
      panel_color_line: panel ? panel[0].toLowerCase() : null,
      trim_color: trim ? trim[1].toLowerCase() : null,
      trim_color_line: trim ? trim[0].toLowerCase() : null,
      panel_profile: panelProfileRaw || null,
      gauge: gaugeRaw || null,
    }

    const res = await fetch(`/api/gallery/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      const { item: updated } = await res.json()
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, ...updated, gallery_photos: i.gallery_photos } : i)),
      )
      setExpandedId(null)
    }
    setBusyId(null)
  }

  // ── Toggles ──────────────────────────────────────────────────────────────
  async function toggleActive(item: GalleryItem) {
    setBusyId(item.id)
    const next = !item.is_active
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_active: next } : i)))
    const res = await fetch(`/api/gallery/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: next }),
    })
    if (!res.ok) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_active: item.is_active } : i)),
      )
    }
    setBusyId(null)
  }

  async function toggleFeatured(item: GalleryItem) {
    setBusyId(item.id)
    const next = !item.is_featured
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_featured: next } : i)))
    const res = await fetch(`/api/gallery/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_featured: next }),
    })
    if (!res.ok) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_featured: item.is_featured } : i)),
      )
    }
    setBusyId(null)
  }

  // ── Item reorder ─────────────────────────────────────────────────────────
  async function moveItem(item: GalleryItem, direction: 'up' | 'down') {
    const idx = items.findIndex((i) => i.id === item.id)
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
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sort_order: next[idx].sort_order }),
      }),
      fetch(`/api/gallery/${next[swapIdx].id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sort_order: next[swapIdx].sort_order }),
      }),
    ])
  }

  // ── Item delete ──────────────────────────────────────────────────────────
  async function handleDelete(item: GalleryItem) {
    if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return
    setBusyId(item.id)
    const res = await fetch(`/api/gallery/${item.id}`, { method: 'DELETE' })
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== item.id))
      if (expandedId === item.id) setExpandedId(null)
    }
    setBusyId(null)
  }

  // ── Photo operations (scoped to an item) ─────────────────────────────────
  async function uploadPhoto(item: GalleryItem, file: File) {
    const data = new FormData()
    data.append('file', file)
    const res = await fetch(`/api/gallery/${item.id}/photos`, { method: 'POST', body: data })
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Upload failed' }))
      throw new Error(error ?? 'Upload failed')
    }
    const { photo } = await res.json()
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, gallery_photos: [...i.gallery_photos, photo] } : i,
      ),
    )
  }

  async function deletePhoto(item: GalleryItem, photo: Photo) {
    if (!confirm('Delete this photo?')) return
    const res = await fetch(`/api/gallery/photos/${photo.id}`, { method: 'DELETE' })
    if (!res.ok) return
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== item.id) return i
        const remaining = i.gallery_photos.filter((p) => p.id !== photo.id)
        // Mirror the server's auto-promote-next-as-cover behavior locally
        if (photo.is_cover && remaining.length > 0) {
          const next = sortPhotos(remaining)[0]
          return {
            ...i,
            gallery_photos: remaining.map((p) =>
              p.id === next.id ? { ...p, is_cover: true } : p,
            ),
          }
        }
        return { ...i, gallery_photos: remaining }
      }),
    )
  }

  async function setPhotoCover(item: GalleryItem, photo: Photo) {
    const res = await fetch(`/api/gallery/photos/${photo.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_cover: true }),
    })
    if (!res.ok) return
    setItems((prev) =>
      prev.map((i) =>
        i.id !== item.id
          ? i
          : {
              ...i,
              gallery_photos: i.gallery_photos.map((p) => ({
                ...p,
                is_cover: p.id === photo.id,
              })),
            },
      ),
    )
  }

  async function movePhoto(item: GalleryItem, photo: Photo, direction: 'up' | 'down') {
    const sorted = sortPhotos(item.gallery_photos)
    const idx = sorted.findIndex((p) => p.id === photo.id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return
    const a = sorted[idx]
    const b = sorted[swapIdx]

    const aOrder = a.sort_order
    const bOrder = b.sort_order

    setItems((prev) =>
      prev.map((i) =>
        i.id !== item.id
          ? i
          : {
              ...i,
              gallery_photos: i.gallery_photos.map((p) => {
                if (p.id === a.id) return { ...p, sort_order: bOrder }
                if (p.id === b.id) return { ...p, sort_order: aOrder }
                return p
              }),
            },
      ),
    )

    await Promise.all([
      fetch(`/api/gallery/photos/${a.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sort_order: bOrder }),
      }),
      fetch(`/api/gallery/photos/${b.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sort_order: aOrder }),
      }),
    ])
  }

  return (
    <div className="space-y-8">
      {/* ── Upload form ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Upload New Project</h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Cover Photo <span className="text-red-500">*</span>
              </label>
              <input
                ref={fileRef}
                name="file"
                type="file"
                accept="image/*,.heic,.heif"
                required
                className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
              <p className="mt-1 text-[11px] text-gray-400">
                iPhone HEIC photos are auto-converted to JPEG.
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                name="title"
                type="text"
                required
                placeholder="e.g. 30x40 Welded Carport"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">City</label>
              <input
                name="city"
                type="text"
                placeholder="e.g. Killeen, TX"
                defaultValue="Central Texas"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Type</label>
              <select
                name="type"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tag</label>
              <select
                name="tag"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {TAG_OPTIONS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <ColorSelect name="panel_color" label="Panel Color" />
            <ColorSelect name="trim_color" label="Trim Color" />
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Panel Profile</label>
              <select
                name="panel_profile"
                defaultValue=""
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">— None —</option>
                {PANEL_PROFILE_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Gauge</label>
              <select
                name="gauge"
                defaultValue=""
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">— None —</option>
                {GAUGE_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g} ga</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Alt text (for accessibility)
              </label>
              <input
                name="alt_text"
                type="text"
                placeholder="Brief description of the photo"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="sm:col-span-2 flex items-center gap-2">
              <input
                id="new-is-featured"
                name="is_featured"
                type="checkbox"
                value="true"
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="new-is-featured" className="text-xs font-semibold text-gray-600">
                Feature this project (pins to first slot on /gallery + homepage hero)
              </label>
            </div>
          </div>
          {uploadError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{uploadError}</p>
          )}
          <button
            type="submit"
            disabled={uploading}
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {uploading ? 'Uploading…' : 'Upload Project'}
          </button>
        </form>
      </div>

      {/* ── Current items ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">
          All Projects ({items.length})
        </h2>
        {items.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">
            No projects yet. Upload one above.
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, idx) => {
            const coverUrl = coverUrlOf(item)
            const photoCount = item.gallery_photos?.length ?? 0
            const colorLine = describeGalleryColors({
              panelColor: item.panel_color,
              panelColorLine: item.panel_color_line,
              trimColor: item.trim_color,
              trimColorLine: item.trim_color_line,
            }).label
            const expanded = expandedId === item.id

            return (
              <div
                key={item.id}
                className={`rounded-xl border overflow-hidden transition-opacity ${
                  item.is_active ? 'border-gray-200' : 'border-gray-100 opacity-60'
                } ${expanded ? 'sm:col-span-2 lg:col-span-3' : ''}`}
              >
                {/* Thumbnail */}
                <div className="relative aspect-[4/3] bg-gray-100">
                  {coverUrl ? (
                    <Image
                      src={coverUrl}
                      alt={item.alt_text || item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                      unoptimized={coverUrl.startsWith('/')}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                      No photos yet
                    </div>
                  )}
                  {item.is_featured && (
                    <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow">
                      Featured
                    </span>
                  )}
                  <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                    {photoCount} photo{photoCount === 1 ? '' : 's'}
                  </span>
                  {!item.is_active && (
                    <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                      <span className="bg-gray-700 text-white text-xs font-bold px-2 py-1 rounded">
                        Hidden
                      </span>
                    </div>
                  )}
                </div>

                {/* Meta */}
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-gray-900 leading-snug">
                      {item.title}
                    </p>
                    <span
                      className={`shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                        TAG_COLORS[item.tag] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {item.type} · {item.city}
                  </p>
                  {colorLine && (
                    <p className="mt-1 text-xs text-gray-500">{colorLine}</p>
                  )}
                </div>

                {/* Controls */}
                <div className="px-3 pb-3 flex items-center flex-wrap gap-2">
                  <button
                    onClick={() => moveItem(item, 'up')}
                    disabled={idx === 0 || busyId === item.id}
                    title="Move up"
                    className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveItem(item, 'down')}
                    disabled={idx === items.length - 1 || busyId === item.id}
                    title="Move down"
                    className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                  >
                    ↓
                  </button>

                  <button
                    onClick={() => toggleFeatured(item)}
                    disabled={busyId === item.id}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors disabled:opacity-50 ${
                      item.is_featured
                        ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {item.is_featured ? '★ Featured' : '☆ Feature'}
                  </button>

                  <button
                    onClick={() => setExpandedId(expanded ? null : item.id)}
                    className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                  >
                    {expanded ? 'Close' : 'Edit'}
                  </button>

                  <button
                    onClick={() => toggleActive(item)}
                    disabled={busyId === item.id}
                    className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full transition-colors disabled:opacity-50 ${
                      item.is_active
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {item.is_active ? 'Visible' : 'Hidden'}
                  </button>

                  <button
                    onClick={() => handleDelete(item)}
                    disabled={busyId === item.id}
                    title="Delete project"
                    className="p-1.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors text-sm"
                  >
                    ✕
                  </button>
                </div>

                {/* Expanded Edit panel */}
                {expanded && (
                  <EditPanel
                    item={item}
                    busy={busyId === item.id}
                    onSaveMetadata={(form) => handleSaveMetadata(item, form)}
                    onCancel={() => setExpandedId(null)}
                    onUploadPhoto={(file) => uploadPhoto(item, file)}
                    onDeletePhoto={(photo) => deletePhoto(item, photo)}
                    onSetCover={(photo) => setPhotoCover(item, photo)}
                    onMovePhoto={(photo, dir) => movePhoto(item, photo, dir)}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Edit panel (inline per card) ───────────────────────────────────────────
function EditPanel({
  item,
  busy,
  onSaveMetadata,
  onCancel,
  onUploadPhoto,
  onDeletePhoto,
  onSetCover,
  onMovePhoto,
}: {
  item: GalleryItem
  busy: boolean
  onSaveMetadata: (form: HTMLFormElement) => void
  onCancel: () => void
  onUploadPhoto: (file: File) => Promise<void>
  onDeletePhoto: (photo: Photo) => void
  onSetCover: (photo: Photo) => void
  onMovePhoto: (photo: Photo, direction: 'up' | 'down') => void
}) {
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoStatuses, setPhotoStatuses] = useState<PhotoStatus[]>([])
  const photoInputRef = useRef<HTMLInputElement>(null)
  const sorted = sortPhotos(item.gallery_photos)

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setPhotoUploading(true)
    setPhotoStatuses(files.map((f) => ({ name: f.name, state: 'converting' })))
    for (let i = 0; i < files.length; i++) {
      try {
        const prepared = await normalizeUploadFile(files[i])
        setPhotoStatuses((prev) =>
          prev.map((s, idx) => (idx === i ? { ...s, state: 'uploading' } : s)),
        )
        await onUploadPhoto(prepared)
        setPhotoStatuses((prev) =>
          prev.map((s, idx) => (idx === i ? { ...s, state: 'done' } : s)),
        )
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Upload failed'
        setPhotoStatuses((prev) =>
          prev.map((s, idx) => (idx === i ? { ...s, state: 'failed', error: msg } : s)),
        )
      }
    }
    setPhotoUploading(false)
    if (photoInputRef.current) photoInputRef.current.value = ''
  }

  return (
    <div className="border-t border-gray-200 bg-gray-50 p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Metadata form */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSaveMetadata(e.currentTarget)
        }}
        className="space-y-3"
      >
        <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500">
          Project Details
        </h3>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Title</label>
          <input
            name="title"
            defaultValue={item.title}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">City</label>
            <input
              name="city"
              defaultValue={item.city}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Type</label>
            <select
              name="type"
              defaultValue={item.type}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Tag</label>
            <select
              name="tag"
              defaultValue={item.tag}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {TAG_OPTIONS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Panel Profile</label>
            <select
              name="panel_profile"
              defaultValue={item.panel_profile ?? ''}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">— None —</option>
              {PANEL_PROFILE_OPTIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Gauge</label>
            <select
              name="gauge"
              defaultValue={item.gauge ?? ''}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">— None —</option>
              {GAUGE_OPTIONS.map((g) => (
                <option key={g} value={g}>{g} ga</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ColorSelect
            name="panel_color"
            label="Panel Color"
            defaultValue={colorValueFromDb(item.panel_color, item.panel_color_line)}
          />
          <ColorSelect
            name="trim_color"
            label="Trim Color"
            defaultValue={colorValueFromDb(item.trim_color, item.trim_color_line)}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Alt text</label>
          <input
            name="alt_text"
            defaultValue={item.alt_text}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={busy}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {busy ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Photo strip */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">
          Photos ({sorted.length})
        </h3>
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {sorted.map((photo, i) => (
            <div
              key={photo.id}
              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-2"
            >
              <div className="relative h-14 w-20 shrink-0 rounded overflow-hidden bg-gray-100">
                <Image
                  src={photo.image_url}
                  alt={photo.alt_text ?? ''}
                  fill
                  sizes="80px"
                  className="object-cover"
                  unoptimized={photo.image_url.startsWith('/')}
                />
                {photo.is_cover && (
                  <span className="absolute inset-x-0 bottom-0 bg-amber-500 text-white text-[9px] text-center font-bold py-0.5">
                    COVER
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 truncate">
                  {photo.alt_text || '(no alt text)'}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => onMovePhoto(photo, 'up')}
                  disabled={i === 0}
                  title="Move up"
                  className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => onMovePhoto(photo, 'down')}
                  disabled={i === sorted.length - 1}
                  title="Move down"
                  className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => onSetCover(photo)}
                  disabled={photo.is_cover}
                  title="Set as cover"
                  className="p-1 rounded text-amber-400 hover:text-amber-600 hover:bg-amber-50 disabled:opacity-30"
                >
                  ★
                </button>
                <button
                  type="button"
                  onClick={() => onDeletePhoto(photo)}
                  title="Delete photo"
                  className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          {sorted.length === 0 && (
            <p className="text-xs text-gray-400 py-4 text-center">No photos yet.</p>
          )}
        </div>

        {/* Upload more photos */}
        <div className="mt-3">
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Upload more photos
          </label>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*,.heic,.heif"
            multiple
            disabled={photoUploading}
            onChange={handlePhotoUpload}
            className="block w-full text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer disabled:opacity-50"
          />
          <p className="mt-1 text-[11px] text-gray-400">
            iPhone HEIC photos are auto-converted to JPEG.
          </p>
          {photoStatuses.length > 0 && (
            <ul className="mt-2 space-y-1">
              {photoStatuses.map((s, i) => (
                <li key={i} className="flex items-center gap-2 text-[11px]">
                  <span className="flex-1 truncate text-gray-600">{s.name}</span>
                  <StatusPill status={s} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: PhotoStatus }) {
  const map: Record<PhotoStatus['state'], { label: string; className: string }> = {
    converting: { label: 'Converting…', className: 'bg-blue-50 text-blue-700' },
    uploading:  { label: 'Uploading…',  className: 'bg-blue-50 text-blue-700' },
    done:       { label: 'Done',        className: 'bg-green-50 text-green-700' },
    failed:     { label: 'Failed',      className: 'bg-red-50 text-red-700' },
  }
  const { label, className } = map[status.state]
  return (
    <span
      title={status.error ?? ''}
      className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold ${className}`}
    >
      {label}
    </span>
  )
}
