import type { ReactNode } from "react";

import { Breadcrumb } from "./Breadcrumb";
import { PageHero } from "./PageHero";

/**
 * Privacy / Terms shell: plain navy header with the "Legal" breadcrumb, then a
 * 760px reading column. Section headings and body copy are styled from here,
 * so the pages keep plain <section><h2/><p/></section> markup.
 */
export function LegalPage({
  title,
  path,
  meta,
  children,
}: {
  title: string;
  path: string;
  /** "Last updated … · See also …" line under the h1. */
  meta: ReactNode;
  children: ReactNode;
}) {
  return (
    <div data-forge="">
      <PageHero
        variant="plain"
        breadcrumb={<Breadcrumb trail={[{ name: "Legal" }]} current={title} currentPath={path} />}
        eyebrow="Legal"
        h1a={title}
        lede={meta}
      />
      <section data-forge="" data-tone="light" className="bg-white py-[clamp(56px,6vw,96px)] text-forge-navy">
        <div className="mx-auto w-full max-w-[760px] space-y-9 px-[clamp(20px,3vw,40px)] text-[16px] leading-[1.7] text-forge-slate [&_h2]:font-forge-display [&_h2]:text-[22px] [&_h2]:font-bold [&_h2]:leading-[1.25] [&_h2]:text-forge-navy">
          {children}
        </div>
      </section>
    </div>
  );
}
