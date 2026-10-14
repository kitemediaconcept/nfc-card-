import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DataStore } from '@/lib/data-store';
import PublicProfileCard from '@/components/card/PublicProfileCard';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ src?: string; cid?: string; preview?: string }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { preview } = await searchParams;
  let profile = await DataStore.getProfileBySlug(slug, true);

  if (!profile && preview) {
    try {
      profile = JSON.parse(Buffer.from(preview, 'base64url').toString('utf-8'));
    } catch {
      // Ignored
    }
  }

  if (!profile) {
    return {
      title: 'Profile Not Found | Smart NFC',
      description: 'The requested digital business profile could not be found.',
    };
  }

  const title = `${profile.full_name}${profile.title ? ` - ${profile.title}` : ''}`;
  const description = profile.bio || `Connect with ${profile.full_name} via NFC digital business card.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: profile.avatar_url ? [profile.avatar_url] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: profile.avatar_url ? [profile.avatar_url] : [],
    },
  };
}

export default async function PublicProfilePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { src, cid, preview } = await searchParams;

  let profile = await DataStore.getProfileBySlug(slug, true);

  if (!profile && preview) {
    try {
      profile = JSON.parse(Buffer.from(preview, 'base64url').toString('utf-8'));
    } catch {
      // Ignored
    }
  }

  if (!profile) {
    notFound();
  }

  // Record public visit event
  try {
    const source = src === 'nfc' ? 'nfc' : src === 'qr' ? 'qr' : 'direct';
    await DataStore.recordAnalyticsEvent({
      profile_id: profile.id,
      card_id: cid || null,
      event_type: source === 'nfc' ? 'nfc_visit' : source === 'qr' ? 'qr_visit' : 'view',
      source,
      user_agent: 'Server Visit',
    });
  } catch {
    // Non-blocking
  }

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-3 sm:p-6 md:p-8">
      <div className="w-full max-w-md">
        <PublicProfileCard profile={profile} cardId={cid} />
      </div>
    </main>
  );
}
