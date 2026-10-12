import Link from 'next/link';
import { Ban } from 'lucide-react';

export default function RevokedCardPage() {
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-800/80 border border-slate-700/80 rounded-3xl p-8 shadow-xl text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
          <Ban className="w-7 h-7" />
        </div>

        <h1 className="text-xl font-bold tracking-tight text-white mb-2">
          Card Revoked
        </h1>
        <p className="text-slate-400 text-xs leading-relaxed mb-6">
          This physical NFC smart card has been permanently decommissioned and revoked by platform administration.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center py-2.5 px-5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </main>
  );
}
