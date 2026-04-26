import { Heading, Text, Section, Row, Column, Link, Hr } from '@react-email/components'
import BrandLayout, { BRAND_COLOR, INK_900 } from './BrandLayout'

interface LeadOwnerAlertProps {
  leadId: string
  name: string
  phone: string
  email?: string | null
  city: string
  zip?: string | null
  serviceType: string
  structureType?: string | null
  sizeLine?: string | null
  needsConcreteLabel?: string | null
  currentSurfaceLabel?: string | null
  timelineLabel?: string | null
  timeline?: string | null
  isMilitary: boolean
  message?: string | null
  submittedAt: string
}

export default function LeadOwnerAlert(props: LeadOwnerAlertProps) {
  const {
    leadId,
    name,
    phone,
    email,
    city,
    zip,
    serviceType,
    structureType,
    sizeLine,
    needsConcreteLabel,
    currentSurfaceLabel,
    timelineLabel,
    timeline,
    isMilitary,
    message,
    submittedAt,
  } = props

  const isHot = timeline === 'asap'
  const urgencyBadge = isHot
    ? { label: '⚡ ASAP', bg: '#dc2626' }
    : timeline === 'this_week'
    ? { label: 'This Week', bg: '#d97706' }
    : null

  const phoneClean = phone.replace(/\D/g, '')
  const hqUrl = `https://www.triplejmetaltx.com/hq/leads/${leadId}`

  const rows: [string, React.ReactNode][] = [
    ['Name', <strong key="n" style={{ color: '#0a0e1a' }}>{name}</strong>],
    ['Phone', <Link key="p" href={`tel:${phone}`} style={dataLink}>{phone}</Link>],
  ]
  if (email) rows.push(['Email', <Link key="e" href={`mailto:${email}`} style={dataLink}>{email}</Link>])
  rows.push(['Location', `${city}${zip ? ` (${zip})` : ''}`])
  rows.push(['Service', serviceType.replace(/_/g, ' ')])
  if (structureType) rows.push(['Steel type', structureType])
  if (sizeLine) rows.push(['Size', sizeLine])
  if (needsConcreteLabel) rows.push(['Concrete pad', needsConcreteLabel])
  if (currentSurfaceLabel) rows.push(['Current surface', currentSurfaceLabel])
  if (timelineLabel) rows.push(['Timeline', timelineLabel])
  rows.push(['Military/FR', isMilitary ? '✅ Yes — apply 7% discount' : 'No'])
  if (message) rows.push(['Notes', <em key="m" style={{ color: '#374151' }}>&ldquo;{message}&rdquo;</em>])

  return (
    <BrandLayout preview={`${isHot ? '⚡ HOT — ' : ''}${name} · ${city} · ${serviceType.replace(/_/g, ' ')}`}>
      {/* ── Eyebrow + headline ────────────────────────────────────── */}
      <Text style={eyebrow}>
        {isHot ? '⚡ HOT LEAD' : 'NEW LEAD'} · {submittedAt}
      </Text>
      <Heading as="h1" style={headline}>
        {name}
      </Heading>
      <Text style={subhead}>
        {city}{zip ? `, TX ${zip}` : ', TX'} · {serviceType.replace(/_/g, ' ')}
        {sizeLine ? ` · ${sizeLine}` : ''}
      </Text>

      {/* ── Urgency / military badges ─────────────────────────────── */}
      {(urgencyBadge || isMilitary) && (
        <Section style={{ margin: '14px 0 22px' }}>
          {urgencyBadge && (
            <span style={{ ...badgeBase, background: urgencyBadge.bg }}>
              {urgencyBadge.label}
            </span>
          )}
          {isMilitary && (
            <span style={{ ...badgeBase, background: BRAND_COLOR, marginLeft: urgencyBadge ? 6 : 0 }}>
              ⭐ MILITARY / FR
            </span>
          )}
        </Section>
      )}

      {/* ── Quick-action buttons ──────────────────────────────────── */}
      <Section style={{ margin: '0 0 22px' }}>
        <table cellPadding={0} cellSpacing={0} role="presentation" style={{ width: '100%' }}>
          <tr>
            <td style={{ paddingRight: 6 }}>
              <Link href={`tel:${phoneClean}`} style={ctaPrimary}>
                📞 Call now
              </Link>
            </td>
            <td style={{ paddingLeft: 6, paddingRight: 6 }}>
              <Link href={`sms:${phoneClean}`} style={ctaSecondary}>
                💬 Text
              </Link>
            </td>
            <td style={{ paddingLeft: 6 }}>
              <Link href={hqUrl} style={ctaSecondary}>
                📋 Open in HQ
              </Link>
            </td>
          </tr>
        </table>
      </Section>

      {/* ── Detail table ──────────────────────────────────────────── */}
      <Text style={sectionLabel}>LEAD DETAILS</Text>
      <Section style={dataCard}>
        {rows.map(([label, value], i) => (
          <Row key={label} style={{ background: i % 2 === 0 ? '#f9fafb' : '#ffffff' }}>
            <Column style={dataLabelCell}>{label}</Column>
            <Column style={dataValueCell}>{value}</Column>
          </Row>
        ))}
      </Section>

      <Hr style={{ borderColor: '#e5e7eb', margin: '20px 0 12px' }} />
      <Text style={metaLine}>
        Lead ID: <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>{leadId}</code>
      </Text>
    </BrandLayout>
  )
}

export function leadOwnerAlertText(props: LeadOwnerAlertProps): string {
  const isHot = props.timeline === 'asap'
  const lines = [
    `${isHot ? '⚡ HOT LEAD' : 'NEW LEAD'} — ${props.name}`,
    `${props.city}${props.zip ? `, TX ${props.zip}` : ', TX'} · ${props.serviceType.replace(/_/g, ' ')}`,
    ``,
    `📞 ${props.phone}`,
  ]
  if (props.email) lines.push(`✉️  ${props.email}`)
  lines.push(``)
  lines.push(`— DETAILS —`)
  if (props.structureType) lines.push(`Steel: ${props.structureType}`)
  if (props.sizeLine) lines.push(`Size: ${props.sizeLine}`)
  if (props.needsConcreteLabel) lines.push(`Concrete: ${props.needsConcreteLabel}`)
  if (props.currentSurfaceLabel) lines.push(`Surface: ${props.currentSurfaceLabel}`)
  if (props.timelineLabel) lines.push(`Timeline: ${props.timelineLabel}`)
  lines.push(`Military/FR: ${props.isMilitary ? 'Yes — apply 7% discount' : 'No'}`)
  if (props.message) lines.push(`Notes: ${props.message}`)
  lines.push(``)
  lines.push(`Open in HQ: https://www.triplejmetaltx.com/hq/leads/${props.leadId}`)
  lines.push(``)
  lines.push(`Submitted: ${props.submittedAt}`)
  lines.push(`Lead ID: ${props.leadId}`)
  return lines.join('\n')
}

/* ── Styles ────────────────────────────────────────────────────── */

const eyebrow = {
  color: BRAND_COLOR,
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
  margin: '0 0 6px',
}

const headline = {
  color: INK_900,
  fontSize: '28px',
  fontWeight: 800,
  letterSpacing: '-0.01em',
  lineHeight: 1.1,
  margin: '0 0 6px',
}

const subhead = {
  color: '#374151',
  fontSize: '14px',
  margin: 0,
}

const badgeBase = {
  display: 'inline-block',
  color: '#ffffff',
  padding: '4px 10px',
  borderRadius: 4,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'uppercase' as const,
}

const ctaPrimary = {
  display: 'block',
  background: BRAND_COLOR,
  color: '#ffffff',
  textAlign: 'center' as const,
  padding: '12px 8px',
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 700,
  textDecoration: 'none',
  letterSpacing: '0.01em',
}

const ctaSecondary = {
  display: 'block',
  background: '#f3f4f6',
  color: INK_900,
  textAlign: 'center' as const,
  padding: '12px 8px',
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 700,
  textDecoration: 'none',
  letterSpacing: '0.01em',
  border: '1px solid #e5e7eb',
}

const sectionLabel = {
  color: '#6b7280',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.16em',
  textTransform: 'uppercase' as const,
  margin: '0 0 8px',
}

const dataCard = {
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  overflow: 'hidden',
}

const dataLabelCell = {
  padding: '10px 14px',
  fontWeight: 600,
  fontSize: 12,
  color: '#6b7280',
  width: 120,
  verticalAlign: 'top' as const,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
}

const dataValueCell = {
  padding: '10px 14px',
  fontSize: 14,
  color: '#111827',
  verticalAlign: 'top' as const,
}

const dataLink = {
  color: BRAND_COLOR,
  fontWeight: 700,
  textDecoration: 'none',
}

const metaLine = {
  color: '#9ca3af',
  fontSize: 11,
  margin: 0,
}
