import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/data-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile_id, card_id, event_type, event_metadata } = body;

    if (!profile_id || !event_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const recorded = await DataStore.recordAnalyticsEvent({
      profile_id,
      card_id: card_id || null,
      event_type,
      source: card_id ? 'nfc' : 'direct',
      event_metadata,
      user_agent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ success: true, id: recorded.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error logging analytics';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
