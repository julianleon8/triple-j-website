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
import { SITE } from '@/lib/site'

const LOGO_URL = 'https://www.triplejmetaltx.com/images/logo-lion.png'
// Forge (2026-10-02): navy replaces royal blue. Names kept so the templates
// that import them pick the palette up without edits.
const BRAND_COLOR = '#00182a'
const BRAND_DARK = '#0c2538'
const INK_900 = '#00182a'
const SLATE = '#546678'
const STEEL = '#788a9c'
const STEEL_LIGHT = '#9fb0c0'
/** Gmail and most clients ignore web fonts, so Cinzel falls back to Georgia. */
const DISPLAY_FONT = 'Cinzel, Georgia, "Times New Roman", serif'

interface BrandLayoutProps {
  preview: string
  children: ReactNode
}

/**
 * Email shell — navy header with the lion lockup + steel rule + white card
 * body + navy footer with family signature + NAP. Mirrors the site's Forge
 * treatment as far as email-safe CSS allows (no flexbox, no gradients; the
 * Cinzel wordmark falls back to Georgia where web fonts are ignored).
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
          {/* ── Navy header ───────────────────────────────────────────── */}
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
                  <Text style={brandWordmark}>Triple J Metal</Text>
                </td>
                <td style={{ textAlign: 'right', verticalAlign: 'middle' }}>
                  <Link href={SITE.phoneHref} style={headerPhone}>
                    {SITE.phone}
                  </Link>
                  <Text style={headerHours}>Mon–Sat · 8a–6p</Text>
                </td>
              </tr>
            </table>
          </Section>

          {/* ── Steel rule under the header ───────────────────────────── */}
          <Section style={accentStripe} />

          {/* ── Body card ─────────────────────────────────────────────── */}
          <Section style={bodySection}>{children}</Section>

          {/* ── Footer — family signature + NAP + tagline ─────────────── */}
          <Section style={footer}>
            <Text style={footerSignature}>
              Julian Leon
            </Text>
            <Text style={footerFamily}>
              Family-owned · Founded 2025 · 150+ Central Texas builds
            </Text>
            <Hr style={footerDivider} />
            <Text style={footerTagline}>
              BUILT RIGHT · BUILT FAST · BUILT BY TRIPLE J
            </Text>
            <Text style={footerNap}>
              {SITE.addressOneLine} ·{' '}
              <Link href={SITE.phoneHref} style={footerLink}>
                {SITE.phone}
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
Triple J Metal — Julian Leon
${SITE.addressOneLine}
${SITE.phone} · triplejmetaltx.com
Built right, built fast, built by Triple J.
`.trim()

export { BRAND_COLOR, BRAND_DARK, DISPLAY_FONT, INK_900, LOGO_URL, SLATE }

/* ── Styles (inlined object form per react-email convention) ───────── */

const body = {
  margin: 0,
  padding: '24px 0',
  backgroundColor: '#f4f6f8',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
}

const container = {
  maxWidth: '620px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  overflow: 'hidden',
  border: '1px solid #c9d3dc',
  boxShadow: '0 4px 24px rgba(0, 24, 42, 0.06)',
}

const header = {
  backgroundColor: INK_900,
  padding: '22px 26px',
}

const brandWordmark = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 900,
  letterSpacing: '0.01em',
  lineHeight: 1.1,
  margin: 0,
  fontFamily: DISPLAY_FONT,
}

const headerPhone = {
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 700,
  textDecoration: 'none',
  fontVariantNumeric: 'tabular-nums' as const,
}

const headerHours = {
  color: STEEL_LIGHT,
  fontSize: '11px',
  margin: '4px 0 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
}

const accentStripe = {
  height: '3px',
  backgroundColor: STEEL,
  fontSize: 0,
  lineHeight: 0,
}

const bodySection = {
  padding: '32px 30px 26px',
  color: '#24384b',
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
  fontSize: '15px',
  fontWeight: 700,
  fontFamily: DISPLAY_FONT,
  margin: 0,
  letterSpacing: '0.01em',
}

const footerFamily = {
  color: STEEL_LIGHT,
  fontSize: '11px',
  margin: '4px 0 0',
}

const footerDivider = {
  borderColor: 'rgba(201, 211, 220, 0.2)',
  margin: '16px auto',
  width: '40%',
}

const footerTagline = {
  color: STEEL_LIGHT,
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.18em',
  margin: 0,
}

const footerNap = {
  color: STEEL_LIGHT,
  fontSize: '11px',
  margin: '10px 0 0',
  lineHeight: 1.5,
}

const footerLink = {
  color: 'rgba(255, 255, 255, 0.85)',
  textDecoration: 'none',
  fontWeight: 600,
}
