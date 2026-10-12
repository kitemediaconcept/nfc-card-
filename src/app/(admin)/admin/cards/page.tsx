import { requireAdmin } from '@/lib/auth';
import { DataStore } from '@/lib/data-store';
import AdminCardsClient from '@/components/admin/AdminCardsClient';

export default async function AdminCardsPage() {
  await requireAdmin();
  const cards = await DataStore.getAdminCards();

  return (
    <div className="space-y-6">
      <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            NFC Card Minting & Inventory
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Mint physical cards, generate cryptographic activation codes, export CSV batches, and manage card states.
          </p>
        </div>
      </div>

      <AdminCardsClient initialCards={cards} />
    </div>
  );
}
