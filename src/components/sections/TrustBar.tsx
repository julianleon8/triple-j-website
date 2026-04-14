import { Container } from "@/components/ui/Container";

/**
 * Trust bar — sits directly under the hero.
 * Four-up grid of differentiator stats.
 * Dark background to create a visual break between the hero and
 * the lighter services/why-us sections.
 */

const STATS = [
  { value: "150+", label: "Projects Completed" },
  { value: "48 hrs", label: "Build Time" },
  { value: "Turnkey", label: "Site Prep & Concrete" },
  { value: "Temple, TX", label: "Family-Owned, Local" },
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
