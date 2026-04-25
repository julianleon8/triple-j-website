import { Heading, Text, Section } from '@react-email/components'
import BrandLayout, { BRAND_COLOR } from './BrandLayout'

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

  return (
    <BrandLayout preview={`Thanks ${name} — we got your request for a ${service} in ${city}`}>
      <Heading as="h2" style={{ fontSize: 20, fontWeight: 700, margin: '0 0 12px', color: '#111827' }}>
        Thanks, {name}!
      </Heading>

      <Text style={{ margin: '0 0 12px' }}>
        We received your request for a <strong>{service}</strong> in <strong>{city}</strong>.
      </Text>

      <Text style={{ margin: '0 0 20px' }}>
        A real person — usually Julian or Juan — will call you at{' '}
        <strong>{phone}</strong> within 24 hours with an honest quote.
      </Text>

      {isMilitary && (
        <Section style={{ background: '#eff6ff', borderLeft: `3px solid ${BRAND_COLOR}`, borderRadius: 6, padding: '12px 14px', marginBottom: 12 }}>
          <Text style={{ margin: 0, fontSize: 13, color: '#1e3a8a' }}>
            ⭐ <strong>Military/First Responder discount noted.</strong> We appreciate your service.
          </Text>
        </Section>
      )}

      {timeline === 'asap' && (
        <Section style={{ background: '#fef2f2', borderLeft: '3px solid #dc2626', borderRadius: 6, padding: '12px 14px', marginBottom: 12 }}>
          <Text style={{ margin: 0, fontSize: 13, color: '#991b1b' }}>
            ⚡ <strong>ASAP request flagged.</strong> We&apos;ll prioritize your callback.
          </Text>
        </Section>
      )}

      <Text style={{ margin: '20px 0 0', color: '#374151' }}>
        — Juan &amp; Julian, Triple J Metal
      </Text>
    </BrandLayout>
  )
}

export function leadCustomerConfirmationText(props: LeadCustomerConfirmationProps): string {
  const lines = [
    `Thanks, ${props.name}!`,
    ``,
    `We received your request for a ${props.serviceType.replace(/_/g, ' ')} in ${props.city}.`,
    ``,
    `A real person — usually Julian or Juan — will call you at ${props.phone} within 24 hours with an honest quote.`,
  ]
  if (props.isMilitary) {
    lines.push(``)
    lines.push(`⭐ Military/First Responder discount noted. We appreciate your service.`)
  }
  if (props.timeline === 'asap') {
    lines.push(``)
    lines.push(`⚡ ASAP request flagged. We'll prioritize your callback.`)
  }
  lines.push(``)
  lines.push(`— Juan & Julian, Triple J Metal`)
  lines.push(``)
  lines.push(`—`)
  lines.push(`Triple J Metal · 3319 Tem-Bel Ln, Temple, TX 76502 · 254-346-7764`)
  return lines.join('\n')
}
