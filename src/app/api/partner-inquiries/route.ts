import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import PartnerInquiryOwnerAlert, { partnerInquiryOwnerAlertText } from '@/emails/PartnerInquiryOwnerAlert'
import PartnerInquiryConfirmation, { partnerInquiryConfirmationText } from '@/emails/PartnerInquiryConfirmation'
import { sendPushBackground } from '@/lib/push'

export const dynamic = 'force-dynamic'

let _resend: Resend | null = null
function resend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

const COMPANY_TYPE_LABELS: Record<string, string> = {
  manufacturer: 'Manufacturer',
  supplier:     'Supplier',
  dealer:       'Dealer',
  gc:           'Commercial GC',
  developer:    'Property Developer',
  architect:    'Architect',
  other:        'Other',
}

const VOLUME_LABELS: Record<string, string> = {
  exploring:  'Just exploring',
  '1-5':      '1–5 jobs / year',
  '6-20':     '6–20 jobs / year',
  '20-50':    '20–50 jobs / year',
  '50+':      '50+ jobs / year',
}

const partnerInquirySchema = z.object({
  company_name:     z.string().min(2).max(150),
  company_type:     z.enum(['manufacturer', 'supplier', 'dealer', 'gc', 'developer', 'architect', 'other']),
  contact_name:     z.string().min(2).max(100),
  contact_role:     z.string().max(100).optional().or(z.literal('')),
  email:            z.string().email(),
  phone:            z.string().max(20).optional().or(z.literal('')),
  message:          z.string().min(10).max(2000),
  estimated_volume: z.enum(['exploring', '1-5', '6-20', '20-50', '50+']).optional().or(z.literal('')),
  referral_source:  z.string().max(200).optional().or(z.literal('')),
})

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: inquiries, error } = await getAdminClient()
    .from('partner_inquiries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 })
  return NextResponse.json({ inquiries })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = partnerInquirySchema.parse(body)

    const { data: inquiry, error } = await getAdminClient()
      .from('partner_inquiries')
      .insert({
        company_name:     data.company_name.trim(),
        company_type:     data.company_type,
        contact_name:     data.contact_name.trim(),
        contact_role:     data.contact_role?.trim() || null,
        email:            data.email.trim(),
        phone:            data.phone?.trim() || null,
        message:          data.message.trim(),
        estimated_volume: data.estimated_volume || null,
        referral_source:  data.referral_source?.trim() || null,
      })
      .select()
      .single()

    if (error) throw error

    const submittedAt = `${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} CST`
    const companyTypeLabel = COMPANY_TYPE_LABELS[data.company_type] ?? data.company_type
    const volumeLabel = data.estimated_volume ? VOLUME_LABELS[data.estimated_volume] ?? data.estimated_volume : null

    const ownerProps = {
      inquiryId:        inquiry.id,
      companyName:      data.company_name.trim(),
      companyType:      companyTypeLabel,
      contactName:      data.contact_name.trim(),
      contactRole:      data.contact_role?.trim() || null,
      email:            data.email.trim(),
      phone:            data.phone?.trim() || null,
      message:          data.message.trim(),
      estimatedVolume:  volumeLabel,
      referralSource:   data.referral_source?.trim() || null,
      submittedAt,
    }

    await resend().emails.send({
      from: 'Triple J Metal <leads@triplejmetaltx.com>',
      to: process.env.OWNER_EMAIL!.split(','),
      replyTo: data.email,
      subject: `🤝 Partner inquiry — ${data.company_name.trim()} (${companyTypeLabel})`,
      react: PartnerInquiryOwnerAlert(ownerProps),
      text: partnerInquiryOwnerAlertText(ownerProps),
      tags: [
        { name: 'inquiry_id', value: inquiry.id },
        { name: 'email_type', value: 'partner_inquiry_owner_alert' },
      ],
    })

    const confirmProps = {
      contactName: data.contact_name.trim(),
      companyName: data.company_name.trim(),
    }
    await resend().emails.send({
      from: 'Triple J Metal <no-reply@triplejmetaltx.com>',
      replyTo: 'julianleon@triplejmetaltx.com',
      to: data.email,
      subject: 'We got your partner inquiry — Triple J Metal',
      react: PartnerInquiryConfirmation(confirmProps),
      text: partnerInquiryConfirmationText(confirmProps),
      tags: [
        { name: 'inquiry_id', value: inquiry.id },
        { name: 'email_type', value: 'partner_inquiry_confirmation' },
      ],
    })

    sendPushBackground({
      title: '🤝 Partner inquiry',
      body: `${data.company_name.trim()} — ${companyTypeLabel}`,
      url: '/hq/partners',
      tag: `partner-inquiry-${inquiry.id}`,
    })

    return NextResponse.json({ success: true, id: inquiry.id })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Partner inquiry submission error:', error)
    return NextResponse.json({ error: 'Failed to submit partner inquiry' }, { status: 500 })
  }
}
