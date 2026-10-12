import { requireAuth } from '@/lib/auth';
import { DataStore } from '@/lib/data-store';
import AnalyticsClient from '@/components/analytics/AnalyticsClient';

export default async function AnalyticsPage() {
  const user = await requireAuth();
  const profiles = await DataStore.getUserProfiles(user.id);
  const cards = await DataStore.getUserCards(user.id);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Privacy-Conscious Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real visitor interactions, NFC-link redirects, QR scans, and contact downloads.
          </p>
        </div>
      </div>

      <AnalyticsClient profiles={profiles} cards={cards} />
    </div>
  );
}
