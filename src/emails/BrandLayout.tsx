import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Row,
  Column,
  Img,
  Text,
  Link,
  Hr,
} from '@react-email/components'
import type { ReactNode } from 'react'

const LOGO_URL = 'https://triplejmetaltx.com/images/logo-lion.png'
const BRAND_COLOR = '#1e6bd6'
const BRAND_DARK = '#164aa0'

interface BrandLayoutProps {
  preview: string
  children: ReactNode
}

export default function BrandLayout({ preview, children }: BrandLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Row>
              <Column style={{ width: 52 }}>
                <Img
                  src={LOGO_URL}
                  width="44"
                  height="44"
                  alt="Triple J Metal"
                  style={{ display: 'block', borderRadius: 8 }}
                />
              </Column>
              <Column>
                <Text style={brandName}>Triple J Metal</Text>
                <Text style={brandTagline}>Temple, TX · 254-346-7764</Text>
              </Column>
            </Row>
          </Section>

          <Section style={bodySection}>{children}</Section>

          <Hr style={divider} />

          <Section style={footer}>
            <Text style={footerTitle}>Triple J Metal</Text>
            <Text style={footerLine}>
              3319 Tem-Bel Ln, Temple, TX 76502 ·{' '}
              <Link href="tel:+12543467764" style={footerLink}>
                254-346-7764
              </Link>{' '}
              ·{' '}
              <Link href="https://triplejmetaltx.com" style={footerLink}>
                triplejmetaltx.com
              </Link>
            </Text>
            <Text style={footerTagline}>
              Welded or bolted carports, garages, barns, RV covers — built same-week across Central Texas.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const TEXT_FOOTER = `
—
Triple J Metal
3319 Tem-Bel Ln, Temple, TX 76502
254-346-7764 · triplejmetaltx.com
`.trim()

export { BRAND_COLOR, BRAND_DARK, LOGO_URL }

const body = {
  margin: 0,
  padding: '24px 0',
  backgroundColor: '#f5f5f5',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
}

const container = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  overflow: 'hidden',
}

const header = {
  backgroundColor: BRAND_COLOR,
  padding: '20px 24px',
}

const brandName = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 700,
  margin: 0,
  letterSpacing: '0.2px',
}

const brandTagline = {
  color: 'rgba(255, 255, 255, 0.82)',
  fontSize: '12px',
  margin: '2px 0 0',
}

const bodySection = {
  padding: '28px 28px 20px',
  color: '#1f2937',
  fontSize: '14px',
  lineHeight: 1.6,
}

const divider = {
  borderColor: '#eef0f3',
  margin: 0,
}

const footer = {
  padding: '16px 28px 22px',
  backgroundColor: '#f9fafb',
}

const footerTitle = {
  color: '#374151',
  fontSize: '11px',
  fontWeight: 700,
  margin: 0,
}

const footerLine = {
  color: '#6b7280',
  fontSize: '11px',
  margin: '4px 0 0',
  lineHeight: 1.5,
}

const footerLink = {
  color: BRAND_COLOR,
  textDecoration: 'none',
}

const footerTagline = {
  color: '#9ca3af',
  fontSize: '11px',
  margin: '6px 0 0',
  lineHeight: 1.5,
}
