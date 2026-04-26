import { Heading, Text, Section, Link } from '@react-email/components'
import BrandLayout, { BRAND_COLOR, INK_900 } from './BrandLayout'

interface LeadCustomerConfirmationProps {
  name: string
  phone: string
  city: string
  serviceType: string
  isMilitary: boolean
  timeline?: string | null
}

export default function LeadCustomerConfirmation(props: LeadCustomerConfirmationProps) {
  const { name, phone, city, serviceType, isMilitary, timeline } = props
  const service = serviceType.replace(/_/g, ' ')
  const isHot = timeline === 'asap'

  return (
    <BrandLayout preview={`Got it ${name} — your ${service} request is in. We'll call you back today.`}>
      {/* ── Eyebrow ──────────────────────────────────────────────── */}
      <Text style={eyebrow}>QUOTE REQUEST RECEIVED</Text>

      {/* ── Big magazine headline ────────────────────────────────── */}
      <Heading as="h1" style={headline}>
        Thanks, {name}.
      </Heading>
      <Text style={subhead}>
        We got your <strong style={{ color: INK_900 }}>{service}</strong> request for <strong style={{ color: INK_900 }}>{city}</strong>.
      </Text>

      {/* ── The promise — what happens next ──────────────────────── */}
      <Section style={promiseCard}>
        <Text style={promiseLabel}>WHAT HAPPENS NEXT</Text>
        <Text style={promiseText}>
          A real person — usually <strong>Julian or Juan</strong> — will call you back at{' '}
          <strong style={{ color: INK_900 }}>{phone}</strong>{' '}
          {isHot ? 'today' : 'within 24 hours'} with an honest quote. No pressure, no offshore call center, no automated form replies.
        </Text>
      </Section>

      {/* ── Conditional flags — military / ASAP ──────────────────── */}
      {isMilitary && (
        <Section style={{ ...flagCard, background: '#eff6ff', borderLeftColor: BRAND_COLOR }}>
          <Text style={{ ...flagText, color: '#1e3a8a' }}>
            ⭐ <strong>Military / First Responder discount noted.</strong> 7% off your install. Thank you for your service.
          </Text>
        </Section>
      )}
      {isHot && (
        <Section style={{ ...flagCard, background: '#fef2f2', borderLeftColor: '#dc2626' }}>
          <Text style={{ ...flagText, color: '#991b1b' }}>
            ⚡ <strong>ASAP request flagged.</strong> Your callback is moving to the top of the list.
          </Text>
        </Section>
      )}

      {/* ── Soft urgency — call us if you can't wait ─────────────── */}
      <Section style={{ margin: '24px 0 0' }}>
        <Text style={callNowText}>
          Can&rsquo;t wait? Call us directly:
        </Text>
        <Link href="tel:+12543467764" style={callNowButton}>
          📞 254-346-7764
        </Link>
      </Section>

      {/* ── Family signature ─────────────────────────────────────── */}
      <Text style={signature}>
        — Juan, Julian &amp; Freddy
        <br />
        <span style={signatureSub}>The Triple J crew · Temple, TX</span>
      </Text>
    </BrandLayout>
  )
}

export function leadCustomerConfirmationText(props: LeadCustomerConfirmationProps): string {
  const isHot = props.timeline === 'asap'
  const lines = [
    `QUOTE REQUEST RECEIVED`,
    ``,
    `Thanks, ${props.name}.`,
    ``,
    `We got your ${props.serviceType.replace(/_/g, ' ')} request for ${props.city}.`,
    ``,
    `WHAT HAPPENS NEXT`,
    `A real person — usually Julian or Juan — will call you back at ${props.phone} ${isHot ? 'today' : 'within 24 hours'} with an honest quote. No pressure, no offshore call center, no automated form replies.`,
  ]
  if (props.isMilitary) {
    lines.push(``)
    lines.push(`⭐ Military / First Responder discount noted. 7% off your install. Thank you for your service.`)
  }
  if (isHot) {
    lines.push(``)
    lines.push(`⚡ ASAP request flagged. Your callback is moving to the top of the list.`)
  }
  lines.push(``)
  lines.push(`Can't wait? Call us directly: 254-346-7764`)
  lines.push(``)
  lines.push(`— Juan, Julian & Freddy`)
  lines.push(`The Triple J crew · Temple, TX`)
  lines.push(``)
  lines.push(`—`)
  lines.push(`Triple J Metal · 3319 Tem-Bel Ln, Temple, TX 76502 · 254-346-7764`)
  lines.push(`Built right, built fast, built by Triple J.`)
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
  fontSize: '32px',
  fontWeight: 800,
  letterSpacing: '-0.02em',
  lineHeight: 1.05,
  margin: '0 0 8px',
}

const subhead = {
  color: '#374151',
  fontSize: '16px',
  margin: '0 0 24px',
  lineHeight: 1.5,
}

const promiseCard = {
  background: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: 10,
  padding: '18px 20px',
  margin: '0 0 16px',
}

const promiseLabel = {
  color: '#6b7280',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.16em',
  textTransform: 'uppercase' as const,
  margin: '0 0 8px',
}

const promiseText = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: 1.6,
  margin: 0,
}

const flagCard = {
  borderLeft: '4px solid',
  borderRadius: 6,
  padding: '12px 16px',
  margin: '0 0 12px',
}

const flagText = {
  fontSize: '13px',
  margin: 0,
  lineHeight: 1.5,
}

const callNowText = {
  color: '#6b7280',
  fontSize: '13px',
  margin: '0 0 8px',
}

const callNowButton = {
  display: 'inline-block',
  background: INK_900,
  color: '#ffffff',
  padding: '12px 22px',
  borderRadius: 8,
  fontSize: '16px',
  fontWeight: 700,
  textDecoration: 'none',
  letterSpacing: '0.01em',
}

const signature = {
  color: INK_900,
  fontSize: '15px',
  fontWeight: 700,
  margin: '28px 0 0',
  lineHeight: 1.4,
}

const signatureSub = {
  color: '#6b7280',
  fontSize: '12px',
  fontWeight: 400,
}
