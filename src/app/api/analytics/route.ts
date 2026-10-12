import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { DataStore } from '@/lib/data-store';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get('profileId') || undefined;
  const cardId = searchParams.get('cardId') || undefined;
  const days = searchParams.get('days') ? parseInt(searchParams.get('days')!, 10) : 30;
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;

  // Verify profile belongs to user if specified
  if (profileId) {
    const profile = await DataStore.getProfileById(profileId, user.id);
    if (!profile && user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized profile access' }, { status: 403 });
    }
  }

  const data = await DataStore.getAnalytics({
    profileId,
    cardId,
    days,
    startDate,
    endDate,
  });

  return NextResponse.json(data);
}
