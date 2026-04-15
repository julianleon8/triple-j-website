import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

const resend = new Resend(process.env.RESEND_API_KEY)

// Simple ZIP → city lookup for Bell / Coryell counties
const ZIP_CITIES: Record<string, string> = {
  '76501': 'Temple', '76502': 'Temple', '76503': 'Temple', '76504': 'Temple',
  '76508': 'Temple', '76511': 'Bartlett',
  '76513': 'Belton',
  '76522': 'Copperas Cove',
  '76527': 'Florence',
  '76534': 'Holland',
  '76541': 'Killeen', '76542': 'Killeen', '76543': 'Killeen', '76544': 'Killeen',
  '76548': 'Harker Heights',
  '76549': 'Killeen',
  '76554': 'Little River-Academy',
  '76557': 'Moody',
  '76571': 'Salado',
  '76578': 'Taylor',
  '76579': 'Troy',
}

function cityFromZip(zip: string): string {
  return ZIP_CITIES[zip?.trim()] ?? zip ?? 'Not provided'
}

function label(value: string | undefined, map: Record<string, string>, fallback = '—'): string {
  if (!value) return fallback
  return map[value] ?? value
}

const CONCRETE_LABELS: Record<string, string> = {
  yes: 'Yes — include concrete pad',
  already_have: 'Already have a slab',
  unsure: 'Not sure yet',
}
const SURFACE_LABELS: Record<string, string> = {
  dirt: 'Dirt / bare ground',
  gravel: 'Gravel',
  asphalt: 'Asphalt',
  concrete: 'Existing concrete',
}
const TIMELINE_LABELS: Record<string, string> = {
  asap: 'ASAP — under 48 hours',
  this_week: 'This week',
  this_month: 'This month',
  planning: 'Just planning ahead',
}

const leadSchema = z.object({
  // Step 1 — contact
  name:             z.string().min(2).max(100),
  phone:            z.string().min(10).max(20),
  email:            z.string().email().optional().or(z.literal('')),
  zip:              z.string().min(5).max(10).optional(),
  // Step 2 — project
  service_type:     z.enum(['carport', 'garage', 'barn', 'rv_cover', 'other']).default('carport'),
  structure_type:   z.enum(['welded', 'bolted', 'unsure']).optional(),
  width:            z.string().max(10).optional(),
  length:           z.string().max(10).optional(),
  height:           z.string().max(10).optional(),
  // Step 3 — qualification
  needs_concrete:   z.enum(['yes', 'already_have', 'unsure']).optional(),
  current_surface:  z.enum(['dirt', 'gravel', 'asphalt', 'concrete']).optional(),
  timeline:         z.enum(['asap', 'this_week', 'this_month', 'planning']).optional(),
  is_military:      z.boolean().default(false),
  message:          z.string().max(1000).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = leadSchema.parse(body)

    const city = cityFromZip(data.zip ?? '')
    const sizeLine = data.width && data.length
      ? `${data.width}W × ${data.length}L${data.height ? ` × ${data.height}H` : ''} ft`
      : null

    // Persist to Supabase
    const { data: lead, error } = await getAdminClient()
      .from('leads')
      .insert({
        name:            data.name,
        phone:           data.phone,
        email:           data.email || null,
        city,
        zip:             data.zip || null,
        service_type:    data.service_type,
        structure_type:  data.structure_type || null,
        needs_concrete:  data.needs_concrete || null,
        current_surface: data.current_surface || null,
        timeline:        data.timeline || null,
        is_military:     data.is_military,
        message:         [sizeLine, data.message?.trim()].filter(Boolean).join('\n\n') || null,
        source:          'website_form',
      })
      .select()
      .single()

    if (error) throw error

    // ── Owner alert ──────────────────────────────────────────────────────
    const urgencyBadge = data.timeline === 'asap'
      ? '<span style="background:#dc2626;color:#fff;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:bold">⚡ ASAP</span> '
      : data.timeline === 'this_week'
      ? '<span style="background:#d97706;color:#fff;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:bold">This Week</span> '
      : ''
    const militaryBadge = data.is_military
      ? '<span style="background:#1d4ed8;color:#fff;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:bold">⭐ Military/FR</span> '
      : ''

    await resend.emails.send({
      from: 'Triple J Metal <leads@triplejmetal.com>',
      to: process.env.OWNER_EMAIL!.split(','),
      subject: `🔔 New Lead: ${data.name} — ${city} — ${data.service_type}${data.is_military ? ' ⭐' : ''}${data.timeline === 'asap' ? ' ⚡' : ''}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px">
          <h2 style="color:#1e6bd6;margin-bottom:4px">New Lead — Triple J Metal</h2>
          <p style="margin:0 0 16px;color:#6b7280;font-size:13px">
            ${urgencyBadge}${militaryBadge}${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} CST
          </p>

          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr style="background:#f9fafb"><td style="padding:8px 12px;font-weight:600;width:140px">Name</td><td style="padding:8px 12px">${data.name}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:600">Phone</td><td style="padding:8px 12px"><a href="tel:${data.phone}" style="color:#1e6bd6;font-weight:bold;font-size:16px">${data.phone}</a></td></tr>
            ${data.email ? `<tr style="background:#f9fafb"><td style="padding:8px 12px;font-weight:600">Email</td><td style="padding:8px 12px">${data.email}</td></tr>` : ''}
            <tr ${data.email ? '' : 'style="background:#f9fafb"'}><td style="padding:8px 12px;font-weight:600">Location</td><td style="padding:8px 12px">${city}${data.zip ? ` (${data.zip})` : ''}</td></tr>
            <tr style="background:#f9fafb"><td style="padding:8px 12px;font-weight:600">Service</td><td style="padding:8px 12px;text-transform:capitalize">${data.service_type.replace('_', ' ')}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:600">Steel type</td><td style="padding:8px 12px;text-transform:capitalize">${data.structure_type || '—'}</td></tr>
            ${sizeLine ? `<tr style="background:#f9fafb"><td style="padding:8px 12px;font-weight:600">Size</td><td style="padding:8px 12px">${sizeLine}</td></tr>` : ''}
            <tr ${sizeLine ? '' : 'style="background:#f9fafb"'}><td style="padding:8px 12px;font-weight:600">Concrete pad?</td><td style="padding:8px 12px">${label(data.needs_concrete, CONCRETE_LABELS)}</td></tr>
            ${data.current_surface ? `<tr style="background:#f9fafb"><td style="padding:8px 12px;font-weight:600">Current surface</td><td style="padding:8px 12px">${label(data.current_surface, SURFACE_LABELS)}</td></tr>` : ''}
            <tr ${data.current_surface ? '' : 'style="background:#f9fafb"'}><td style="padding:8px 12px;font-weight:600">Timeline</td><td style="padding:8px 12px">${label(data.timeline, TIMELINE_LABELS)}</td></tr>
            <tr style="background:#f9fafb"><td style="padding:8px 12px;font-weight:600">Military/FR</td><td style="padding:8px 12px">${data.is_military ? '✅ Yes — apply discount' : 'No'}</td></tr>
            ${data.message ? `<tr><td style="padding:8px 12px;font-weight:600;vertical-align:top">Notes</td><td style="padding:8px 12px">${data.message}</td></tr>` : ''}
          </table>

          <hr style="margin:20px 0;border-color:#e5e7eb"/>
          <p style="color:#9ca3af;font-size:11px">Lead ID: ${lead.id}</p>
        </div>
      `,
    })

    // ── Customer confirmation ─────────────────────────────────────────────
    if (data.email) {
      await resend.emails.send({
        from: 'Triple J Metal <no-reply@triplejmetal.com>',
        to: data.email,
        subject: 'We got your quote request — Triple J Metal LLC',
        html: `
          <div style="font-family:sans-serif;max-width:500px">
            <h2 style="color:#1e6bd6">Thanks, ${data.name}!</h2>
            <p>We received your request for a <strong>${data.service_type.replace('_', ' ')}</strong> in <strong>${city}</strong>.</p>
            <p>A real person — usually Julian or Juan — will call you at <strong>${data.phone}</strong> within 24 hours with an honest quote.</p>
            ${data.is_military ? '<p style="background:#eff6ff;padding:12px;border-radius:6px">⭐ <strong>Military/First Responder discount noted.</strong> We appreciate your service.</p>' : ''}
            ${data.timeline === 'asap' ? '<p style="background:#fef2f2;padding:12px;border-radius:6px">⚡ <strong>ASAP request flagged.</strong> We\'ll prioritize your call back.</p>' : ''}
            <p style="margin-top:24px">— Juan & Julian, Triple J Metal LLC<br/>
            <a href="tel:254-346-7764" style="color:#1e6bd6">254-346-7764</a> · Temple, TX</p>
          </div>
        `,
      })
    }

    return NextResponse.json({ success: true, id: lead.id })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Lead submission error:', error)
    return NextResponse.json({ error: 'Failed to submit lead' }, { status: 500 })
  }
}

// PATCH /api/leads/[id] is handled in /api/leads/[id]/route.ts
