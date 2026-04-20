import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const patchSchema = z.object({
  status: z.enum(['new', 'called', 'qualified', 'junk', 'won', 'lost']).optional(),
  notes: z.string().max(5000).optional(),
  mark_called: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (parsed.data.status !== undefined) update.status = parsed.data.status;
  if (parsed.data.notes !== undefined) update.notes = parsed.data.notes;
  if (parsed.data.mark_called) {
    update.called_at = new Date().toISOString();
    update.called_by = user.id;
    if (parsed.data.status === undefined) update.status = 'called';
  }

  const { data, error } = await getAdminClient()
    .from('permit_leads')
    .update(update)
    .eq('id', id)
    .select('id, status, notes, called_at')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Permit lead not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}
