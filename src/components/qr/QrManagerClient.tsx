'use client';

import React, { useState, useEffect } from 'react';
import { BusinessProfileData } from '@/types';
import QRCode from 'qrcode';
import {
  Download,
  Share2,
  Copy,
  Check,
  ExternalLink,
  QrCode as QrIcon,
  Palette,
} from 'lucide-react';

interface QrManagerClientProps {
  profiles: BusinessProfileData[];
}

export default function QrManagerClient({ profiles }: QrManagerClientProps) {
  const [selectedProfileId, setSelectedProfileId] = useState(profiles[0]?.id || '');
  const [qrColor, setQrColor] = useState('#0f172a');
  const [qrSvg, setQrSvg] = useState<string>('');
  const [qrPngDataUrl, setQrPngDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId) || profiles[0] || null;

  const publicUrl = selectedProfile
    ? typeof window !== 'undefined'
      ? `${window.location.origin}/p/${selectedProfile.slug}?src=qr`
      : `/p/${selectedProfile.slug}?src=qr`
    : '';

  useEffect(() => {
    if (!publicUrl) return;

    // Generate SVG
    QRCode.toString(publicUrl, {
      type: 'svg',
      margin: 2,
      color: { dark: qrColor, light: '#ffffff' },
    }).then(setQrSvg).catch(console.error);

    // Generate High-Res PNG Data URL
    QRCode.toDataURL(publicUrl, {
      width: 1024,
      margin: 2,
      color: { dark: qrColor, light: '#ffffff' },
    }).then(setQrPngDataUrl).catch(console.error);
  }, [publicUrl, qrColor]);

  const handleDownloadPng = () => {
    if (!qrPngDataUrl) return;
    const a = document.createElement('a');
    a.href = qrPngDataUrl;
    a.download = `${selectedProfile?.slug || 'profile'}-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadSvg = () => {
    if (!qrSvg) return;
    const blob = new Blob([qrSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedProfile?.slug || 'profile'}-qr.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyLink = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share && selectedProfile) {
      try {
        await navigator.share({
          title: selectedProfile.full_name,
          text: `Connect with ${selectedProfile.full_name}`,
          url: publicUrl,
        });
      } catch {
        // Fallback
      }
    } else {
      handleCopyLink();
    }
  };

  if (!selectedProfile) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
        <p className="text-slate-500 text-sm">No profiles found. Please create a profile first.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      {/* Settings / Selection */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Select Profile
          </label>
          <select
            value={selectedProfileId}
            onChange={(e) => setSelectedProfileId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name} (/p/{p.slug})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-slate-500" />
            <span>QR Foreground Color</span>
          </label>
          <div className="flex items-center gap-3">
            {[
              { label: 'Navy', hex: '#0f172a' },
              { label: 'Blue', hex: '#2563eb' },
              { label: 'Emerald', hex: '#059669' },
              { label: 'Purple', hex: '#7c3aed' },
              { label: 'Burgundy', hex: '#881337' },
            ].map((col) => (
              <button
                key={col.hex}
                type="button"
                onClick={() => setQrColor(col.hex)}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                  qrColor === col.hex ? 'ring-2 ring-blue-500 ring-offset-2 scale-105' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: col.hex }}
                title={col.label}
              >
                {qrColor === col.hex && <Check className="w-4 h-4 text-white" />}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 space-y-3">
          <div className="text-xs text-slate-500">
            Profile Link with QR attribution tracking:
          </div>
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-mono text-slate-700 truncate">{publicUrl}</span>
            <button
              onClick={handleCopyLink}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs flex items-center gap-1 shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleDownloadPng}
            className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG (1024px)</span>
          </button>

          <button
            onClick={handleDownloadSvg}
            className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download Vector SVG</span>
          </button>
        </div>
      </div>

      {/* QR Code Preview Canvas */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm flex flex-col items-center justify-center text-center">
        <div className="w-64 h-64 p-4 rounded-2xl bg-white border-2 border-slate-100 shadow-xl flex items-center justify-center mb-6 [&>svg]:w-full [&>svg]:h-full">
          {qrSvg ? (
            <div dangerouslySetInnerHTML={{ __html: qrSvg }} className="w-full h-full" />
          ) : (
            <QrIcon className="w-16 h-16 text-slate-300" />
          )}
        </div>

        <h3 className="font-bold text-slate-900 text-base">{selectedProfile.full_name}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{selectedProfile.title || 'Digital Card'}</p>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleShare}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Link</span>
          </button>
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Profile</span>
          </a>
        </div>
      </div>
    </div>
  );
}
