import { Heading, Text, Section, Row, Column, Link } from '@react-email/components'
import BrandLayout, { BRAND_COLOR } from './BrandLayout'
import { napSignature } from './nap'
import type { BriefItem, MorningBrief } from '@/lib/jobs/morning-brief'

/**
 * The weekday morning brief (src/lib/jobs/morning-brief.ts). Two lists where
 * CronDigestOwnerAlert has one — what came in, and who is still waiting — so it
 * is its own template, built from the same pieces and styles.
 */
export default function MorningBriefEmail({ brief, hqHref }: { brief: MorningBrief; hqHref: string }) {
  return (
    <BrandLayout preview={`${brief.heading} — ${brief.subject}`}>
      <Heading as="h2" style={{ fontSize: 22, fontWeight: 700, margin: '6px 0 4px', color: '#00182a' }}>
        {brief.heading}
      </Heading>
      <Text style={{ fontSize: 13, color: '#546678', margin: '0 0 16px' }}>{brief.subhead}</Text>

      <ItemList
        title="Waiting on a first call — oldest first"
        items={brief.waitingItems}
        more={brief.waitingMore}
        empty="Nobody is waiting on a call."
      />
      <ItemList
        title={brief.newTitle}
        items={brief.newItems}
        more={brief.newMore}
        empty="No new leads."
      />

      {brief.draftCount > 0 && (
        <Text style={{ margin: '18px 0 0', fontSize: 13, color: '#33475a' }}>
          {brief.draftCount} {brief.draftCount === 1 ? 'captured call is' : 'captured calls are'} still a
          draft — finish {brief.draftCount === 1 ? 'it' : 'them'} in HQ → Leads.
        </Text>
      )}

      <Text style={{ margin: '18px 0 0' }}>
        <Link
          href={hqHref}
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
          Open HQ
        </Link>
      </Text>
    </BrandLayout>
  )
}

function ItemList({ title, items, more, empty }: { title: string; items: BriefItem[]; more: number; empty: string }) {
  return (
    <>
      <Text style={{ margin: '18px 0 6px', fontSize: 13, fontWeight: 700, color: '#00182a', textTransform: 'uppercase', letterSpacing: 0.3 }}>
        {title}
      </Text>
      {items.length === 0 ? (
        <Text style={{ margin: 0, fontSize: 13, color: '#546678' }}>{empty}</Text>
      ) : (
        <Section style={{ border: '1px solid #e3e9ee', borderRadius: 8, overflow: 'hidden' }}>
          {items.map((item, i) => (
            <Row key={item.href} style={{ background: i % 2 === 0 ? '#f4f6f8' : '#ffffff' }}>
              <Column style={{ padding: '10px 14px', fontSize: 13, color: '#00182a' }}>
                <Link href={item.href} style={{ color: BRAND_COLOR, fontWeight: 700 }}>
                  {item.primary}
                </Link>
                <span style={{ color: '#546678' }}> — {item.secondary}</span>
              </Column>
            </Row>
          ))}
        </Section>
      )}
      {more > 0 && (
        <Text style={{ margin: '8px 0 0', fontSize: 13, color: '#546678' }}>+ {more} more in HQ.</Text>
      )}
    </>
  )
}

export function morningBriefText(brief: MorningBrief, hqHref: string): string {
  const lines: string[] = [brief.heading, brief.subhead]
  const section = (title: string, items: BriefItem[], more: number, empty: string) => {
    lines.push('', title.toUpperCase())
    if (items.length === 0) lines.push(empty)
    for (const item of items) lines.push(`- ${item.primary} — ${item.secondary}`, `  ${item.href}`)
    if (more > 0) lines.push(`- + ${more} more in HQ.`)
  }
  section('Waiting on a first call — oldest first', brief.waitingItems, brief.waitingMore, 'Nobody is waiting on a call.')
  section(brief.newTitle, brief.newItems, brief.newMore, 'No new leads.')
  if (brief.draftCount > 0) {
    lines.push('', `${brief.draftCount} captured ${brief.draftCount === 1 ? 'call is' : 'calls are'} still a draft — finish in HQ → Leads.`)
  }
  lines.push('', `Open HQ: ${hqHref}`, '', '—', napSignature())
  return lines.join('\n')
}
