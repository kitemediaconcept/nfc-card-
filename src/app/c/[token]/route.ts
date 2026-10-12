import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/data-store';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  const card = await DataStore.getCardByToken(token);

  const baseUrl = request.nextUrl.origin;

  // 1. Invalid Card Token
  if (!card) {
    return NextResponse.redirect(new URL(`/c/${token}/invalid`, baseUrl), {
      status: 307,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  }

  // 2. Unclaimed Card (Show activation guide)
  if (card.status === 'unclaimed') {
    return NextResponse.redirect(new URL(`/c/${token}/unclaimed`, baseUrl), {
      status: 307,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  }

  // 3. Disabled Card (Show neutral unavailable page)
  if (card.status === 'disabled') {
    return NextResponse.redirect(new URL(`/c/${token}/disabled`, baseUrl), {
      status: 307,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  }

  // 4. Revoked Card
  if (card.status === 'revoked') {
    return NextResponse.redirect(new URL(`/c/${token}/revoked`, baseUrl), {
      status: 307,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  }

  // 5. Active Card with Assigned Profile
  if (card.status === 'active' && card.assigned_profile?.slug) {
    // Record NFC tap visit in analytics
    try {
      await DataStore.recordAnalyticsEvent({
        profile_id: card.assigned_profile.id,
        card_id: card.id,
        event_type: 'nfc_visit',
        source: 'nfc',
        user_agent: request.headers.get('user-agent') || 'NFC Tap',
      });
    } catch {
      // Non-blocking
    }

    // 307 Temporary Redirect with strict zero-cache headers
    return NextResponse.redirect(
      new URL(`/p/${card.assigned_profile.slug}?src=nfc&cid=${card.id}`, baseUrl),
      {
        status: 307,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  }

  // Active but unassigned
  return NextResponse.redirect(new URL(`/c/${token}/unassigned`, baseUrl), {
    status: 307,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    },
  });
}
