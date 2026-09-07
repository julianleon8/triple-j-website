import { SITE } from '@/lib/site'

/**
 * The plain-text NAP signature at the foot of every outbound email.
 *
 * This single line was previously duplicated across five templates, which put
 * the phone number and address in ten places that all had to change together.
 * They now derive from `src/lib/site.ts` like everything else.
 *
 * Pass `legal` for contractual copy — quotes use the registered name per the
 * `legalName` rule in site.ts. Everything else uses the brand name.
 */
export function napSignature({ legal = false }: { legal?: boolean } = {}): string {
  const name = legal ? SITE.legalName : SITE.name
  return `${name} · ${SITE.addressOneLine} · ${SITE.phone}`
}
