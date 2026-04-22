'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'

export type LightboxPhoto = {
  id: string
  src: string
  alt: string
}

export function PhotoLightbox({ photos }: { photos: LightboxPhoto[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [active, setActive] = useState<LightboxPhoto | null>(null)

  function open(p: LightboxPhoto) {
    setActive(p)
    dialogRef.current?.showModal()
  }
  function close() {
    dialogRef.current?.close()
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {photos.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => open(p)}
            className="group relative aspect-4/3 overflow-hidden rounded-xl bg-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-600"
            aria-label={`Open photo: ${p.alt}`}
          >
            <Image
              src={p.src}
              alt={p.alt}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized={p.src.startsWith('/')}
            />
          </button>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        onClick={(e) => {
          if (e.target === dialogRef.current) close()
        }}
        onClose={() => setActive(null)}
        className="backdrop:bg-black/80 w-full max-w-5xl rounded-lg p-0 bg-transparent"
      >
        {active && (
          <div className="relative">
            <button
              type="button"
              onClick={close}
              className="absolute top-3 right-3 z-10 h-10 w-10 rounded-full bg-black/60 text-white text-xl flex items-center justify-center hover:bg-black/80"
              aria-label="Close"
            >
              ×
            </button>
            <Image
              src={active.src}
              alt={active.alt}
              width={1600}
              height={1200}
              sizes="100vw"
              className="w-full h-auto rounded-lg"
              unoptimized={active.src.startsWith('/')}
            />
          </div>
        )}
      </dialog>
    </>
  )
}
