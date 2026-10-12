'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BusinessProfileData, NfcCard } from '@/types';
import confetti from 'canvas-confetti';
import {
  Radio,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';

interface ActivateCardClientProps {
  profiles: BusinessProfileData[];
}

export default function ActivateCardClient({ profiles }: ActivateCardClientProps) {
  const router = useRouter();
  const [activationCode, setActivationCode] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState(profiles[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claimedCard, setClaimedCard] = useState<NfcCard | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!activationCode.trim()) {
      setError('Please enter your card activation code.');
      return;
    }

    if (!selectedProfileId) {
      setError('Please select or create a profile to assign to this card.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/cards/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activationCode: activationCode.trim(),
          profileId: selectedProfileId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Activation failed.');
      }

      setClaimedCard(data.card);
      // Fire celebration confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Ignored if confetti unavailable
      }
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoCode = () => {
    setActivationCode('ACTV-4739-M2W8');
  };

  if (claimedCard) {
    const cardUrl = `/c/${claimedCard.card_token}`;
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl text-center animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
          Card Activated Successfully!
        </h2>
        <p className="text-slate-500 text-xs max-w-md mx-auto mb-6">
          Your physical NFC card is now claimed and linked to your digital business profile.
        </p>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left mb-6 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Card Label:</span>
            <span className="font-semibold text-slate-900">{claimedCard.card_label || 'Smart NFC Card'}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Card Token:</span>
            <span className="font-mono text-slate-800">{claimedCard.card_token}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Status:</span>
            <span className="text-emerald-700 font-bold uppercase text-[10px] bg-emerald-100 px-2 py-0.5 rounded-full">
              Active
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <a
            href={cardUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <span>Test Permanent NFC Redirect</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <Link
            href="/dashboard/cards"
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs flex items-center justify-center transition-colors"
          >
            Return to My Cards
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Single-Use Activation Code <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={activationCode}
              onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
              placeholder="e.g. ACTV-XXXX-XXXX"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Found on the card carrier, packaging insert, or email confirmation.
          </p>

          {/* Quick test code helper button */}
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={handleFillDemoCode}
              className="text-[11px] text-blue-600 hover:text-blue-700 font-medium bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Use Pre-Minted Test Code (ACTV-4739-M2W8)</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Assign to Profile <span className="text-rose-500">*</span>
          </label>
          {profiles.length === 0 ? (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              You must create a business profile first before activating a card.{' '}
              <Link href="/onboarding" className="font-bold underline">
                Create Profile
              </Link>
            </div>
          ) : (
            <select
              value={selectedProfileId}
              onChange={(e) => setSelectedProfileId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.title || 'Digital Card'} - /p/{p.slug})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || profiles.length === 0}
            className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <Radio className="w-4 h-4" />
            <span>{loading ? 'Verifying & Claiming...' : 'Claim & Activate Card'}</span>
          </button>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Single-use cryptographic hash verification</span>
        </div>
      </form>
    </div>
  );
}
