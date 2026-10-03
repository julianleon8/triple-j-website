import Image from "next/image";
import Link from "next/link";

import { ForgeButtonLink } from "@/components/forge/ForgeButton";
import { ForgeReveal } from "@/components/forge/ForgeReveal";
import { QuoteRequestButton } from "@/components/forge/QuoteRequestButton";
import { SectionHeading } from "@/components/forge/SectionHeading";
import type { Locale } from "@/i18n/config";
import { HOME } from "@/i18n/pages/home";
import { localizeHref } from "@/i18n/routes";

/** Homepage service cards. The cards and their prices live in src/i18n/pages/home.ts. */
export function ServicesBand({ locale }: { locale: Locale }) {
  const t = HOME[locale].services;
  const f = t.fencing;
  return (
    <section
      id="services"
      data-forge=""
      data-tone="dark"
      aria-labelledby="services-heading"
      className="overflow-clip bg-forge-navy py-[clamp(64px,7vw,104px)] text-white"
    >
      <div className="mx-auto w-full max-w-[1360px] px-[clamp(20px,3vw,40px)]">
        <ForgeReveal className="max-w-[760px]">
          <SectionHeading
            tone="dark"
            eyebrow={t.eyebrow}
            headingId="services-heading"
            line1={t.line1}
            line2={t.line2}
            lede={t.lede}
            ledeMax="max-w-[640px]"
          />
        </ForgeReveal>
        <ForgeReveal stagger className="mt-12 grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
          {t.cards.map((s) => (
            <Link
              key={s.href}
              href={localizeHref(s.href, locale)}
              className="flex flex-col overflow-hidden rounded-[12px] border border-forge-silver/[.22] bg-forge-navy-raised transition-colors duration-300 hover:border-forge-silver/50"
            >
              <span className="relative block aspect-[5/4] overflow-hidden bg-forge-slate">
                <Image src={s.img} alt={s.headline} fill sizes="(min-width: 1200px) 320px, (min-width: 640px) 45vw, 100vw" className="object-cover" />
              </span>
              <span className="flex flex-1 flex-col px-5 pt-[18px] pb-5">
                <span className="text-[11px] font-semibold uppercase tracking-[.2em] text-forge-silver">{s.eyebrow}</span>
                <span className="mt-2 font-forge-display text-[20px] font-bold leading-[1.2] tracking-[.01em] text-white">{s.headline}</span>
                <span className="mt-2.5 text-[14px] leading-[1.55] text-white/72">{s.blurb}</span>
                <span className="mt-auto flex items-center justify-between gap-3 border-t border-forge-silver/[.18] pt-3.5 text-[13px]">
                  <span className="leading-[1.4] text-forge-silver">
                    {t.from} <b className="whitespace-nowrap text-white tabular-nums">${s.price}</b>{" "}
                    <span className="whitespace-nowrap">{t.steelInstall}</span>
                  </span>
                  <span className="whitespace-nowrap font-semibold text-forge-silver">{t.seeBuilds}</span>
                </span>
              </span>
            </Link>
          ))}

          <div className="relative flex min-h-full flex-col overflow-hidden rounded-[12px] border border-forge-silver/45 bg-forge-slate">
            <Image
              src="/images/metal-fence-ranch-wire.webp"
              alt={f.imgAlt}
              fill
              sizes="(min-width: 1200px) 320px, (min-width: 640px) 45vw, 100vw"
              className="object-cover object-[60%_50%]"
            />
            <div aria-hidden="true" className="absolute inset-0" style={{ background: "var(--scrim-photo-card-strong)" }} />
            <div className="relative flex flex-1 flex-col justify-end p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[.2em] text-forge-silver">{f.kicker}</p>
              <h3 className="mt-2 font-forge-display text-[clamp(24px,1.2vw_+_14px,30px)] font-black leading-[1.1] tracking-[.01em] text-white">
                {f.title} <span className="forge-steel-text">{f.titleAccent}</span>
              </h3>
              <p className="mt-2.5 text-[14px] leading-[1.55] text-white/80">
                {f.body}
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <ForgeButtonLink href={localizeHref("/services/metal-fencing", locale)} variant="white" size="md" arrow>
                  {f.explore}
                </ForgeButtonLink>
                <QuoteRequestButton request={{ service: "fencing", target: "quote-card" }} variant="outlineDark" size="md">
                  {f.quote}
                </QuoteRequestButton>
              </div>
            </div>
          </div>
        </ForgeReveal>
      </div>
    </section>
  );
}
