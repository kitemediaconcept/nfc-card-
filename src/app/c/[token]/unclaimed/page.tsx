import Link from 'next/navigation';
import { Smartphone, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function UnclaimedCardPage({ params }: PageProps) {
  const { token } = await params;

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800/80 border border-slate-700/80 rounded-3xl p-8 shadow-2xl backdrop-blur-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto mb-6">
          <Smartphone className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Physical Smart Card</span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          Card Ready for Activation
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-6">
          This physical NFC card has been minted and is ready to be linked to your digital business profile.
        </p>

        <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-700 text-left mb-6 space-y-3">
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            <p className="text-xs text-slate-300">
              Sign in or create your free account on the Smart NFC platform.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <p className="text-xs text-slate-300">
              Locate the single-use activation code from your packaging or delivery slip.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            <p className="text-xs text-slate-300">
              Enter the code in your dashboard to connect this card to your profile instantly.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <a
            href="/dashboard/cards/activate"
            className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.99]"
          >
            <span>Activate This Card</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <a
            href="/login"
            className="w-full py-3 px-4 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center justify-center transition-colors"
          >
            Sign in to Existing Account
          </a>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Card ID: {token.slice(0, 10)}•••</span>
        </div>
      </div>
    </main>
  );
}
