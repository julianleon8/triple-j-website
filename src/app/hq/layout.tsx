import Link from 'next/link'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-yellow-500 text-black px-6 py-4 flex items-center justify-between shadow">
        <span className="font-bold text-xl tracking-tight">Triple J Metal — Dashboard</span>
        <div className="flex gap-6 text-sm font-semibold">
          <Link href="/hq" className="hover:underline">Leads</Link>
          <Link href="/hq/permit-leads" className="hover:underline">Permits</Link>
          <Link href="/hq/customers" className="hover:underline">Customers</Link>
          <Link href="/hq/quotes" className="hover:underline">Quotes</Link>
          <Link href="/hq/jobs" className="hover:underline">Jobs</Link>
          <Link href="/hq/gallery" className="hover:underline">Gallery</Link>
          <Link href="/hq/settings/quickbooks" className="hover:underline">QuickBooks</Link>
        </div>
      </nav>
      <main className="p-6 max-w-7xl mx-auto">{children}</main>
    </div>
  )
}
