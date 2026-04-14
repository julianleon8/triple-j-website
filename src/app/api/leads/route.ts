import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

const resend = new Resend(process.env.RESEND_API_KEY)

const leadSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(10).max(20),
  email: z.string().email().optional().or(z.literal('')),
  city: z.string().max(100).optional(),
  service_type: z.enum(['carport', 'garage', 'barn', 'other']).default('carport'),
  structure_type: z.enum(['welded', 'bolted', 'unsure']).optional(),
  message: z.string().max(1000).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = leadSchema.parse(body)

    const { data: lead, error } = await getAdminClient()
      .from('leads')
      .insert({ ...data, source: 'website_form' })
      .select()
      .single()

    if (error) throw error

    // Alert owner immediately
    await resend.emails.send({
      from: 'Triple J Metal <leads@triplejmetal.com>',
      to: process.env.OWNER_EMAIL!.split(','),
      subject: `🔔 New Lead: ${data.name} — ${data.city || 'TX'} — ${data.service_type}`,
      html: `
        <div style="font-family:sans-serif;max-width:500px">
          <h2 style="color:#d97706">New Lead — Triple J Metal</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:6px 0;font-weight:bold">Name</td><td>${data.name}</td></tr>
            <tr><td style="padding:6px 0;font-weight:bold">Phone</td><td><a href="tel:${data.phone}">${data.phone}</a></td></tr>
            ${data.email ? `<tr><td style="padding:6px 0;font-weight:bold">Email</td><td>${data.email}</td></tr>` : ''}
            <tr><td style="padding:6px 0;font-weight:bold">City</td><td>${data.city || 'Not provided'}</td></tr>
            <tr><td style="padding:6px 0;font-weight:bold">Service</td><td style="text-transform:capitalize">${data.service_type}</td></tr>
            <tr><td style="padding:6px 0;font-weight:bold">Type</td><td style="text-transform:capitalize">${data.structure_type || 'Not specified'}</td></tr>
            ${data.message ? `<tr><td style="padding:6px 0;font-weight:bold">Message</td><td>${data.message}</td></tr>` : ''}
          </table>
          <hr style="margin:16px 0"/>
          <p style="color:#6b7280;font-size:12px">Lead ID: ${lead.id}<br/>Submitted: ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} CST</p>
        </div>
      `,
    })

    // Confirm to customer if email provided
    if (data.email) {
      await resend.emails.send({
        from: 'Triple J Metal <no-reply@triplejmetal.com>',
        to: data.email,
        subject: 'We received your quote request — Triple J Metal LLC',
        html: `
          <div style="font-family:sans-serif;max-width:500px">
            <h2 style="color:#d97706">Thanks, ${data.name}!</h2>
            <p>We received your request for a <strong>${data.service_type}</strong> quote and will call you at <strong>${data.phone}</strong> shortly.</p>
            <p>Triple J Metal LLC is Central Texas's most affordable metal carport builder. We'll be in touch soon!</p>
            <p>— The Triple J Metal Team</p>
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
