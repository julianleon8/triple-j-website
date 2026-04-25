import { Heading, Text, Section, Row, Column, Link } from '@react-email/components'
import BrandLayout, { BRAND_COLOR } from './BrandLayout'

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

  const urgency = timeline === 'asap'
    ? { label: '⚡ ASAP', color: '#dc2626' }
    : timeline === 'this_week'
    ? { label: 'This Week', color: '#d97706' }
    : null

  const rows: [string, React.ReactNode][] = [
    ['Name', name],
    ['Phone', <Link key="p" href={`tel:${phone}`} style={{ color: BRAND_COLOR, fontWeight: 700 }}>{phone}</Link>],
  ]
  if (email) rows.push(['Email', email])
  rows.push(['Location', `${city}${zip ? ` (${zip})` : ''}`])
  rows.push(['Service', serviceType.replace(/_/g, ' ')])
  if (structureType) rows.push(['Steel type', structureType])
  if (sizeLine) rows.push(['Size', sizeLine])
  if (needsConcreteLabel) rows.push(['Concrete pad', needsConcreteLabel])
  if (currentSurfaceLabel) rows.push(['Current surface', currentSurfaceLabel])
  if (timelineLabel) rows.push(['Timeline', timelineLabel])
  rows.push(['Military/FR', isMilitary ? '✅ Yes — apply discount' : 'No'])
  if (message) rows.push(['Notes', message])

  return (
    <BrandLayout preview={`New lead — ${name} (${city}) — ${serviceType}`}>
      <Heading as="h2" style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px', color: '#111827' }}>
        New lead
      </Heading>
      <Text style={{ fontSize: 12, color: '#6b7280', margin: '0 0 16px' }}>
        {urgency && (
          <span style={{
            background: urgency.color,
            color: '#fff',
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 700,
            marginRight: 8,
          }}>
            {urgency.label}
          </span>
        )}
        {isMilitary && (
          <span style={{
            background: '#1d4ed8',
            color: '#fff',
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 700,
            marginRight: 8,
          }}>
            ⭐ Military/FR
          </span>
        )}
        {submittedAt}
      </Text>

      <Section style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
        {rows.map(([label, value], i) => (
          <Row key={label} style={{ background: i % 2 === 0 ? '#f9fafb' : '#ffffff' }}>
            <Column style={{ padding: '10px 14px', fontWeight: 600, fontSize: 13, color: '#374151', width: 130, verticalAlign: 'top' }}>
              {label}
            </Column>
            <Column style={{ padding: '10px 14px', fontSize: 13, color: '#111827' }}>
              {value}
            </Column>
          </Row>
        ))}
      </Section>

      <Text style={{ color: '#9ca3af', fontSize: 11, margin: '20px 0 0' }}>
        Lead ID: {leadId}
      </Text>
    </BrandLayout>
  )
}

export function leadOwnerAlertText(props: LeadOwnerAlertProps): string {
  const lines = [
    `NEW LEAD — Triple J Metal`,
    ``,
    `Name: ${props.name}`,
    `Phone: ${props.phone}`,
  ]
  if (props.email) lines.push(`Email: ${props.email}`)
  lines.push(`Location: ${props.city}${props.zip ? ` (${props.zip})` : ''}`)
  lines.push(`Service: ${props.serviceType.replace(/_/g, ' ')}`)
  if (props.structureType) lines.push(`Steel type: ${props.structureType}`)
  if (props.sizeLine) lines.push(`Size: ${props.sizeLine}`)
  if (props.needsConcreteLabel) lines.push(`Concrete pad: ${props.needsConcreteLabel}`)
  if (props.currentSurfaceLabel) lines.push(`Current surface: ${props.currentSurfaceLabel}`)
  if (props.timelineLabel) lines.push(`Timeline: ${props.timelineLabel}`)
  lines.push(`Military/FR: ${props.isMilitary ? 'Yes — apply discount' : 'No'}`)
  if (props.message) lines.push(`Notes: ${props.message}`)
  lines.push(``)
  lines.push(`Lead ID: ${props.leadId}`)
  lines.push(``)
  lines.push(`Submitted: ${props.submittedAt}`)
  lines.push(``)
  lines.push(`—`)
  lines.push(`Triple J Metal · 3319 Tem-Bel Ln, Temple, TX 76502 · 254-346-7764`)
  return lines.join('\n')
}
