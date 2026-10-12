import { requireAuth } from '@/lib/auth';
import { DataStore } from '@/lib/data-store';
import ActivateCardClient from '@/components/cards/ActivateCardClient';

export default async function ActivateCardPage() {
  const user = await requireAuth();
  const profiles = await DataStore.getUserProfiles(user.id);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Activate Physical NFC Card</h1>
        <p className="text-sm text-slate-500 mt-1">
          Claim a new NFC card using its unique single-use activation code and assign it to your digital profile.
        </p>
      </div>

      <ActivateCardClient profiles={profiles} />
    </div>
  );
}
