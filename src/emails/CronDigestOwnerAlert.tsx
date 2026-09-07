import { Heading, Text, Section, Row, Column, Link } from '@react-email/components'
import BrandLayout, { BRAND_COLOR } from './BrandLayout'
import { napSignature } from './nap'

export interface CronDigestItem {
  primary: string
  secondary?: string | null
  /** Absolute URL — email clients cannot resolve site-relative hrefs. */
  href?: string | null
}

export interface CronDigestOwnerAlertProps {
  /** Short uppercase pill, e.g. "STALE LEADS". */
  badge: string
  badgeColor?: string
  heading: string
  subhead?: string | null
  items: CronDigestItem[]
  /** Shown when items were truncated for length. */
  moreCount?: number
  footnote?: string | null
  ctaLabel?: string | null
  ctaHref?: string | null
}

/**
 * One owner-facing digest email, shared by every scheduled job that reports a
 * list of things needing attention (stale leads, stalled quotes, bounced
 * mail). Deliberately generic: three near-identical templates would drift,
 * and the jobs differ only in wording, not in shape.
 *
 * The push notification is the primary channel for all of these; this is the
 * fallback that survives a device with no subscription.
 */
export default function CronDigestOwnerAlert(props: CronDigestOwnerAlertProps) {
  const {
    badge,
    badgeColor = '#b45309',
    heading,
    subhead,
    items,
    moreCount = 0,
    footnote,
    ctaLabel,
    ctaHref,
  } = props

  return (
    <BrandLayout preview={`${heading}${subhead ? ` — ${subhead}` : ''}`}>
      <Text style={{ margin: '0 0 10px' }}>
        <span style={{
          background: badgeColor,
          color: '#fff',
          padding: '4px 10px',
          borderRadius: 4,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 0.3,
        }}>
          {badge}
        </span>
      </Text>

      <Heading as="h2" style={{ fontSize: 22, fontWeight: 700, margin: '6px 0 4px', color: '#111827' }}>
        {heading}
      </Heading>
      {subhead && (
        <Text style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px' }}>{subhead}</Text>
      )}

      {items.length > 0 && (
        <Section style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
          {items.map((item, i) => (
            <Row key={`${item.primary}-${i}`} style={{ background: i % 2 === 0 ? '#f9fafb' : '#ffffff' }}>
              <Column style={{ padding: '10px 14px', fontSize: 13, color: '#111827' }}>
                {item.href ? (
                  <Link href={item.href} style={{ color: BRAND_COLOR, fontWeight: 700 }}>
                    {item.primary}
                  </Link>
                ) : (
                  <span style={{ fontWeight: 700 }}>{item.primary}</span>
                )}
                {item.secondary && (
                  <span style={{ color: '#6b7280' }}> — {item.secondary}</span>
                )}
              </Column>
            </Row>
          ))}
        </Section>
      )}

      {moreCount > 0 && (
        <Text style={{ margin: '10px 0 0', fontSize: 13, color: '#6b7280' }}>
          + {moreCount} more not listed here.
        </Text>
      )}

      {footnote && (
        <Text style={{ margin: '18px 0 0', fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
          {footnote}
        </Text>
      )}

      {ctaLabel && ctaHref && (
        <Text style={{ margin: '18px 0 0' }}>
          <Link
            href={ctaHref}
            style={{
              background: BRAND_COLOR,
              color: '#fff',
              padding: '10px 18px',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            {ctaLabel}
          </Link>
        </Text>
      )}
    </BrandLayout>
  )
}

export function cronDigestOwnerAlertText(props: CronDigestOwnerAlertProps): string {
  const lines: string[] = [props.heading]
  if (props.subhead) lines.push(props.subhead)
  lines.push('')

  for (const item of props.items) {
    lines.push(`- ${item.primary}${item.secondary ? ` — ${item.secondary}` : ''}`)
    if (item.href) lines.push(`  ${item.href}`)
  }
  if (props.moreCount && props.moreCount > 0) {
    lines.push(`- + ${props.moreCount} more not listed here.`)
  }

  if (props.footnote) {
    lines.push('')
    lines.push(props.footnote)
  }
  if (props.ctaLabel && props.ctaHref) {
    lines.push('')
    lines.push(`${props.ctaLabel}: ${props.ctaHref}`)
  }

  lines.push('')
  lines.push('—')
  lines.push(napSignature())
  return lines.join('\n')
}
