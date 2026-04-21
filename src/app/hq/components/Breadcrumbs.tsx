import Link from 'next/link'

type Crumb = { label: string; href?: string }

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-[13px]">
      <ol className="flex items-center flex-wrap gap-1.5 text-[color:var(--color-ink-400)]">
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-[color:var(--color-brand-600)] transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? 'text-[color:var(--color-ink-700)] font-medium' : ''}>
                  {item.label}
                </span>
              )}
              {!isLast && <span className="text-[color:var(--color-ink-300)]">/</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
