import { requireAuth } from '@/lib/auth';
import { DataStore } from '@/lib/data-store';
import CardsManagerClient from '@/components/cards/CardsManagerClient';

export default async function MyCardsPage() {
  const user = await requireAuth();
  const cards = await DataStore.getUserCards(user.id);
  const profiles = await DataStore.getUserProfiles(user.id);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Physical NFC Cards</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your physical smart cards, permanent tap URLs, profile assignments, and security toggles.
          </p>
        </div>
      </div>

      <CardsManagerClient initialCards={cards} profiles={profiles} />
    </div>
  );
}
