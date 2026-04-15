import { Container } from "@/components/ui/Container";

/**
 * Trust bar — sits directly under the hero.
 * Four differentiators that no national kit dealer can claim.
 */

const STATS = [
  { value: "Zero",          label: "Subcontractors — Ever" },
  { value: "Welded or Bolted", label: "Your Choice" },
  { value: "Same-Week",    label: "On-Site After Approval" },
  { value: "Temple, TX",   label: "Local Family Crew" },
] as const;

export function TrustBar() {
  return (
    <section
      aria-label="Trust indicators"
      className="bg-[color:var(--color-ink-950)] text-white border-b border-white/5"
    >
      <Container size="wide">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10 border-y border-white/10">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="px-4 py-6 md:py-8 text-center first:border-l-0"
            >
              <div className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                {stat.value}
              </div>
              <div className="mt-1 text-xs md:text-sm uppercase tracking-wider text-white/55 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
