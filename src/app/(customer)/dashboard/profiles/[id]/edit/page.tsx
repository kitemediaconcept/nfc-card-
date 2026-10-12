import { notFound, redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { DataStore } from '@/lib/data-store';
import ProfileEditor from '@/components/profile/ProfileEditor';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProfilePage({ params }: PageProps) {
  const user = await requireAuth();
  const { id } = await params;

  const profile = await DataStore.getProfileById(id, user.id);

  if (!profile) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto">
      <ProfileEditor initialProfile={profile} />
    </div>
  );
}
