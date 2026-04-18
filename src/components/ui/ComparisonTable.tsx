type ComparisonTableProps = {
  headers: [string, ...string[]]
  rows: string[][]
  /** Zero-indexed column to highlight in brand color (default: 1) */
  highlightCol?: number
  caption?: string
}

export function ComparisonTable({
  headers,
  rows,
  highlightCol = 1,
  caption,
}: ComparisonTableProps) {
  const colCount = headers.length

  return (
    <div className="rounded-xl border border-ink-200 overflow-hidden not-prose my-8">
      <table className="w-full text-sm">
        {caption && (
          <caption className="sr-only">{caption}</caption>
        )}
        <thead>
          <tr className="bg-ink-900 text-xs font-bold uppercase tracking-wide">
            {headers.map((h, i) => (
              <th
                key={i}
                scope="col"
                className={`px-4 py-3 text-left ${
                  i === 0
                    ? 'text-ink-400'
                    : i === highlightCol
                    ? 'text-brand-400'
                    : 'text-white/70'
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-ink-50'}>
              {row.slice(0, colCount).map((cell, ci) => {
                if (ci === 0) {
                  return (
                    <th
                      key={ci}
                      scope="row"
                      className="px-4 py-4 font-semibold text-ink-700 border-r border-ink-100 text-left"
                    >
                      {cell}
                    </th>
                  )
                }
                return (
                  <td
                    key={ci}
                    className={`px-4 py-4 text-ink-600 ${
                      ci < colCount - 1 ? 'border-r border-ink-100' : ''
                    } ${ci === highlightCol ? 'font-semibold text-ink-800' : ''}`}
                  >
                    {cell}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
