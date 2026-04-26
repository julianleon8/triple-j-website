import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { ReactNode } from 'react'

const LOGO_URL = 'https://www.triplejmetaltx.com/images/logo-lion.png'
const BRAND_COLOR = '#1e6bd6'
const BRAND_DARK = '#164aa0'
const INK_900 = '#0a0e1a'

interface BrandLayoutProps {
  preview: string
  children: ReactNode
}

/**
 * Email shell — dark editorial header + brand-blue accent stripe + white
 * card body + ink footer with family signature + NAP. Mirrors the site's
 * magazine treatment as far as email-safe CSS allows (no flexbox, no
 * gradients, system fonts only).
 *
 * Wraps every transactional email — change here cascades to all 7
 * templates without touching them individually.
 */
export default function BrandLayout({ preview, children }: BrandLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          {/* ── Dark editorial header ─────────────────────────────────── */}
          <Section style={header}>
            <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
              <tr>
                <td style={{ width: 80, paddingRight: 16, verticalAlign: 'middle' }}>
                  <Img
                    src={LOGO_URL}
                    width="64"
                    height="64"
                    alt="Triple J Metal"
                    style={{ display: 'block', borderRadius: 12 }}
                  />
                </td>
                <td style={{ verticalAlign: 'middle' }}>
                  <Text style={brandWordmarkTop}>TRIPLE J</Text>
                  <Text style={brandWordmarkBottom}>METAL</Text>
                </td>
                <td style={{ textAlign: 'right', verticalAlign: 'middle' }}>
                  <Link href="tel:+12543467764" style={headerPhone}>
                    254-346-7764
                  </Link>
                  <Text style={headerHours}>Mon–Sat · 8a–6p</Text>
                </td>
              </tr>
            </table>
          </Section>

          {/* ── Brand-blue signature stripe ───────────────────────────── */}
          <Section style={accentStripe} />

          {/* ── Body card ─────────────────────────────────────────────── */}
          <Section style={bodySection}>{children}</Section>

          {/* ── Footer — family signature + NAP + tagline ─────────────── */}
          <Section style={footer}>
            <Text style={footerSignature}>
              Juan, Julian &amp; Freddy
            </Text>
            <Text style={footerFamily}>
              Family-owned · Founded 2025 · 150+ Central Texas builds
            </Text>
            <Hr style={footerDivider} />
            <Text style={footerTagline}>
              BUILT RIGHT · BUILT FAST · BUILT BY TRIPLE J
            </Text>
            <Text style={footerNap}>
              3319 Tem-Bel Ln, Temple, TX 76502 ·{' '}
              <Link href="tel:+12543467764" style={footerLink}>
                254-346-7764
              </Link>
              {' '}·{' '}
              <Link href="https://www.triplejmetaltx.com" style={footerLink}>
                triplejmetaltx.com
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const TEXT_FOOTER = `
—
Triple J Metal — Juan, Julian & Freddy
3319 Tem-Bel Ln, Temple, TX 76502
254-346-7764 · triplejmetaltx.com
Built right, built fast, built by Triple J.
`.trim()

export { BRAND_COLOR, BRAND_DARK, INK_900, LOGO_URL }

/* ── Styles (inlined object form per react-email convention) ───────── */

const body = {
  margin: 0,
  padding: '24px 0',
  backgroundColor: '#f5f5f5',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
}

const container = {
  maxWidth: '620px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '14px',
  overflow: 'hidden',
  boxShadow: '0 4px 24px rgba(10, 14, 26, 0.06)',
}

const header = {
  backgroundColor: INK_900,
  padding: '22px 26px',
}

const brandWordmarkTop = {
  color: '#ffffff',
  fontSize: '22px',
  fontWeight: 900,
  letterSpacing: '0.02em',
  lineHeight: 1,
  margin: 0,
  textTransform: 'uppercase' as const,
  fontFamily:
    '"Arial Black", "Helvetica Neue", Arial, sans-serif',
}

const brandWordmarkBottom = {
  color: BRAND_COLOR,
  fontSize: '20px',
  fontWeight: 900,
  letterSpacing: '0.02em',
  lineHeight: 1,
  margin: '2px 0 0',
  textTransform: 'uppercase' as const,
  fontFamily:
    '"Arial Black", "Helvetica Neue", Arial, sans-serif',
}

const headerPhone = {
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 700,
  textDecoration: 'none',
  fontVariantNumeric: 'tabular-nums' as const,
}

const headerHours = {
  color: 'rgba(255, 255, 255, 0.55)',
  fontSize: '11px',
  margin: '4px 0 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
}

const accentStripe = {
  height: '4px',
  backgroundColor: BRAND_COLOR,
  fontSize: 0,
  lineHeight: 0,
}

const bodySection = {
  padding: '32px 30px 26px',
  color: '#1f2937',
  fontSize: '15px',
  lineHeight: 1.6,
}

const footer = {
  padding: '24px 30px 26px',
  backgroundColor: INK_900,
  color: 'rgba(255, 255, 255, 0.7)',
  textAlign: 'center' as const,
}

const footerSignature = {
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: 700,
  margin: 0,
  letterSpacing: '0.01em',
}

const footerFamily = {
  color: 'rgba(255, 255, 255, 0.55)',
  fontSize: '11px',
  margin: '4px 0 0',
}

const footerDivider = {
  borderColor: 'rgba(255, 255, 255, 0.12)',
  margin: '16px auto',
  width: '40%',
}

const footerTagline = {
  color: BRAND_COLOR,
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.18em',
  margin: 0,
}

const footerNap = {
  color: 'rgba(255, 255, 255, 0.55)',
  fontSize: '11px',
  margin: '10px 0 0',
  lineHeight: 1.5,
}

const footerLink = {
  color: 'rgba(255, 255, 255, 0.85)',
  textDecoration: 'none',
  fontWeight: 600,
}
