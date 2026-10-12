'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NfcCard, BusinessProfileData } from '@/types';
import {
  CreditCard,
  Radio,
  ExternalLink,
  Copy,
  Check,
  Power,
  RefreshCw,
  HelpCircle,
  Smartphone,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

interface CardsManagerClientProps {
  initialCards: NfcCard[];
  profiles: BusinessProfileData[];
}

export default function CardsManagerClient({ initialCards, profiles }: CardsManagerClientProps) {
  const router = useRouter();
  const [cards, setCards] = useState<NfcCard[]>(initialCards);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [reassignCard, setReassignCard] = useState<NfcCard | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  const [showNfcHelp, setShowNfcHelp] = useState(false);
  const [nfcWriteStatus, setNfcWriteStatus] = useState<{ cardId: string; status: string } | null>(null);

  const handleCopyCardUrl = (token: string, cardId: string) => {
    const url = `${window.location.origin}/c/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(cardId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleStatus = async (card: NfcCard) => {
    const nextStatus = card.status === 'active' ? 'disabled' : 'active';
    try {
      const res = await fetch('/api/cards', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: card.id,
          status: nextStatus,
        }),
      });
      if (res.ok) {
        setCards((prev) =>
          prev.map((c) => (c.id === card.id ? { ...c, status: nextStatus } : c))
        );
        router.refresh();
      }
    } catch {
      // Ignored
    }
  };

  const handleReassignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignCard || !selectedProfileId) return;

    setUpdating(true);
    try {
      const res = await fetch('/api/cards', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: reassignCard.id,
          assignedProfileId: selectedProfileId,
        }),
      });
      const data = await res.json();
      if (res.ok && data.card) {
        setCards((prev) =>
          prev.map((c) => (c.id === reassignCard.id ? data.card : c))
        );
        setReassignCard(null);
        router.refresh();
      }
    } catch {
      // Ignored
    } finally {
      setUpdating(false);
    }
  };

  // Web NFC direct writing (works on Chrome for Android)
  const handleWebNfcWrite = async (card: NfcCard) => {
    const targetUrl = `${window.location.origin}/c/${card.card_token}`;
    if (!('NDEFReader' in window)) {
      alert(
        'Direct Web NFC is only supported on Android Chrome. Please use an external NFC writer app such as "NFC Tools" (free on iOS & Android) to write the URL to your chip.'
      );
      return;
    }

    try {
      setNfcWriteStatus({ cardId: card.id, status: 'Ready: Tap card to back of phone...' });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ndef = new (window as any).NDEFReader();
      await ndef.write({
        records: [{ recordType: 'url', data: targetUrl }],
      });
      setNfcWriteStatus({ cardId: card.id, status: 'Success! Card written successfully.' });
      setTimeout(() => setNfcWriteStatus(null), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'NFC Write Failed';
      setNfcWriteStatus({ cardId: card.id, status: `Error: ${msg}` });
      setTimeout(() => setNfcWriteStatus(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Activate CTA & Help */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Claimed Cards ({cards.length})
          </span>
          <button
            onClick={() => setShowNfcHelp(true)}
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>NFC Programming Guide</span>
          </button>
        </div>

        <Link
          href="/dashboard/cards/activate"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
        >
          <Radio className="w-4 h-4" />
          <span>Activate Another Card</span>
        </Link>
      </div>

      {cards.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <CreditCard className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 text-lg">No Cards Claimed</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            You haven't activated any physical NFC smart cards yet. Use the activation code printed with your card to claim it.
          </p>
          <Link
            href="/dashboard/cards/activate"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-sm"
          >
            <Radio className="w-4 h-4" />
            <span>Activate Card</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((card) => {
            const cardUrl = typeof window !== 'undefined' ? `${window.location.origin}/c/${card.card_token}` : `/c/${card.card_token}`;
            const isActive = card.status === 'active';

            return (
              <div
                key={card.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2.5 rounded-2xl ${isActive ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">
                          {card.card_label || 'Smart NFC Card'}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-mono">
                          Token: {card.card_token}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {card.status}
                    </span>
                  </div>

                  {/* Permanent NFC Card URL */}
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 mb-4">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span className="font-semibold uppercase text-[10px] tracking-wider">Permanent Tap URL</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">Zero-Rewrite</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-medium text-slate-800 truncate">
                        {cardUrl}
                      </span>
                      <button
                        onClick={() => handleCopyCardUrl(card.card_token, card.id)}
                        className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs flex items-center gap-1 shrink-0"
                        title="Copy permanent card URL"
                      >
                        {copiedId === card.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === card.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Currently Assigned Profile */}
                  <div className="mb-4">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Current Target Profile:
                    </div>
                    {card.assigned_profile ? (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {card.assigned_profile.full_name}
                          </p>
                          <p className="text-[11px] text-blue-600">
                            /p/{card.assigned_profile.slug}
                          </p>
                        </div>
                        <Link
                          href={`/p/${card.assigned_profile.slug}`}
                          target="_blank"
                          className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                        No profile assigned currently. Tapping will show unassigned guidance.
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Controls */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setReassignCard(card);
                        setSelectedProfileId(card.assigned_profile_id || (profiles[0]?.id || ''));
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Reassign</span>
                    </button>

                    <button
                      onClick={() => handleWebNfcWrite(card)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Write URL directly to NFC tag via browser"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                      <span>Write Chip</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(card)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      isActive
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{isActive ? 'Disable Card' : 'Enable Card'}</span>
                  </button>
                </div>

                {/* NFC writing status indicator */}
                {nfcWriteStatus && nfcWriteStatus.cardId === card.id && (
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-900 text-white text-xs font-medium animate-pulse">
                    {nfcWriteStatus.status}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reassign Profile Modal */}
      {reassignCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Reassign NFC Card</h3>
            <p className="text-xs text-slate-500 mb-4">
              Select which digital profile this physical card will redirect visitors to when tapped.
            </p>

            <form onSubmit={handleReassignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Card Token
                </label>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600">
                  {reassignCard.card_token} ({reassignCard.card_label || 'Physical Card'})
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Profile
                </label>
                <select
                  value={selectedProfileId}
                  onChange={(e) => setSelectedProfileId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} (/p/{p.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReassignCard(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Confirm Reassignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NFC Programming Guide Modal */}
      {showNfcHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Radio className="w-5 h-5 text-blue-600" />
              <span>NFC Card Writing Guide</span>
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              How to program your permanent card URL to any standard NFC chip (NTAG213 / NTAG215 / NTAG216).
            </p>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 space-y-1.5">
                <p className="font-bold text-blue-900">Why write the permanent URL once?</p>
                <p className="text-blue-800 leading-relaxed">
                  Your physical card URL is formatted as <code className="bg-white px-1 py-0.5 rounded font-mono text-[11px]">https://yourdomain.com/c/token</code>.
                  Because it redirects server-side, you can change usernames, edit info, or reassign profiles anytime without ever re-writing the physical chip!
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900">Step-by-Step with "NFC Tools" (iOS & Android):</h4>
                <ol className="list-decimal pl-5 space-y-1.5 text-slate-600">
                  <li>Download the free <strong>NFC Tools</strong> app from the App Store or Google Play.</li>
                  <li>In this dashboard, copy your card&apos;s <strong>Permanent Tap URL</strong>.</li>
                  <li>In NFC Tools, select <strong>Write</strong> &rarr; <strong>Add a record</strong>.</li>
                  <li>Choose <strong>URL / URI</strong> and paste your card URL.</li>
                  <li>Tap <strong>Write / 1 Record</strong> and hold your physical card to the top/back of your phone until it confirms with a checkmark.</li>
                </ol>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500">
                <strong>Direct Browser Writing:</strong> If you are using Google Chrome on an NFC-enabled Android phone, you can also click the <strong>&quot;Write Chip&quot;</strong> button directly on any card card above.
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowNfcHelp(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
