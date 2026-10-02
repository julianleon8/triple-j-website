export type Fact = { k: string; v: string; s?: string };

/**
 * Glass strip pinned to the bottom of a photo hero: label → Cinzel value →
 * optional subline, in auto-fit 210px cells with hairline left borders.
 */
export function FactStrip({ facts }: { facts: readonly Fact[] }) {
  if (!facts.length) return null;
  return (
    <div className="relative border-t border-forge-silver/20 bg-[rgba(0,24,42,.78)] backdrop-blur-[6px]">
      <dl className="mx-auto grid w-full max-w-[1360px] grid-cols-[repeat(auto-fit,minmax(min(100%,210px),1fr))] px-[clamp(20px,3vw,40px)]">
        {facts.map((f) => (
          <div key={f.k} className="border-l border-forge-silver/[.18] px-[18px] pt-[18px] pb-5">
            <dt className="text-[11px] font-semibold uppercase tracking-[.2em] text-forge-steel-light">{f.k}</dt>
            <dd className="m-0 mt-1.5 font-forge-display text-[19px] font-bold leading-[1.2] text-white">{f.v}</dd>
            {f.s ? <dd className="m-0 mt-1 text-[13px] text-white/72">{f.s}</dd> : null}
          </div>
        ))}
      </dl>
    </div>
  );
}
