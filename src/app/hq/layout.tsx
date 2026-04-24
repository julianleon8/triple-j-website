import HqChrome from './components/HqChrome'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-(--font-ios)">
      <HqChrome>{children}</HqChrome>
    </div>
  )
}
