'use client';

import React, { useState, useEffect } from 'react';
import { BusinessProfileData, NfcCard, AnalyticsEvent } from '@/types';
import {
  Eye,
  Radio,
  QrCode,
  Download,
  MousePointerClick,
  Calendar,
  Filter,
  BarChart2,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

interface AnalyticsClientProps {
  profiles: BusinessProfileData[];
  cards: NfcCard[];
}

interface AnalyticsData {
  totalViews: number;
  nfcVisits: number;
  qrVisits: number;
  vcfDownloads: number;
  contactClicks: number;
  totalEvents: number;
  dailyTrend: Array<{ date: string; views: number; nfc: number; qr: number; clicks: number }>;
  events: AnalyticsEvent[];
}

export default function AnalyticsClient({ profiles, cards }: AnalyticsClientProps) {
  const [selectedProfileId, setSelectedProfileId] = useState<string>('all');
  const [selectedCardId, setSelectedCardId] = useState<string>('all');
  const [dateRangeDays, setDateRangeDays] = useState<number>(30);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedProfileId !== 'all') params.append('profileId', selectedProfileId);
        if (selectedCardId !== 'all') params.append('cardId', selectedCardId);
        params.append('days', dateRangeDays.toString());

        const res = await fetch(`/api/analytics?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [selectedProfileId, selectedCardId, dateRangeDays]);

  const maxDailyViews = data?.dailyTrend
    ? Math.max(...data.dailyTrend.map((d) => d.views + d.nfc + d.qr), 1)
    : 1;

  return (
    <div className="space-y-6">
      {/* Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Profile Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Profile:</span>
            <select
              value={selectedProfileId}
              onChange={(e) => setSelectedProfileId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Profiles ({profiles.length})</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Card Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Card:</span>
            <select
              value={selectedCardId}
              onChange={(e) => setSelectedCardId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Cards ({cards.length})</option>
              {cards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.card_label || c.card_token}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          {[
            { label: 'Last 7 Days', days: 7 },
            { label: 'Last 30 Days', days: 30 },
            { label: 'Last 90 Days', days: 90 },
          ].map((item) => (
            <button
              key={item.days}
              onClick={() => setDateRangeDays(item.days)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                dateRangeDays === item.days
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Views</span>
            <Eye className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{loading ? '...' : data?.totalViews || 0}</div>
          <p className="text-[11px] text-slate-400 mt-1">Profile visits</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">NFC-Link Visits</span>
            <Radio className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{loading ? '...' : data?.nfcVisits || 0}</div>
          <p className="text-[11px] text-slate-400 mt-1">Via permanent card URLs</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">QR Code Visits</span>
            <QrCode className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{loading ? '...' : data?.qrVisits || 0}</div>
          <p className="text-[11px] text-slate-400 mt-1">Scanned QR links</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Save Contacts</span>
            <Download className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{loading ? '...' : data?.vcfDownloads || 0}</div>
          <p className="text-[11px] text-slate-400 mt-1">Downloaded .VCF files</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Action Clicks</span>
            <MousePointerClick className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{loading ? '...' : data?.contactClicks || 0}</div>
          <p className="text-[11px] text-slate-400 mt-1">Calls, WhatsApp, Emails</p>
        </div>
      </div>

      {/* Daily Visit Trend Chart */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Activity Over Time</h2>
            <p className="text-xs text-slate-500 mt-0.5">Daily breakdown of profile impressions and card interactions</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
              <span>Direct Views</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span>NFC-Link</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
              <span>QR Code</span>
            </span>
          </div>
        </div>

        {data?.dailyTrend && data.dailyTrend.length > 0 ? (
          <div className="h-48 flex items-end gap-1.5 sm:gap-2 pt-6">
            {data.dailyTrend.map((d) => {
              const totalDay = d.views + d.nfc + d.qr;
              const heightPercent = Math.max((totalDay / maxDailyViews) * 100, 4);

              return (
                <div
                  key={d.date}
                  className="flex-1 flex flex-col items-center justify-end h-full group relative"
                >
                  {/* Tooltip */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg pointer-events-none whitespace-nowrap z-20 shadow-lg">
                    {d.date}: {totalDay} visits ({d.nfc} NFC, {d.qr} QR)
                  </div>

                  {/* Stacked bar */}
                  <div
                    className="w-full max-w-[20px] rounded-t-md overflow-hidden bg-slate-100 flex flex-col justify-end transition-all group-hover:brightness-95"
                    style={{ height: `${heightPercent}%` }}
                  >
                    {d.nfc > 0 && <div className="bg-emerald-500 w-full" style={{ height: `${(d.nfc / totalDay) * 100}%` }} />}
                    {d.qr > 0 && <div className="bg-purple-500 w-full" style={{ height: `${(d.qr / totalDay) * 100}%` }} />}
                    {d.views > 0 && <div className="bg-blue-600 w-full" style={{ height: `${(d.views / totalDay) * 100}%` }} />}
                  </div>

                  <span className="text-[9px] text-slate-400 mt-2 truncate max-w-full hidden sm:block">
                    {d.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-slate-400 text-xs">
            No events recorded in this time range.
          </div>
        )}
      </div>

      {/* Recent Event Log Stream */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <span>Recent Activity Stream</span>
        </h2>

        {!data?.events || data.events.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No recent visitor actions recorded yet. Tap your NFC card or share your profile to see real-time events.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.events.slice(0, 15).map((evt) => (
              <div key={evt.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      evt.event_type.includes('nfc')
                        ? 'bg-emerald-50 text-emerald-700'
                        : evt.event_type.includes('qr')
                        ? 'bg-purple-50 text-purple-700'
                        : evt.event_type.includes('vcf')
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {evt.event_type.replace('_', ' ')}
                  </span>
                  <span className="text-slate-600 font-medium">
                    Source: <strong className="text-slate-800">{evt.source === 'nfc' ? 'NFC-link visit' : evt.source}</strong>
                  </span>
                </div>
                <span className="text-slate-400 text-[11px]">
                  {new Date(evt.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
