import Link from 'next/link'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

async function qboStatus(): Promise<'Connected' | 'Not connected'> {
  const { data } = await getAdminClient()
    .from('qbo_tokens')
    .select('id')
    .limit(1)
    .maybeSingle()
  return data ? 'Connected' : 'Not connected'
}

export default async function SettingsHubPage() {
  const qbo = await qboStatus()
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'dev'
  const builtAt = process.env.VERCEL_GIT_COMMIT_AUTHOR_NAME
    ? (process.env.VERCEL_DEPLOYMENT_CREATED_AT ?? '')
    : ''

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <SettingsGroup label="Device">
        <SettingsRow
          href="/hq/settings/notifications"
          title="Notifications"
          subtitle="Push alerts for new leads, hot permits, accepted quotes"
        />
      </SettingsGroup>

      <SettingsGroup label="System">
        <SettingsRow
          href="/hq/settings/testing"
          title="Testing"
          subtitle="Fire test push · test lead · run scrape"
        />
        <SettingsRow
          href="/hq/settings/logs"
          title="Logs"
          subtitle="Email events · delivery + engagement"
        />
      </SettingsGroup>

      <SettingsGroup label="Inboxes">
        <SettingsRow
          href="/hq/partners"
          title="Partner Inquiries"
          subtitle="B2B referrals from suppliers, manufacturers, GCs"
        />
      </SettingsGroup>

      <SettingsGroup label="Integrations">
        <SettingsRow
          href="/hq/settings/quickbooks"
          title="QuickBooks"
          subtitle={qbo}
          subtitleTone={qbo === 'Connected' ? 'positive' : 'neutral'}
        />
      </SettingsGroup>

      <SettingsGroup label="About">
        <StaticRow label="Version"  value={sha} mono />
        <StaticRow label="Theme"    value="Follows iOS system" />
        <StaticRow label="Language" value="English" />
        {builtAt && <StaticRow label="Deployed" value={builtAt} />}
      </SettingsGroup>
    </div>
  )
}

function SettingsGroup({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="mb-2 px-1 text-[12px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
        {label}
      </h2>
      <div className="overflow-hidden rounded-xl border border-(--border-subtle) bg-(--surface-2) divide-y divide-(--border-subtle)">
        {children}
      </div>
    </section>
  )
}

function SettingsRow({
  href,
  title,
  subtitle,
  subtitleTone,
}: {
  href: string
  title: string
  subtitle?: string
  subtitleTone?: 'positive' | 'neutral'
}) {
  return (
    <Link
      href={href}
      className="flex min-h-14 items-center gap-3 px-4 py-3 active:bg-(--surface-3) transition-colors"
    >
      <div className="min-w-0 flex-1">
        <div className="text-[16px] font-medium text-(--text-primary)">{title}</div>
        {subtitle && (
          <div
            className={`mt-0.5 text-[13px] ${
              subtitleTone === 'positive'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-(--text-tertiary)'
            }`}
          >
            {subtitle}
          </div>
        )}
      </div>
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 text-(--text-tertiary)"
      >
        <path d="M9 6l6 6-6 6" />
      </svg>
    </Link>
  )
}

function StaticRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex min-h-12 items-center justify-between px-4 py-2.5">
      <span className="text-[14px] text-(--text-secondary)">{label}</span>
      <span className={`text-[14px] text-(--text-primary) ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}
