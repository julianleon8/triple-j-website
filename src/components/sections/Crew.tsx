import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { TrackedPhoneLink } from "@/components/site/TrackedPhone";

const TEAM = [
  { name: "Juan", role: "Co-owner · Relationships", description: "The family connection behind Triple J. Juan helps build relationships with customers across Central Texas." },
  { name: "Julian", role: "Sales · Operations", description: "Your point of contact for planning the build, talking through options, and keeping the details moving." },
  { name: "Freddy", role: "Foreman · Fabrication", description: "Jose Alfredo \"Freddy\" leads the crew, handling the measurements, cuts, and welds that bring your plans to life." },
] as const;

export function Crew() {
  return (
    <section aria-labelledby="crew-heading" className="bg-white py-16 md:py-24">
      <Container size="wide">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-20">
          <div className="relative min-h-72 overflow-hidden rounded-lg bg-ink-100 lg:min-h-full">
            <Image src="/images/red-iron-frame-hero.jpg" alt="Red iron structure taking shape on a Triple J Metal jobsite" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-6 pt-16">
              <p className="text-sm text-white">From the first measurement to the final weld.</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-brand-700">Meet Triple J</p>
            <h2 id="crew-heading" className="mt-3 text-4xl uppercase leading-none text-ink-900 sm:text-5xl">Three names.<br />One family business.</h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-600">Juan, Julian, and Jose Alfredo. The people behind the name, based right here in Temple.</p>
            <div className="mt-7 divide-y divide-ink-100 border-y border-ink-100">
              {TEAM.map((person) => (
                <div key={person.name} className="py-5">
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <h3 className="text-2xl font-bold text-ink-900">{person.name}</h3>
                    <p className="text-sm text-brand-700">{person.role}</p>
                  </div>
                  <p className="mt-2 text-base leading-relaxed text-ink-600">{person.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <TrackedPhoneLink surface="crew" className="font-semibold text-brand-700">Talk with our team · </TrackedPhoneLink>
              <span className="text-ink-500">English &amp; Español</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
