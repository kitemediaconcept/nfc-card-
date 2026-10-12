'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NfcCard } from '@/types';
import {
  CreditCard,
  Plus,
  Download,
  Filter,
  Check,
  Copy,
  ExternalLink,
  ShieldAlert,
  RotateCcw,
  Power,
  Ban,
  Sparkles,
} from 'lucide-react';

interface AdminCardsClientProps {
  initialCards: NfcCard[];
}

export default function AdminCardsClient({ initialCards }: AdminCardsClientProps) {
  const router = useRouter();
  const [cards, setCards] = useState<NfcCard[]>(initialCards);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Minting Modals
  const [showSingleModal, setShowSingleModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);

  // Single card form
  const [singleLabel, setSingleLabel] = useState('');
  const [mintedSingle, setMintedSingle] = useState<{ card: NfcCard; activationCode: string } | null>(null);

  // Batch minting form
  const [batchCount, setBatchCount] = useState('10');
  const [batchPrefix, setBatchPrefix] = useState('Executive Card');
  const [mintedBatch, setMintedBatch] = useState<Array<{ card: NfcCard; activationCode: string }>>([]);
  const [minting, setMinting] = useState(false);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(id);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleCreateSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    setMinting(true);
    try {
      const res = await fetch('/api/admin/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'single', label: singleLabel }),
      });
      const data = await res.json();
      if (res.ok && data.card) {
        setCards((prev) => [data.card, ...prev]);
        setMintedSingle({ card: data.card, activationCode: data.activationCode });
        router.refresh();
      }
    } catch {
      // Ignored
    } finally {
      setMinting(false);
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setMinting(true);
    try {
      const res = await fetch('/api/admin/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'batch',
          count: batchCount,
          prefix: batchPrefix,
        }),
      });
      const data = await res.json();
      if (res.ok && data.items) {
        const newCards = data.items.map((i: { card: NfcCard }) => i.card);
        setCards((prev) => [...newCards, ...prev]);
        setMintedBatch(data.items);
        router.refresh();
      }
    } catch {
      // Ignored
    } finally {
      setMinting(false);
    }
  };

  const handleCardAction = async (cardId: string, action: 'disable' | 'enable' | 'revoke' | 'release') => {
    if (action === 'revoke' && !confirm('Are you sure you want to permanently revoke this card?')) return;
    if (action === 'release' && !confirm('Release this card? It will be unlinked from its current owner and returned to unclaimed inventory.')) return;

    try {
      const res = await fetch(`/api/admin/cards/${cardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok && data.card) {
        setCards((prev) => prev.map((c) => (c.id === cardId ? data.card : c)));
        router.refresh();
      }
    } catch {
      // Ignored
    }
  };

  const exportBatchCsv = (items: Array<{ card: NfcCard; activationCode: string }>) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://smartnfc.io';
    const rows = [
      ['Card Label', 'Card Token', 'Permanent URL', 'Activation Code', 'Status'],
      ...items.map((i) => [
        `"${i.card.card_label || ''}"`,
        i.card.card_token,
        `${origin}/c/${i.card.card_token}`,
        i.activationCode,
        i.card.status,
      ]),
    ];

    const csvContent = rows.map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nfc-batch-export-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const filteredCards = cards.filter((c) => {
    if (statusFilter === 'all') return true;
    return c.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          {['all', 'unclaimed', 'active', 'disabled', 'revoked'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                statusFilter === status
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Mint Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setSingleLabel('');
              setMintedSingle(null);
              setShowSingleModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Mint Single Card</span>
          </button>

          <button
            onClick={() => {
              setMintedBatch([]);
              setShowBatchModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Card Batch</span>
          </button>
        </div>
      </div>

      {/* Cards Table */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-4 px-6">Card Token & Label</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Owner</th>
                <th className="py-4 px-6">Assigned Profile</th>
                <th className="py-4 px-6">Permanent URL</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredCards.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">
                    No cards match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredCards.map((card) => {
                  return (
                    <tr key={card.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-white">{card.card_label || 'Smart NFC Card'}</div>
                        <div className="font-mono text-[11px] text-purple-400 mt-0.5">{card.card_token}</div>
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            card.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : card.status === 'unclaimed'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : card.status === 'disabled'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                          }`}
                        >
                          {card.status}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        {card.owner ? (
                          <div>
                            <div className="text-white font-medium">{card.owner.full_name}</div>
                            <div className="text-slate-400 text-[11px]">{card.owner.email}</div>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Unclaimed</span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        {card.assigned_profile ? (
                          <div>
                            <div className="text-white font-medium">{card.assigned_profile.full_name}</div>
                            <div className="text-purple-400 text-[11px]">/p/{card.assigned_profile.slug}</div>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">None</span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/c/${card.card_token}`}
                            target="_blank"
                            className="text-purple-400 hover:text-purple-300 font-mono text-[11px] flex items-center gap-1"
                          >
                            <span>/c/{card.card_token}</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                          <button
                            onClick={() => handleCopy(`/c/${card.card_token}`, card.id)}
                            className="p-1 text-slate-500 hover:text-slate-300"
                            title="Copy Token"
                          >
                            {copiedToken === card.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {card.status === 'active' && (
                            <button
                              onClick={() => handleCardAction(card.id, 'disable')}
                              className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                              title="Disable Card"
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {card.status === 'disabled' && (
                            <button
                              onClick={() => handleCardAction(card.id, 'enable')}
                              className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                              title="Enable Card"
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {card.owner_id && (
                            <button
                              onClick={() => handleCardAction(card.id, 'release')}
                              className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                              title="Release for Reassignment"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {card.status !== 'revoked' && (
                            <button
                              onClick={() => handleCardAction(card.id, 'revoke')}
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                              title="Revoke Card"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Single Card Mint Modal */}
      {showSingleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-slate-200">
            <h3 className="text-lg font-bold text-white mb-1">Mint Single NFC Smart Card</h3>
            <p className="text-xs text-slate-400 mb-4">
              Generates a new unique permanent card token and single-use activation code.
            </p>

            {mintedSingle ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Card Token:</span>
                    <span className="font-mono text-purple-400 font-bold">{mintedSingle.card.card_token}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Single-Use Code:</span>
                    <span className="font-mono text-emerald-400 font-bold tracking-wider">{mintedSingle.activationCode}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Permanent URL:</span>
                    <span className="font-mono text-blue-400 truncate max-w-[200px]">/c/{mintedSingle.card.card_token}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                  <strong>Important:</strong> Copy or record this activation code now. It is stored securely in the database as a cryptographic hash.
                </div>

                <button
                  type="button"
                  onClick={() => setShowSingleModal(false)}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateSingle} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Card Label / Name</label>
                  <input
                    type="text"
                    required
                    value={singleLabel}
                    onChange={(e) => setSingleLabel(e.target.value)}
                    placeholder="e.g. Matte Black Executive #201"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSingleModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={minting}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md disabled:opacity-50"
                  >
                    {minting ? 'Minting...' : 'Mint Card'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Batch Mint Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl text-slate-200">
            <h3 className="text-lg font-bold text-white mb-1">Generate NFC Card Batch</h3>
            <p className="text-xs text-slate-400 mb-4">
              Mint up to 100 cards simultaneously with sequential labels and single-use codes.
            </p>

            {mintedBatch.length > 0 ? (
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center justify-between">
                  <span>Successfully minted {mintedBatch.length} physical cards!</span>
                  <button
                    onClick={() => exportBatchCsv(mintedBatch)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV Export</span>
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-800 divide-y divide-slate-800 bg-slate-950 p-2 text-xs">
                  {mintedBatch.map((item) => (
                    <div key={item.card.id} className="py-1.5 px-2 flex justify-between items-center">
                      <span className="font-semibold text-white">{item.card.card_label}</span>
                      <span className="font-mono text-purple-400">{item.card.card_token}</span>
                      <span className="font-mono text-emerald-400 font-bold">{item.activationCode}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateBatch} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Batch Label Prefix</label>
                  <input
                    type="text"
                    required
                    value={batchPrefix}
                    onChange={(e) => setBatchPrefix(e.target.value)}
                    placeholder="e.g. Bamboo NFC Card 2026 Batch"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Quantity (1 - 100)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={batchCount}
                    onChange={(e) => setBatchCount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBatchModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={minting}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md disabled:opacity-50"
                  >
                    {minting ? 'Generating Batch...' : 'Generate Batch'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
