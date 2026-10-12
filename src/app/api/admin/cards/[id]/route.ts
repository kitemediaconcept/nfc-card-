import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { DataStore } from '@/lib/data-store';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();
    const { action } = body;

    if (!['disable', 'enable', 'revoke', 'release'].includes(action)) {
      return NextResponse.json({ error: 'Invalid admin action' }, { status: 400 });
    }

    const updated = await DataStore.updateAdminCardStatus(id, action, admin.id);
    return NextResponse.json({ success: true, card: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error modifying card';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
