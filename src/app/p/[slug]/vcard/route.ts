import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/data-store';
import { generateVCard } from '@/lib/vcard';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  let profile = await DataStore.getProfileBySlug(slug, true);

  if (!profile) {
    const preview = request.nextUrl.searchParams.get('preview');
    if (preview) {
      try {
        profile = JSON.parse(Buffer.from(preview, 'base64url').toString('utf-8'));
      } catch {
        // Ignored
      }
    }
  }

  if (!profile) {
    return new NextResponse('Profile not found', { status: 404 });
  }

  // Record vCard download analytics
  try {
    await DataStore.recordAnalyticsEvent({
      profile_id: profile.id,
      card_id: null,
      event_type: 'vcf_download',
      source: 'direct',
    });
  } catch {
    // Non-blocking
  }

  const vCardContent = generateVCard(profile);

  return new NextResponse(vCardContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${profile.slug || 'contact'}.vcf"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
