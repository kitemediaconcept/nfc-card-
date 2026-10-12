import Link from 'next/link';
import { CreditCard, AlertCircle } from 'lucide-react';

export default function UnassignedCardPage() {
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-800/80 border border-slate-700/80 rounded-3xl p-8 shadow-xl text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-7 h-7" />
        </div>

        <h1 className="text-xl font-bold tracking-tight text-white mb-2">
          Card Unassigned
        </h1>
        <p className="text-slate-400 text-xs leading-relaxed mb-6">
          This physical NFC card is active, but is not currently linked to a published profile. The owner can assign a profile via their customer dashboard.
        </p>

        <Link
          href="/dashboard/cards"
          className="inline-flex items-center justify-center py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-colors"
        >
          Manage Cards in Dashboard
        </Link>
      </div>
    </main>
  );
}
