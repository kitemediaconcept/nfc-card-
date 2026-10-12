import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { DataStore } from '@/lib/data-store';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const cards = await DataStore.getAdminCards(status);
    return NextResponse.json({ cards });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Forbidden';
    return NextResponse.json({ error: message }, { status: 403 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const { type, label, count, prefix } = body;

    if (type === 'batch') {
      const batchCount = Math.min(Math.max(parseInt(count || '10', 10), 1), 100);
      const batchPrefix = prefix?.trim() || 'NFC Smart Card Batch';
      const created = await DataStore.createAdminCardBatch(batchCount, batchPrefix, admin.id);
      return NextResponse.json({
        success: true,
        items: created,
        message: `Successfully minted ${batchCount} cards with unique activation codes.`,
      });
    }

    // Single card creation
    const cardLabel = label?.trim() || 'New NFC Smart Card';
    const single = await DataStore.createAdminCard(cardLabel, admin.id);
    return NextResponse.json({
      success: true,
      card: single.card,
      activationCode: single.activationCode,
      message: 'Card created successfully.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error creating cards';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
