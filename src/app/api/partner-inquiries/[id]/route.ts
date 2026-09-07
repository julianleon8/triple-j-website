import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireOwner } from '@/lib/auth'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const patchSchema = z.object({
  status: z.enum(['new', 'contacted', 'engaged', 'declined']).optional(),
  notes:  z.string().max(5000).optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireOwner()
  if (denied) return denied

  const { id } = await params
  try {
    const body = await request.json()
    const data = patchSchema.parse(body)

    const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (data.status !== undefined) update.status = data.status
    if (data.notes !== undefined) update.notes = data.notes.trim() || null

    const { data: inquiry, error } = await getAdminClient()
      .from('partner_inquiries')
      .update(update)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ inquiry })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Partner inquiry update error:', error)
    return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireOwner()
  if (denied) return denied

  const { id } = await params
  const { error } = await getAdminClient().from('partner_inquiries').delete().eq('id', id)
  if (error) {
    console.error('Partner inquiry delete error:', error)
    return NextResponse.json({ error: 'Failed to delete inquiry' }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
