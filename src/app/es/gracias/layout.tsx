import type { ReactNode } from "react";

import { PreFooterCta } from "@/components/site/PreFooterCta";

/** No Forge quote section on these pages, so they close with the CTA band (twin of /thank-you's layout). */
export default function WithPreFooterCta({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <PreFooterCta locale="es" />
    </>
  );
}
