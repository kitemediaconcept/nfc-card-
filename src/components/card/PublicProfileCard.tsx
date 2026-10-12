'use client';

import React, { useState } from 'react';
import { BusinessProfileData, SocialLink } from '@/types';
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  Download,
  Share2,
  QrCode,
  Briefcase,
  Check,
  Copy,
  ExternalLink,
  MessageCircle,
  Building2,
  X,
} from 'lucide-react';
import QRCode from 'qrcode';

interface PublicProfileCardProps {
  profile: BusinessProfileData;
  cardId?: string | null;
  isPreview?: boolean;
}

const THEME_STYLES: Record<string, { bg: string; card: string; headerGradient: string; textPrimary: string; textMuted: string; btnPrimary: string }> = {
  'modern-navy': {
    bg: 'bg-slate-900',
    card: 'bg-slate-900 text-white',
    headerGradient: 'from-blue-900 to-indigo-950',
    textPrimary: 'text-white',
    textMuted: 'text-slate-400',
    btnPrimary: 'bg-blue-600 hover:bg-blue-500 text-white',
  },
  'sleek-dark': {
    bg: 'bg-zinc-950',
    card: 'bg-zinc-900 text-zinc-100',
    headerGradient: 'from-zinc-900 to-black',
    textPrimary: 'text-zinc-100',
    textMuted: 'text-zinc-400',
    btnPrimary: 'bg-zinc-100 hover:bg-white text-zinc-900',
  },
  'emerald-luxury': {
    bg: 'bg-emerald-950',
    card: 'bg-emerald-950 text-emerald-50',
    headerGradient: 'from-emerald-900 to-teal-950',
    textPrimary: 'text-emerald-50',
    textMuted: 'text-emerald-300',
    btnPrimary: 'bg-emerald-600 hover:bg-emerald-500 text-white',
  },
  'royal-amethyst': {
    bg: 'bg-purple-950',
    card: 'bg-purple-950 text-purple-50',
    headerGradient: 'from-purple-900 to-violet-950',
    textPrimary: 'text-purple-50',
    textMuted: 'text-purple-300',
    btnPrimary: 'bg-purple-600 hover:bg-purple-500 text-white',
  },
  'sunset-amber': {
    bg: 'bg-amber-950',
    card: 'bg-stone-900 text-amber-50',
    headerGradient: 'from-amber-900 to-orange-950',
    textPrimary: 'text-amber-50',
    textMuted: 'text-amber-200/70',
    btnPrimary: 'bg-amber-600 hover:bg-amber-500 text-white',
  },
  'minimal-light': {
    bg: 'bg-slate-100',
    card: 'bg-white text-slate-900 border border-slate-200',
    headerGradient: 'from-slate-200 to-slate-300',
    textPrimary: 'text-slate-900',
    textMuted: 'text-slate-500',
    btnPrimary: 'bg-slate-900 hover:bg-slate-800 text-white',
  },
};

export default function PublicProfileCard({ profile, cardId, isPreview = false }: PublicProfileCardProps) {
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrSvgString, setQrSvgString] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadingVcf, setDownloadingVcf] = useState(false);

  const theme = THEME_STYLES[profile.theme] || THEME_STYLES['modern-navy'];
  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/p/${profile.slug}` : `/p/${profile.slug}`;

  // Log analytics click event
  const trackAction = async (eventType: string, meta?: Record<string, unknown>) => {
    if (isPreview) return;
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: profile.id,
          card_id: cardId || null,
          event_type: eventType,
          event_metadata: meta,
        }),
      });
    } catch {
      // Non-blocking
    }
  };

  const handleOpenQr = async () => {
    trackAction('qr_modal_open');
    try {
      const svg = await QRCode.toString(publicUrl, {
        type: 'svg',
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' },
      });
      setQrSvgString(svg);
      setShowQrModal(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = async () => {
    trackAction('share_click');
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.full_name} | Digital Card`,
          text: `Connect with ${profile.full_name} (${profile.title || ''})`,
          url: publicUrl,
        });
        return;
      } catch {
        // Fallback to copy
      }
    }

    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Ignored
    }
  };

  const handleDownloadVcf = () => {
    trackAction('vcf_download');
    setDownloadingVcf(true);
    const link = document.createElement('a');
    link.href = `/p/${profile.slug}/vcard`;
    link.download = `${profile.slug}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloadingVcf(false), 1200);
  };

  const formattedAddress = [profile.street, profile.city, profile.state, profile.postal_code, profile.country]
    .filter(Boolean)
    .join(', ');

  return (
    <div className={`w-full max-w-md mx-auto ${theme.card} rounded-3xl overflow-hidden shadow-2xl relative font-sans transition-colors duration-200`}>
      {/* Top Banner / Cover */}
      <div className={`h-40 w-full relative overflow-hidden bg-gradient-to-r ${theme.headerGradient}`}>
        {profile.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.cover_url}
            alt="Cover"
            className="w-full h-full object-cover opacity-90"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-purple-800/40 backdrop-blur-sm" />
        )}

        {/* Company logo watermark if available */}
        {profile.company_logo_url && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-1.5 rounded-xl shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={profile.company_logo_url} alt="Logo" className="h-7 w-auto object-contain" />
          </div>
        )}
      </div>

      {/* Profile Header Details */}
      <div className="px-6 pt-0 pb-6 relative">
        {/* Avatar */}
        <div className="relative -mt-16 mb-4 flex justify-between items-end">
          <div className="relative">
            <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl bg-slate-200">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-3xl">
                  {profile.full_name.charAt(0)}
                </div>
              )}
            </div>
          </div>

          {/* Quick Share / QR Floating Buttons */}
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={handleOpenQr}
              aria-label="View QR Code"
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all active:scale-95 text-current shadow-sm"
            >
              <QrCode className="w-5 h-5" />
            </button>
            <button
              onClick={handleShare}
              aria-label="Share Card"
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all active:scale-95 text-current shadow-sm"
            >
              {copiedLink ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Name and Designation */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight">{profile.full_name}</h1>
          {profile.title && (
            <p className={`text-sm font-medium ${theme.textMuted} mt-0.5`}>{profile.title}</p>
          )}
          {profile.company_name && (
            <div className="flex items-center gap-1.5 text-xs text-blue-400 mt-1 font-semibold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" />
              <span>{profile.company_name}</span>
            </div>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className={`text-sm leading-relaxed mb-6 ${theme.textMuted}`}>
            {profile.bio}
          </p>
        )}

        {/* Save Contact Primary CTA */}
        <div className="mb-6">
          <button
            onClick={handleDownloadVcf}
            disabled={downloadingVcf}
            className={`w-full py-3.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2.5 shadow-lg active:scale-[0.99] transition-all ${theme.btnPrimary}`}
          >
            <Download className="w-5 h-5" />
            <span>{downloadingVcf ? 'Downloading...' : 'Save Contact to Phone'}</span>
          </button>
        </div>

        {/* Direct Action Hub (Call, WhatsApp, Email, Web, Directions) */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {profile.phone_visible && profile.phone && (
            <a
              href={`tel:${profile.phone}`}
              onClick={() => trackAction('call_click')}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all active:scale-95 text-center group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                <Phone className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium opacity-80">Call</span>
            </a>
          )}

          {profile.whatsapp_visible && profile.whatsapp && (
            <a
              href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackAction('whatsapp_click')}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all active:scale-95 text-center group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium opacity-80">WhatsApp</span>
            </a>
          )}

          {profile.email_visible && profile.email && (
            <a
              href={`mailto:${profile.email}`}
              onClick={() => trackAction('email_click')}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all active:scale-95 text-center group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium opacity-80">Email</span>
            </a>
          )}

          {profile.website_visible && profile.website && (
            <a
              href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackAction('website_click')}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all active:scale-95 text-center group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                <Globe className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium opacity-80">Website</span>
            </a>
          )}
        </div>

        {/* Address & Directions */}
        {profile.address_visible && formattedAddress && (
          <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Office Address</p>
                <p className="text-sm mt-0.5 leading-snug">{formattedAddress}</p>
                {profile.maps_url && (
                  <a
                    href={profile.maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackAction('directions_click')}
                    className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold mt-2"
                  >
                    <span>Get Directions</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Social Links */}
        {profile.social_links && profile.social_links.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Connect Online</h2>
            <div className="grid grid-cols-2 gap-2.5">
              {profile.social_links.map((link: SocialLink) => (
                <a
                  key={link.id}
                  href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackAction('social_click', { platform: link.platform })}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all active:scale-98"
                >
                  <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="text-xs font-medium truncate flex-1">{link.label || link.platform}</span>
                  <ExternalLink className="w-3 h-3 opacity-40 shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Services / Products Section */}
        {profile.services && profile.services.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Services & Expertise</h2>
            <div className="space-y-3">
              {profile.services.map((srv) => (
                <div key={srv.id} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-sm">{srv.title}</h3>
                    {srv.price && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                        {srv.price}
                      </span>
                    )}
                  </div>
                  {srv.description && (
                    <p className={`text-xs leading-relaxed ${theme.textMuted}`}>{srv.description}</p>
                  )}
                  {srv.link_url && (
                    <a
                      href={srv.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackAction('service_click', { title: srv.title })}
                      className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium mt-2"
                    >
                      <span>Learn more</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio Showcase */}
        {profile.portfolio && profile.portfolio.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Featured Work</h2>
            <div className="space-y-3">
              {profile.portfolio.map((item) => (
                <div key={item.id} className="rounded-2xl overflow-hidden bg-white/5 border border-white/5">
                  {item.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image_url} alt={item.title} className="w-full h-36 object-cover" />
                  )}
                  <div className="p-3.5">
                    <h3 className="font-semibold text-sm">{item.title}</h3>
                    {item.description && (
                      <p className={`text-xs mt-1 leading-relaxed ${theme.textMuted}`}>{item.description}</p>
                    )}
                    {item.project_url && (
                      <a
                        href={item.project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackAction('portfolio_click', { title: item.title })}
                        className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium mt-2"
                      >
                        <span>View Project</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Fields */}
        {profile.custom_fields && profile.custom_fields.length > 0 && (
          <div className="mb-6 space-y-2">
            {profile.custom_fields.map((field) => (
              <div key={field.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center text-xs">
                <span className="text-slate-400">{field.label}</span>
                <span className="font-medium text-right truncate max-w-[200px]">{field.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer Brand */}
        <div className="pt-4 border-t border-white/10 text-center">
          <p className="text-[11px] opacity-60">
            Powered by <span className="font-bold tracking-tight">SmartNFC Card Platform</span>
          </p>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative text-center">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg text-slate-900 mb-1">Scan Digital Card</h3>
            <p className="text-xs text-slate-500 mb-4">Point your camera or QR reader to connect instantly</p>

            <div
              className="w-56 h-56 mx-auto bg-slate-50 p-2 rounded-2xl border border-slate-200 shadow-inner flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
              dangerouslySetInnerHTML={{ __html: qrSvgString }}
            />

            <p className="text-xs font-semibold text-slate-600 mt-4 break-all bg-slate-100 py-1.5 px-3 rounded-lg">
              {publicUrl}
            </p>

            <div className="mt-5 flex gap-2">
              <button
                onClick={handleShare}
                className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
              </button>
              <button
                onClick={() => setShowQrModal(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
