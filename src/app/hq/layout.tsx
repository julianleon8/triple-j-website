import { NavLinks } from './components/NavLinks'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-brand-600 text-white px-6 py-4 flex items-center justify-between shadow">
        <span className="font-bold text-xl tracking-tight">Triple J Metal — Dashboard</span>
        <NavLinks />
      </nav>
      <main className="p-6 max-w-7xl mx-auto">{children}</main>
    </div>
  )
}
