export const dynamic = 'force-static'

export const metadata = {
  title: 'Offline — Triple J HQ',
}

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-(--surface-1) text-(--text-primary) p-6">
      <div className="max-w-sm text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-(--surface-3)">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-(--text-tertiary)">
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M16.72 11.06A10.94 10.94 0 0119 12.55" />
            <path d="M5 12.55a10.94 10.94 0 015.17-2.39" />
            <path d="M10.71 5.05A16 16 0 0122.58 9" />
            <path d="M1.42 9a15.91 15.91 0 014.7-2.88" />
            <path d="M8.53 16.11a6 6 0 016.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" />
          </svg>
        </div>
        <h1 className="text-xl font-bold">You&apos;re offline</h1>
        <p className="mt-2 text-sm text-(--text-secondary)">
          This page isn&apos;t cached. Recently-viewed HQ screens and leads list
          should still load when you navigate back.
        </p>
      </div>
    </div>
  )
}
