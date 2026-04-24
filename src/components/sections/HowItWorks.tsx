import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

/**
 * How It Works — 3-step process.
 * Education section that reduces buyer friction:
 * "what am I signing up for if I call?"
 */

const STEPS = [
  {
    n: "01",
    title: "Call or request a free quote",
    blurb:
      "Tell us where, what size, and what you're using it for. We'll come out, measure, and give you an honest, on-the-spot price — usually within 24 hours.",
  },
  {
    n: "02",
    title: "We handle site prep + concrete",
    blurb:
      "Our crew grades the pad, runs forms, and pours the concrete. One contract, one phone number — no coordinating three different companies.",
  },
  {
    n: "03",
    title: "Built right — done in days, not months",
    blurb:
      "Red-iron frame up on day one. Panels, trim, and finish on day two. Small carports are done same day. You keep your weekend, we keep our word.",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      aria-labelledby="how-heading"
      className="py-20 md:py-28 bg-[color:var(--color-ink-900)] text-white relative overflow-hidden"
    >
      {/* Subtle blueprint grid background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <Container size="wide" className="relative">
        <Reveal className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--color-brand-400)]">
            How It Works
          </span>
          <h2 id="how-heading" className="mt-3 text-white">
            Three steps. One company. Done.
          </h2>
          <p className="mt-4 text-lg text-white/70">
            We built Triple J to eliminate the worst part of hiring a
            contractor: the endless coordination. You call once — we take it
            from there.
          </p>
        </Reveal>

        <ol className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {STEPS.map((step, idx) => (
            <Reveal key={step.n} as="li" delay={idx * 100}
              className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-7 hover:bg-white/10 hover:border-[color:var(--color-brand-400)]/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-5xl font-extrabold tracking-tight text-[color:var(--color-brand-400)]/90 tabular-nums">
                  {step.n}
                </span>
                {idx < STEPS.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="hidden md:block text-white/20 text-2xl"
                  >
                    →
                  </span>
                ) : null}
              </div>
              <h3 className="mt-4 text-xl font-bold text-white tracking-tight">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                {step.blurb}
              </p>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}
