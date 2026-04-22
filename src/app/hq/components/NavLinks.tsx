'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/hq',                      label: 'Leads'     },
  { href: '/hq/permit-leads',         label: 'Permits'   },
  { href: '/hq/customers',            label: 'Customers' },
  { href: '/hq/quotes',               label: 'Quotes'    },
  { href: '/hq/jobs',                 label: 'Jobs'      },
  { href: '/hq/gallery',              label: 'Gallery'   },
  { href: '/hq/settings/quickbooks',  label: 'QuickBooks'},
]

export function NavLinks() {
  const pathname = usePathname()

  return (
    <div className="flex gap-1 text-sm font-semibold">
      {LINKS.map(({ href, label }) => {
        const active =
          href === '/hq' ? pathname === '/hq' : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              active
                ? 'bg-white/20 text-white'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            {label}
          </Link>
        )
      })}
    </div>
  )
}
