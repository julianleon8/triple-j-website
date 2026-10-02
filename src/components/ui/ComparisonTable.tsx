type ComparisonTableProps = {
  headers: [string, ...string[]]
  rows: string[][]
  /** Zero-indexed column to highlight (white header, navy 600 cells; default: 1) */
  highlightCol?: number
  caption?: string
}

/**
 * Forge comparison table for blog post bodies: navy header row, white/fog
 * zebra rows inside a silver 12px frame. The frame scrolls sideways on
 * phones instead of pushing the page wider. `not-prose` is kept for any
 * future typography plugin; `.forge-prose` styles none of these elements.
 */
export function ComparisonTable({
  headers,
  rows,
  highlightCol = 1,
  caption,
}: ComparisonTableProps) {
  const colCount = headers.length

  return (
    // Focusable so keyboard users can scroll it when it overflows; the frame
    // is the scroller, so its focus ring is not clipped.
    <div
      role="region"
      aria-label={caption ?? 'Comparison table'}
      tabIndex={0}
      className="not-prose my-8 overflow-x-auto overscroll-x-contain rounded-[12px] border border-forge-silver bg-white"
    >
      <table className="w-full min-w-[560px] border-collapse text-left text-[14px] leading-[1.5]">
        {caption && (
          <caption className="sr-only">{caption}</caption>
        )}
        <thead>
          <tr className="bg-forge-navy">
            {headers.map((h, i) => (
              <th
                key={i}
                scope="col"
                className={`px-4 py-3.5 align-bottom text-[11px] font-bold uppercase leading-[1.4] tracking-[.14em] ${
                  i === highlightCol ? 'text-white' : 'text-forge-silver'
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              className={`border-t border-forge-mist ${ri % 2 === 0 ? 'bg-white' : 'bg-forge-fog'}`}
            >
              {row.slice(0, colCount).map((cell, ci) => {
                if (ci === 0) {
                  return (
                    <th
                      key={ci}
                      scope="row"
                      className="border-r border-forge-mist px-4 py-4 align-top font-semibold text-forge-navy"
                    >
                      {cell}
                    </th>
                  )
                }
                return (
                  <td
                    key={ci}
                    className={`px-4 py-4 align-top ${
                      ci < colCount - 1 ? 'border-r border-forge-mist' : ''
                    } ${ci === highlightCol ? 'font-semibold text-forge-navy' : 'text-forge-slate'}`}
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
