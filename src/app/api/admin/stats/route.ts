import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { DataStore } from '@/lib/data-store';

export async function GET() {
  try {
    await requireAdmin();
    const stats = await DataStore.getAdminStats();
    return NextResponse.json({ stats });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Forbidden';
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
