import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { DataStore } from '@/lib/data-store';
import { Plus, User, ExternalLink, Edit3, Trash2, Globe, Shield } from 'lucide-react';
import ProfileListClient from '@/components/profile/ProfileListClient';

export default async function MyProfilesPage() {
  const user = await requireAuth();
  const profiles = await DataStore.getUserProfiles(user.id);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Digital Profiles</h1>
          <p className="text-sm text-slate-500 mt-1">
            Create, manage, and customize multiple personal and executive profiles.
          </p>
        </div>
      </div>

      <ProfileListClient initialProfiles={profiles} />
    </div>
  );
}
