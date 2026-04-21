import Link from 'next/link'
import Image from 'next/image'
import { SITE } from '@/lib/site'

export default function NotFound() {
  return (
    <main className="relative min-h-screen flex items-center justify-center bg-ink-900 text-white overflow-hidden">
      <div className="hero-glow absolute inset-0 pointer-events-none" aria-hidden="true" />
      <div className="relative px-6 py-16 text-center max-w-lg">
        <Image
          src="/images/logo-lion.png"
          alt={`${SITE.name} lion logo`}
          width={96}
          height={96}
          priority
          className="mx-auto mb-8 h-20 w-20 object-contain opacity-90"
        />
        <div className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-brand-400">
          Error 404
        </div>
        <h1 className="mt-3 text-6xl md:text-7xl font-extrabold text-white leading-none">
          Page not found
        </h1>
        <p className="mt-6 text-white/70 text-lg leading-relaxed">
          That one&rsquo;s off the blueprint. Let&rsquo;s get you back on site.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center h-12 px-6 rounded-lg bg-(--color-brand-600) hover:bg-(--color-brand-700) text-white font-semibold transition-colors"
          >
            Back to home
          </Link>
          <a
            href={SITE.phoneHref}
            className="inline-flex items-center justify-center h-12 px-6 rounded-lg border-2 border-white/30 text-white font-semibold hover:border-white/60 transition-colors"
          >
            Call {SITE.phone}
          </a>
        </div>
        <div className="mt-10 text-sm text-white/50">
          <Link href="/services" className="hover:text-white transition-colors">
            Services
          </Link>
          <span className="mx-3">·</span>
          <Link href="/gallery" className="hover:text-white transition-colors">
            Gallery
          </Link>
          <span className="mx-3">·</span>
          <Link href="/contact" className="hover:text-white transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </main>
  )
}
