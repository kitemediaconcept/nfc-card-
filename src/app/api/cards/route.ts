import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { DataStore } from '@/lib/data-store';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cards = await DataStore.getUserCards(user.id);
  return NextResponse.json({ cards });
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { cardId, assignedProfileId, status } = body;

    if (!cardId) {
      return NextResponse.json({ error: 'Card ID is required' }, { status: 400 });
    }

    const updated = await DataStore.updateCardAssignment(
      cardId,
      user.id,
      assignedProfileId !== undefined ? assignedProfileId : null,
      status
    );

    return NextResponse.json({ success: true, card: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error updating card';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
