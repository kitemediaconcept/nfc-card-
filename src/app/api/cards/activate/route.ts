import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { DataStore } from '@/lib/data-store';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to activate your card.' }, { status: 401 });
    }

    const body = await request.json();
    const { activationCode, profileId } = body;

    if (!activationCode || typeof activationCode !== 'string') {
      return NextResponse.json({ error: 'Activation code is required.' }, { status: 400 });
    }

    if (!profileId || typeof profileId !== 'string') {
      return NextResponse.json({ error: 'Please select a profile to assign to this card.' }, { status: 400 });
    }

    // Atomic activation execution
    const result = await DataStore.activateCard(activationCode, user.id, profileId);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Activation failed' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      card: result.card,
      message: 'Card successfully claimed and linked to your profile!',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
