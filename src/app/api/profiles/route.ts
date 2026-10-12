import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { DataStore } from '@/lib/data-store';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profiles = await DataStore.getUserProfiles(user.id);
  return NextResponse.json({ profiles });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.full_name?.trim()) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }

    const created = await DataStore.createProfile(user.id, body);
    return NextResponse.json({ success: true, profile: created });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error creating profile';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
