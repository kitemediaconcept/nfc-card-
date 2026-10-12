'use client';

import React, { useState, useRef } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import {
  User,
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  QrCode as QrIcon,
  Download,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Smartphone,
  Radio,
  RefreshCw,
  Palette,
  ArrowRight,
  ShieldCheck,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';
import { ThemeId } from '@/types';
import { SelectedPlanState } from '@/types/pricing';

interface CreatedCardData {
  profile: {
    id: string;
    slug: string;
    full_name: string;
    title?: string;
    company_name?: string;
    phone?: string;
    email?: string;
    theme: ThemeId;
  };
  card: {
    id: string;
    card_token: string;
    card_label: string;
  };
  permanentNfcUrl: string;
  profileUrl: string;
  activationCode: string;
}

interface QuickCustomerCardCreatorProps {
  selectedPlan: SelectedPlanState | null;
  onChangePlan?: () => void;
}

export default function QuickCustomerCardCreator({
  selectedPlan,
  onChangePlan,
}: QuickCustomerCardCreatorProps) {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [theme, setTheme] = useState<ThemeId>('modern-navy');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreatedCardData | null>(null);

  const [qrSvg, setQrSvg] = useState<string>('');
  const [qrPngDataUrl, setQrPngDataUrl] = useState<string>('');
  const [copiedNfcUrl, setCopiedNfcUrl] = useState(false);
  const [copiedProfileUrl, setCopiedProfileUrl] = useState(false);
  const [nfcWriteStatus, setNfcWriteStatus] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo must be less than 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please enter the customer name to generate your NFC card.');
      nameInputRef.current?.focus();
      nameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/quick-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          title: title.trim(),
          company_name: companyName.trim(),
          phone: phone.trim(),
          whatsapp: whatsapp.trim() || phone.trim(),
          email: email.trim(),
          website: website.trim(),
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          country: country.trim(),
          avatar_url: avatarUrl,
          theme,
          card_type: selectedPlan?.cardTitle || 'PVC CARD',
          plan_duration: selectedPlan?.tier.name || '1-Year Plan',
          plan_price: selectedPlan?.tier.discountedPrice || 1399,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create customer card.');
      }

      setResult(data);

      // Generate visual QR code for permanent NFC URL
      const svg = await QRCode.toString(data.permanentNfcUrl, {
        type: 'svg',
        margin: 2,
        color: { dark: '#484640', light: '#ffffff' },
      });
      setQrSvg(svg);

      const png = await QRCode.toDataURL(data.permanentNfcUrl, {
        width: 1024,
        margin: 2,
        color: { dark: '#484640', light: '#ffffff' },
      });
      setQrPngDataUrl(png);

      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#995b40', '#d5c5ac', '#8c7e74', '#45403e'],
        });
      } catch {
        // Ignored
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating card';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPng = () => {
    if (!qrPngDataUrl || !result) return;
    const a = document.createElement('a');
    a.href = qrPngDataUrl;
    a.download = `${result.profile.slug}-nfc-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadSvg = () => {
    if (!qrSvg || !result) return;
    const blob = new Blob([qrSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.profile.slug}-nfc-qr.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyNfcUrl = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.permanentNfcUrl);
    setCopiedNfcUrl(true);
    setTimeout(() => setCopiedNfcUrl(false), 2000);
  };

  const handleCopyProfileUrl = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.profileUrl);
    setCopiedProfileUrl(true);
    setTimeout(() => setCopiedProfileUrl(false), 2000);
  };

  const handleWebNfcWrite = async () => {
    if (!result) return;
    if (!('NDEFReader' in window)) {
      alert(
        'Direct Web NFC is supported in Chrome on Android. For other devices, copy the Permanent NFC URL and write it using the free "NFC Tools" app.'
      );
      return;
    }

    try {
      setNfcWriteStatus('Ready: Hold physical card to the back of phone...');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ndef = new (window as any).NDEFReader();
      await ndef.write({
        records: [{ recordType: 'url', data: result.permanentNfcUrl }],
      });
      setNfcWriteStatus('Success! Physical NFC Card written successfully.');
      setTimeout(() => setNfcWriteStatus(null), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Write failed';
      setNfcWriteStatus(`Error: ${msg}`);
      setTimeout(() => setNfcWriteStatus(null), 4000);
    }
  };

  const handleReset = () => {
    setResult(null);
    setFullName('');
    setTitle('');
    setCompanyName('');
    setPhone('');
    setWhatsapp('');
    setEmail('');
    setWebsite('');
    setStreet('');
    setCity('');
    setState('');
    setCountry('');
    setAvatarUrl('');
    setQrSvg('');
    setQrPngDataUrl('');
  };

  return (
    <div id="add-customer" className="w-full max-w-4xl mx-auto scroll-mt-24">
      {result ? (
        /* SUCCESS RESULT STATE: Shows Generated QR Code, Permanent NFC URL, and Downloads */
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#484640]/10 shadow-[0_20px_50px_rgba(84,66,54,0.08)] animate-in zoom-in-95 duration-200 text-[#484640]">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#f3ddd6] border border-[#e8bdb0] text-[#995b40] text-xs font-bold mb-4">
            <Check className="w-3.5 h-3.5" />
            <span>Customer Added & NFC Card Generated Successfully!</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left: QR Code Display & Downloads */}
            <div className="md:col-span-5 flex flex-col items-center text-center bg-[#faf7f3] p-6 rounded-3xl border border-[#484640]/10">
              <span className="text-xs font-bold text-[#89817b] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <QrIcon className="w-4 h-4 text-[#995b40]" />
                <span>NFC Permanent QR Code</span>
              </span>

              {/* The Visual QR Code Image */}
              <div className="w-56 h-56 p-3 rounded-2xl bg-white border border-[#484640]/10 shadow-sm flex items-center justify-center mb-4 [&>svg]:w-full [&>svg]:h-full">
                {qrSvg && <div dangerouslySetInnerHTML={{ __html: qrSvg }} className="w-full h-full" />}
              </div>

              <p className="text-xs text-[#89817b] font-medium mb-4">
                Scan with smartphone camera or link to physical card
              </p>

              {/* QR Download Buttons */}
              <div className="w-full grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  className="py-2.5 px-3 rounded-xl bg-[#995b40] hover:bg-[#814a33] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#995b40]/20 transition-all active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PNG</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  className="py-2.5 px-3 rounded-xl bg-[#484640] hover:bg-[#383632] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Vector SVG</span>
                </button>
              </div>
            </div>

            {/* Right: Card Details & URLs */}
            <div className="md:col-span-7 space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-[#484640] tracking-tight">
                  {result.profile.full_name}
                </h2>
                <p className="text-sm text-[#89817b] mt-0.5">
                  {result.profile.title || 'Digital Business Card'}{' '}
                  {result.profile.company_name ? `• ${result.profile.company_name}` : ''}
                </p>
              </div>

              {/* Permanent NFC URL Box */}
              <div className="p-4 rounded-2xl bg-[#f3ddd6]/40 border border-[#e8bdb0] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#995b40] uppercase tracking-wider flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5 text-[#995b40]" />
                    <span>Permanent NFC Card URL</span>
                  </span>
                  <span className="text-[10px] text-[#995b40] bg-[#faf7f3] border border-[#e8bdb0] font-bold px-2 py-0.5 rounded-full">
                    Active & Ready
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-[#e8bdb0]">
                  <span className="font-mono text-xs text-[#995b40] font-semibold truncate">
                    {result.permanentNfcUrl}
                  </span>
                  <button
                    onClick={handleCopyNfcUrl}
                    className="p-1.5 rounded-lg bg-[#faf7f3] hover:bg-[#f3ddd6] text-[#995b40] text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors"
                  >
                    {copiedNfcUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedNfcUrl ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#89817b]">
                  Write this URL to any standard NFC chip. You can update profile info anytime without ever rewriting the physical chip!
                </p>
              </div>

              {/* Public Profile URL */}
              <div className="p-4 rounded-2xl bg-[#faf7f3] border border-[#484640]/10 space-y-2">
                <span className="text-xs font-bold text-[#484640] uppercase tracking-wider flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-[#89817b]" />
                  <span>Public Web Profile URL</span>
                </span>
                <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-[#484640]/10">
                  <span className="font-mono text-xs text-[#484640] font-medium truncate">
                    {result.profileUrl}
                  </span>
                  <button
                    onClick={handleCopyProfileUrl}
                    className="p-1.5 rounded-lg bg-[#faf7f3] hover:bg-slate-100 text-[#484640] text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors"
                  >
                    {copiedProfileUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedProfileUrl ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons Hub */}
              <div className="pt-2 flex flex-wrap gap-2.5">
                <a
                  href={result.profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-[#995b40] hover:bg-[#814a33] text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-[#995b40]/20 transition-all active:scale-95"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Live Profile</span>
                </a>

                <a
                  href={`/p/${result.profile.slug}/vcard`}
                  className="px-4 py-2.5 rounded-xl bg-white border border-[#484640]/15 hover:bg-[#faf7f3] text-[#484640] font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .VCF Contact</span>
                </a>

                <button
                  type="button"
                  onClick={handleWebNfcWrite}
                  className="px-4 py-2.5 rounded-xl bg-[#484640] hover:bg-[#383632] text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Smartphone className="w-3.5 h-3.5 text-[#d5c5ac]" />
                  <span>Write to NFC Chip</span>
                </button>
              </div>

              {nfcWriteStatus && (
                <div className="p-3 rounded-xl bg-[#484640] text-white text-xs font-medium animate-pulse">
                  {nfcWriteStatus}
                </div>
              )}

              <div className="pt-3 border-t border-[#484640]/10 flex justify-between items-center">
                <span className="text-xs text-[#89817b]">
                  Card Token: <code className="font-mono text-[#484640]">{result.card.card_token}</code>
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-semibold text-[#995b40] hover:text-[#814a33] flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>+ Add Another Customer Card</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : !selectedPlan ? (
        /* GATED STATE: Show invitation to pick card plan first (Requirement: "താഴത്തെ ആ ഫോം തൽക്കാലം റിമൂവ് ചെയ്യണം") */
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#484640]/10 shadow-[0_20px_50px_rgba(84,66,54,0.06)] text-center max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#f3ddd6] text-[#995b40] mx-auto flex items-center justify-center mb-4 shadow-sm">
            <Sparkles className="w-7 h-7" />
          </div>
          <span className="text-[11px] font-bold tracking-[2.5px] uppercase text-[#995b40] bg-[#f3ddd6] px-3.5 py-1 rounded-full">
            Step 1 of 2
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#484640] tracking-tight mt-3 mb-2">
            Select Your Card & Plan First
          </h3>
          <p className="text-xs sm:text-sm text-[#89817b] leading-relaxed max-w-md mx-auto mb-6">
            Choose from the <strong>PVC Card</strong>, <strong>Eco-Friendly Wooden Card</strong>, or <strong>Premium Metal Card</strong> above to view pricing and unlock personalization.
          </p>
          <a
            href="#pricing-plans"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#484640] hover:bg-[#383632] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all active:scale-95"
          >
            <span>Choose Your Plan Above ↑</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      ) : (
        /* INPUT FORM STATE: Clean, User-Friendly & Minimal Luxury */
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#484640]/10 shadow-[0_20px_50px_rgba(84,66,54,0.06)] text-[#484640] animate-in fade-in slide-in-from-top-4 duration-300">
          {/* Selected Plan Summary Banner */}
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-zinc-950 text-white border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-sm sm:text-base text-white tracking-wide">
                    {selectedPlan.cardTitle}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500 text-black uppercase">
                    {selectedPlan.tier.name}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {selectedPlan.tier.features.join(' • ')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 self-end sm:self-center">
              <div className="text-right">
                <span className="block text-xs text-zinc-500 line-through font-mono">
                  <span className="currency-sym">₹</span>{selectedPlan.tier.originalPrice}
                </span>
                <span className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
                  <span className="currency-sym">₹</span>{selectedPlan.tier.discountedPrice}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onChangePlan) {
                    onChangePlan();
                  } else {
                    const el = document.getElementById('pricing-plans');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 transition-colors"
              >
                Change
              </button>
            </div>
          </div>

          <div className="mb-6 pb-4 border-b border-[#484640]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f3ddd6] text-[#995b40] text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Step 2: Personalize Your Business Card</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#484640]">
                Customer Information & Instant QR Setup
              </h2>
              <p className="text-xs sm:text-sm text-[#89817b] mt-1">
                Fill in the customer details below. The system will instantly generate the live profile, permanent NFC redirect URL, and high-res vector QR code.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Customer Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[#89817b] uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#995b40]" />
                <span>1. Personal & Company Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#484640] mb-1">
                    Customer Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    ref={nameInputRef}
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Mohammed Faisal"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#484640]/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#995b40] bg-[#faf7f3]/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#484640] mb-1">
                    Job Title / Designation
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Managing Director"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#484640]/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#995b40] bg-[#faf7f3]/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#484640] mb-1">
                    Company / Business Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Skyline Enterprises"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#484640]/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#995b40] bg-[#faf7f3]/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#484640] mb-1">
                    Profile Photo (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full text-xs text-[#89817b] file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#f3ddd6] file:text-[#995b40] hover:file:bg-[#e8bdb0]"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Contact Numbers & Links */}
            <div className="space-y-4 pt-4 border-t border-[#484640]/10">
              <h3 className="text-xs font-bold text-[#89817b] uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-[#995b40]" />
                <span>2. Contact Details & Social</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#484640] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#484640]/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#995b40] bg-[#faf7f3]/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#484640] mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+91 98765 43210 (or leave blank if same)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#484640]/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#995b40] bg-[#faf7f3]/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#484640] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@skyline.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#484640]/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#995b40] bg-[#faf7f3]/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#484640] mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://skyline.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#484640]/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#995b40] bg-[#faf7f3]/50"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Office Address */}
            <div className="space-y-4 pt-4 border-t border-[#484640]/10">
              <h3 className="text-xs font-bold text-[#89817b] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#995b40]" />
                <span>3. Location / Office Address</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#484640] mb-1">
                    Street Address / Building
                  </label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="MG Road, Commercial Complex Suite 4B"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#484640]/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#995b40] bg-[#faf7f3]/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#484640] mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Kochi / Calicut / Bangalore"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#484640]/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#995b40] bg-[#faf7f3]/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#484640] mb-1">
                    State & Country
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Kerala, India"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#484640]/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#995b40] bg-[#faf7f3]/50"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Card Color Theme */}
            <div className="space-y-3 pt-4 border-t border-[#484640]/10">
              <label className="block text-xs font-bold text-[#89817b] uppercase tracking-wider">
                4. Select Card Theme
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'modern-navy', name: 'Modern Navy', hex: '#1e3a8a' },
                  { id: 'sleek-dark', name: 'Sleek Dark', hex: '#18181b' },
                  { id: 'emerald-luxury', name: 'Emerald Luxury', hex: '#064e3b' },
                  { id: 'royal-amethyst', name: 'Royal Amethyst', hex: '#581c87' },
                ].map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setTheme(th.id as ThemeId)}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                      theme === th.id
                        ? 'border-[#995b40] bg-[#f3ddd6]/50 ring-2 ring-[#995b40]/30'
                        : 'border-[#484640]/15 hover:border-[#484640]/30'
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: th.hex }}
                    />
                    <span className="text-xs font-semibold text-[#484640]">{th.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-4 space-y-3">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl bg-[#995b40] hover:bg-[#814a33] text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-[#995b40]/25 transition-all active:scale-[0.99] disabled:opacity-70 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Creating Customer & Generating QR...</span>
                  </>
                ) : (
                  <>
                    <QrIcon className="w-5 h-5" />
                    <span>
                      Generate NFC Card & Instant QR Code
                      {selectedPlan && (
                        <>
                          {' '}• <span className="currency-sym">₹</span>{selectedPlan.tier.discountedPrice}
                        </>
                      )}
                    </span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
