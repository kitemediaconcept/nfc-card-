import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { DataStore } from '@/lib/data-store';

export async function GET() {
  try {
    await requireAdmin();
    const logs = await DataStore.getAdminAuditLogs();
    return NextResponse.json({ logs });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Forbidden';
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
