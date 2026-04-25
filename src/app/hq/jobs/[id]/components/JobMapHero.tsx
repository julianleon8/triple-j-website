import { MapPin, Navigation } from 'lucide-react'

type Props = {
  address: string | null
  city: string | null
}

/**
 * Static Google Maps image hero for a job. Tapping the image opens the
 * native Maps app with a "directions to" intent.
 *
 * Falls back to a typography-only address card if `GOOGLE_MAPS_STATIC_KEY`
 * is missing (local dev, or before the Vercel env is added).
 */
export function JobMapHero({ address, city }: Props) {
  const fullAddress = [address, city, 'TX'].filter(Boolean).join(', ')
  const apiKey = process.env.GOOGLE_MAPS_STATIC_KEY
  const mapsDeepLink = fullAddress
    ? `https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`
    : null

  if (!apiKey || !fullAddress) {
    return (
      <div className="rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-5">
        <div className="flex items-center gap-2 text-(--text-secondary)">
          <MapPin size={18} strokeWidth={2} />
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
            Job address
          </h2>
        </div>
        <p className="mt-2 text-[17px] font-semibold text-(--text-primary)">
          {fullAddress || 'No address on file'}
        </p>
        {mapsDeepLink && (
          <a
            href={mapsDeepLink}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-(--brand-fg) px-3 py-2 text-[14px] font-semibold text-white"
          >
            <Navigation size={14} strokeWidth={2} /> Directions
          </a>
        )}
      </div>
    )
  }

  const mapParams = new URLSearchParams({
    center: fullAddress,
    zoom: '16',
    size: '800x400',
    scale: '2',
    maptype: 'roadmap',
    markers: `color:red|${fullAddress}`,
    key: apiKey,
  })
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?${mapParams.toString()}`

  return (
    <a
      href={mapsDeepLink!}
      target="_blank"
      rel="noreferrer"
      className="block overflow-hidden rounded-2xl border border-(--border-subtle)"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mapUrl}
        alt={`Map of ${fullAddress}`}
        width={800}
        height={400}
        className="h-auto w-full"
      />
      <div className="flex items-center justify-between gap-2 bg-(--surface-2) px-4 py-2.5">
        <span className="truncate text-[14px] font-medium text-(--text-primary)">{fullAddress}</span>
        <span className="inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold text-(--brand-fg)">
          <Navigation size={13} strokeWidth={2} /> Directions
        </span>
      </div>
    </a>
  )
}
