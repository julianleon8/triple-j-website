import { ExternalLink, UserSquare2 } from 'lucide-react'
import Link from 'next/link'
import { getAdminClient } from '@/lib/supabase/admin'

type Attribution = {
  source: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_term: string | null
  utm_content: string | null
  gclid: string | null
  fbclid: string | null
  landing_url: string | null
  referrer_url: string | null
  referring_customer_id: string | null
  first_response_at: string | null
  intent_stage: string | null
  estimated_budget_min: number | null
  estimated_budget_max: number | null
}

type Props = {
  lead: Attribution
}

const INTENT_LABEL: Record<string, string> = {
  info_gathering:  'Info gathering',
  timeline_known:  'Timeline known',
  budget_set:      'Budget set',
  ready_to_buy:    'Ready to buy',
}

const INTENT_TONE: Record<string, string> = {
  info_gathering:  'bg-(--surface-3) text-(--text-secondary)',
  timeline_known:  'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  budget_set:      'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  ready_to_buy:    'bg-(--brand-fg)/15 text-(--brand-fg)',
}

/**
 * Read-only attribution panel for /hq/leads/[id]. Server component —
 * resolves the referring-customer name in-band so the link works
 * without a client roundtrip.
 *
 * Hides itself when the lead has zero attribution data so we don't
 * render an empty card on legacy leads.
 */
export async function AttributionCard({ lead }: Props) {
  const hasAttribution =
    lead.utm_source ||
    lead.utm_medium ||
    lead.utm_campaign ||
    lead.gclid ||
    lead.fbclid ||
    lead.landing_url ||
    lead.referrer_url ||
    lead.referring_customer_id ||
    lead.first_response_at ||
    lead.intent_stage

  if (!hasAttribution) return null

  // Resolve referring customer name (single row lookup — cheap).
  let referringName: string | null = null
  if (lead.referring_customer_id) {
    const { data } = await getAdminClient()
      .from('customers')
      .select('name')
      .eq('id', lead.referring_customer_id)
      .maybeSingle()
    referringName = data?.name ?? null
  }

  return (
    <section className="rounded-2xl border border-(--border-subtle) bg-(--surface-2) p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
          Attribution
        </h2>
        {lead.intent_stage ? (
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              INTENT_TONE[lead.intent_stage] ?? INTENT_TONE.info_gathering
            }`}
          >
            {INTENT_LABEL[lead.intent_stage] ?? lead.intent_stage}
          </span>
        ) : null}
      </div>

      <dl className="mt-3 grid grid-cols-1 gap-y-2.5 text-[14px] sm:grid-cols-2 sm:gap-x-6">
        <Field label="Source" value={lead.source} />
        <Field label="UTM Source" value={lead.utm_source} />
        <Field label="UTM Medium" value={lead.utm_medium} />
        <Field label="UTM Campaign" value={lead.utm_campaign} />
        <Field label="UTM Term" value={lead.utm_term} />
        <Field label="UTM Content" value={lead.utm_content} />
        <Field label="gclid" value={lead.gclid} mono />
        <Field label="fbclid" value={lead.fbclid} mono />

        {lead.referring_customer_id && referringName ? (
          <div className="sm:col-span-2">
            <dt className="text-[12px] text-(--text-tertiary)">Referred by</dt>
            <dd className="mt-0.5">
              <Link
                href={`/hq/customers/${lead.referring_customer_id}`}
                className="inline-flex items-center gap-1 text-(--brand-fg) hover:underline"
              >
                <UserSquare2 size={14} strokeWidth={2} /> {referringName}
              </Link>
            </dd>
          </div>
        ) : null}

        {lead.first_response_at ? (
          <Field
            label="First response"
            value={new Date(lead.first_response_at).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          />
        ) : null}

        {lead.estimated_budget_min || lead.estimated_budget_max ? (
          <Field
            label="Budget"
            value={[
              lead.estimated_budget_min ? `$${lead.estimated_budget_min.toLocaleString()}` : null,
              lead.estimated_budget_max ? `$${lead.estimated_budget_max.toLocaleString()}` : null,
            ].filter(Boolean).join(' – ') || null}
          />
        ) : null}
      </dl>

      {lead.landing_url || lead.referrer_url ? (
        <ul className="mt-3 space-y-1.5 border-t border-(--border-subtle) pt-3 text-[12px]">
          {lead.landing_url ? (
            <li className="truncate">
              <span className="text-(--text-tertiary)">Landed on </span>
              <a
                href={lead.landing_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-(--brand-fg) hover:underline"
              >
                {trimUrl(lead.landing_url)}
                <ExternalLink size={11} strokeWidth={2} />
              </a>
            </li>
          ) : null}
          {lead.referrer_url ? (
            <li className="truncate">
              <span className="text-(--text-tertiary)">From </span>
              <a
                href={lead.referrer_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-(--brand-fg) hover:underline"
              >
                {trimUrl(lead.referrer_url)}
                <ExternalLink size={11} strokeWidth={2} />
              </a>
            </li>
          ) : null}
        </ul>
      ) : null}
    </section>
  )
}

function Field({
  label, value, mono,
}: {
  label: string
  value: string | null
  mono?: boolean
}) {
  if (!value) return null
  return (
    <div>
      <dt className="text-[12px] text-(--text-tertiary)">{label}</dt>
      <dd className={`mt-0.5 text-(--text-primary) ${mono ? 'font-mono text-[12px]' : ''}`}>
        {value}
      </dd>
    </div>
  )
}

function trimUrl(url: string): string {
  try {
    const u = new URL(url)
    return `${u.host}${u.pathname.length > 1 ? u.pathname : ''}`
  } catch {
    return url.length > 60 ? url.slice(0, 60) + '…' : url
  }
}
