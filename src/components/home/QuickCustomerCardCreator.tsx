'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SelectedPlanState } from '@/types/pricing';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';

interface QuickCustomerCardCreatorProps {
  selectedPlan: SelectedPlanState | null;
  onChangePlan?: () => void;
  paymentDetails?: {
    transactionId: string;
    amount: number;
    planName: string;
    method: string;
  } | null;
  onClose?: () => void;
}

interface CreatedCardData {
  profile: {
    id: string;
    slug: string;
    full_name: string;
    title?: string;
    company_name?: string;
    phone?: string;
    email?: string;
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

export default function QuickCustomerCardCreator({
  selectedPlan,
  onChangePlan,
  paymentDetails,
  onClose,
}: QuickCustomerCardCreatorProps) {
  // Mobile tab view toggle (switch between Form and Live Preview on mobile)
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');

  // Form fields matching the user's provided code and screenshot
  const [fullName, setFullName] = useState('Alex Carter');
  const [jobTitle, setJobTitle] = useState('Product Designer');
  const [company, setCompany] = useState('Carter Studio');
  const [phone, setPhone] = useState('+1 415 555 0199');
  const [whatsapp, setWhatsapp] = useState('+1 415 555 0199');
  const [email, setEmail] = useState('alex@carterstudio.com');
  const [address, setAddress] = useState('123 Mission Street, Suite 400');
  const [city, setCity] = useState('San Francisco');
  const [postal, setPostal] = useState('94103');
  const [website, setWebsite] = useState('https://carterstudio.com');
  const [instagram, setInstagram] = useState('@alexcarter');
  const [linkedin, setLinkedin] = useState('linkedin.com/in/alexcarter');
  const [bio, setBio] = useState('Product designer focused on simple, meaningful digital experiences.');

  // Photo upload - initialized with portrait matching user's screenshot
  const [photo, setPhoto] = useState<string>(
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
  );
  const photoVersionRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status feedback
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Result dialog / card created
  const [result, setResult] = useState<CreatedCardData | null>(null);
  const [qrPngUrl, setQrPngUrl] = useState<string>('');

  // Storage key
  const storageKey = 'nfc-profile-draft-v1';

  // Compute initials
  const initials = (fullName || 'Your Name')
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  // Helper safe URLs
  const safeUrl = (value: string) => {
    if (!value) return '';
    try {
      const source = /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : 'https://' + value;
      const url = new URL(source);
      if (!['http:', 'https:'].includes(url.protocol)) return '';
      if (!url.hostname || url.username || url.password) return '';
      return url.href;
    } catch {
      return '';
    }
  };

  const instagramUrl = (value: string) => {
    if (!value) return '';
    if (/^@?[a-z0-9._]+$/i.test(value) && !value.includes('instagram.com')) {
      return 'https://www.instagram.com/' + encodeURIComponent(value.replace(/^@/, '')) + '/';
    }
    const href = safeUrl(value);
    if (!href) return '';
    try {
      const host = new URL(href).hostname;
      return /(^|\.)instagram\.com$/i.test(host) ? href : '';
    } catch {
      return '';
    }
  };

  const linkedinUrl = (value: string) => {
    const href = safeUrl(value);
    if (!href) return '';
    try {
      return /(^|\.)linkedin\.com$/i.test(new URL(href).hostname) ? href : '';
    } catch {
      return '';
    }
  };

  // Restore saved draft on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (saved && typeof saved === 'object') {
        if (typeof saved.fullName === 'string') setFullName(saved.fullName);
        if (typeof saved.jobTitle === 'string') setJobTitle(saved.jobTitle);
        if (typeof saved.company === 'string') setCompany(saved.company);
        if (typeof saved.phone === 'string') setPhone(saved.phone);
        if (typeof saved.whatsapp === 'string') setWhatsapp(saved.whatsapp);
        if (typeof saved.email === 'string') setEmail(saved.email);
        if (typeof saved.address === 'string') setAddress(saved.address);
        if (typeof saved.city === 'string') setCity(saved.city);
        if (typeof saved.postal === 'string') setPostal(saved.postal);
        if (typeof saved.website === 'string') setWebsite(saved.website);
        if (typeof saved.instagram === 'string') setInstagram(saved.instagram);
        if (typeof saved.linkedin === 'string') setLinkedin(saved.linkedin);
        if (typeof saved.bio === 'string') setBio(saved.bio);
        if (
          typeof saved.photo === 'string' &&
          /^data:image\/(?:jpeg|png);base64,/.test(saved.photo) &&
          saved.photo.length < 1500000
        ) {
          setPhoto(saved.photo);
        }
      }
    } catch {
      // Ignored
    }
  }, []);

  // Center crop photo upload
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const version = ++photoVersionRef.current;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setStatusMessage('Please select a JPG or PNG image.');
      setIsError(true);
      event.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage('Please select an image smaller than 5 MB.');
      setIsError(true);
      event.target.value = '';
      return;
    }

    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();

      // Center crop and resize to 400x400
      const size = Math.min(image.naturalWidth, image.naturalHeight);
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 400;
      const context = canvas.getContext('2d');
      if (!context) return;

      context.fillStyle = '#fff';
      context.fillRect(0, 0, 400, 400);
      context.drawImage(
        image,
        (image.naturalWidth - size) / 2,
        (image.naturalHeight - size) / 2,
        size,
        size,
        0,
        0,
        400,
        400
      );

      if (version !== photoVersionRef.current) return;
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setPhoto(dataUrl);
      setStatusMessage('Photo updated in the preview.');
      setIsError(false);
    } catch {
      setStatusMessage('This image could not be loaded. Please try another file.');
      setIsError(true);
    } finally {
      URL.revokeObjectURL(url);
      event.target.value = '';
    }
  };

  const handleRemovePhoto = () => {
    photoVersionRef.current++;
    setPhoto('');
    setStatusMessage('Photo removed.');
    setIsError(false);
  };

  // Save Draft in localStorage
  const handleSaveDraft = () => {
    try {
      const data = {
        fullName,
        jobTitle,
        company,
        phone,
        whatsapp,
        email,
        address,
        city,
        postal,
        website,
        instagram,
        linkedin,
        bio,
        photo,
      };
      localStorage.setItem(storageKey, JSON.stringify(data));
      setStatusMessage('Draft saved in this browser.');
      setIsError(false);
    } catch {
      setStatusMessage('Unable to save in this browser. Storage may be full or disabled.');
      setIsError(true);
    }
  };

  // Download contact as a UTF-8 vCard (.vcf)
  const handleDownloadVcf = () => {
    if (!fullName.trim()) {
      setStatusMessage('Add your full name before downloading your contact.');
      setIsError(true);
      return;
    }

    const escape = (val: string) =>
      String(val || '')
        .replace(/\\/g, '\\\\')
        .replace(/\r\n|\r|\n/g, '\\n')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,');

    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'FN:' + escape(fullName),
      'N:;' + escape(fullName) + ';;;',
    ];

    if (company) lines.push('ORG:' + escape(company));
    if (jobTitle) lines.push('TITLE:' + escape(jobTitle));
    if (phone) lines.push('TEL;TYPE=CELL:' + escape(phone));
    if (email) lines.push('EMAIL:' + escape(email));
    if (safeUrl(website)) lines.push('URL:' + escape(safeUrl(website)));
    if (address || city || postal) {
      lines.push(
        'ADR;TYPE=WORK:;;' +
          escape(address) +
          ';' +
          escape(city) +
          ';;' +
          escape(postal) +
          ';'
      );
    }
    if (bio) lines.push('NOTE:' + escape(bio));
    lines.push('END:VCARD');

    // Fold long lines at 75 UTF-8 bytes
    function fold(line: string) {
      const encoder = new TextEncoder();
      let output = '';
      let bytes = 0;
      for (const character of line) {
        const length = encoder.encode(character).length;
        if (bytes + length > 75) {
          output += '\r\n ';
          bytes = 1;
        }
        output += character;
        bytes += length;
      }
      return output;
    }

    const blob = new Blob([lines.map(fold).join('\r\n') + '\r\n'], {
      type: 'text/vcard;charset=utf-8',
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = (fullName.replace(/[^\p{L}\p{N}_-]+/gu, '_') || 'contact') + '.vcf';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Form Submit & Publish
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setIsError(false);

    if (!fullName.trim()) {
      setStatusMessage('Add your full name before publishing.');
      setIsError(true);
      return;
    }

    setPublishing(true);
    try {
      const res = await fetch('/api/quick-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          title: jobTitle.trim(),
          company_name: company.trim(),
          phone: phone.trim(),
          whatsapp: whatsapp.trim() || phone.trim(),
          email: email.trim(),
          website: website.trim(),
          street: address.trim(),
          city: city.trim(),
          state: '',
          country: postal.trim(),
          avatar_url: photo,
          theme: 'modern-navy',
          card_type: 'NFC CARD',
          plan_duration: selectedPlan?.tier.name || '1 Year Plan',
          plan_price: selectedPlan?.tier.discountedPrice || 801,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Publish failed');
      }

      setResult(data);

      const qr = await QRCode.toDataURL(data.permanentNfcUrl, {
        width: 1024,
        margin: 2,
        color: { dark: '#111111', light: '#ffffff' },
      });
      setQrPngUrl(qr);

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {
        // Ignored
      }

      setStatusMessage('Your profile has been published. NFC card is activated!');
      setIsError(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Publishing failed. Please check connection.';
      setStatusMessage(msg);
      setIsError(true);
    } finally {
      setPublishing(false);
    }
  };

  // Formatted detail values for preview
  const phoneDigits = phone.replace(/[^\d+]/g, '');
  const waDigits = whatsapp.replace(/\D/g, '');
  const formattedAddress = [address, city, postal].filter(Boolean).join(', ');
  const webHref = safeUrl(website);
  const igHref = instagramUrl(instagram);
  const liHref = linkedinUrl(linkedin);

  const hasAnyDetail = Boolean(
    company || formattedAddress || igHref || liHref || webHref
  );

  return (
    <div className="w-full bg-white text-[#111]">
      {/* SHARED SVG SYMBOLS MATCHING USER'S CODE */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <symbol id="i-user" viewBox="0 0 24 24">
            <circle cx="12" cy="7" r="4" />
            <path d="M4 21v-2a8 8 0 0 1 16 0v2Z" />
          </symbol>
          <symbol id="i-camera" viewBox="0 0 24 24">
            <path d="M4 6h4l2-3h4l2 3h4v15H4Z" />
            <circle cx="12" cy="13" r="4" />
          </symbol>
          <symbol id="i-phone" viewBox="0 0 24 24">
            <path d="m7 3 3 5-3 3a15 15 0 0 0 6 6l3-3 5 3c-1 5-4 5-8 3A23 23 0 0 1 4 11C2 7 2 4 7 3Z" />
          </symbol>
          <symbol id="i-mail" viewBox="0 0 24 24">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 6 9 7 9-7" />
          </symbol>
          <symbol id="i-link" viewBox="0 0 24 24">
            <path
              d="m10 14 4-4M8 16l-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0M16 8l1-1a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0"
              transform="translate(1 0) scale(.9)"
            />
          </symbol>
          <symbol id="i-chat" viewBox="0 0 24 24">
            <path d="M21 11a9 9 0 0 1-13 8l-5 2 1-5A9 9 0 1 1 21 11Z" />
            <path d="M8 7c0 5 3 8 8 8" />
          </symbol>
          <symbol id="i-building" viewBox="0 0 24 24">
            <path d="M5 21V3h11v18M16 9h4v12M3 21h19M9 7h3M9 11h3M9 15h3M9 21v-3h3v3" />
          </symbol>
          <symbol id="i-pin" viewBox="0 0 24 24">
            <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z" />
            <circle cx="12" cy="10" r="2" />
          </symbol>
          <symbol id="i-instagram" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <path d="M17.5 6.5h.01" />
          </symbol>
          <symbol id="i-linkedin" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M7 10v7M7 7h.01M11 17v-7m0 3c0-4 6-4 6 0v4" />
          </symbol>
          <symbol id="i-contact" viewBox="0 0 24 24">
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <circle cx="12" cy="9" r="3" />
            <path d="M8 18v-1a4 4 0 0 1 8 0v1" />
          </symbol>
          <symbol id="i-battery" viewBox="0 0 24 24">
            <rect x="2" y="7" width="18" height="10" rx="2" />
            <path d="M23 10v4M5 10h12v4H5Z" />
          </symbol>
        </defs>
      </svg>

      {/* PAYMENT CONFIRMATION BADGE (CLEAN & RESPONSIVE) */}
      {paymentDetails && (
        <div className="w-full mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 sm:px-5 sm:py-3 rounded-2xl bg-emerald-50/90 border border-emerald-200/80 text-emerald-950 shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    Payment Confirmed
                  </span>
                  <span className="text-xs font-semibold text-emerald-900">
                    • {paymentDetails.planName} (<span className="currency-sym">₹</span>{paymentDetails.amount.toLocaleString()} via {paymentDetails.method})
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-700 block mt-0.5">
                  ID: {paymentDetails.transactionId}
                </span>
              </div>
            </div>

            {onChangePlan && (
              <button
                type="button"
                onClick={onChangePlan}
                className="self-start sm:self-auto text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline underline-offset-4 shrink-0"
              >
                Change Plan
              </button>
            )}
          </div>
        </div>
      )}

      {/* MOBILE SEGMENTED CONTROL (SWITCH BETWEEN FORM AND PHONE PREVIEW ON SMALL SCREENS) */}
      <div className="flex md:hidden p-1 bg-neutral-100 rounded-xl mb-5">
        <button
          type="button"
          onClick={() => setMobileTab('form')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === 'form'
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          <span>Edit Form</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === 'preview'
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
            <path d="M12 18h.01" />
          </svg>
          <span>Live Phone Preview</span>
        </button>
      </div>

      {/* MAIN 2-COLUMN LAYOUT: FORM ON LEFT, PHONE PREVIEW ON RIGHT */}
      <div className="nfc-profile-layout">
        <section className={`w-full min-w-0 ${mobileTab === 'form' ? 'block' : 'hidden md:block'}`}>
          <h1>Create your profile</h1>
          <p className="profile-subtitle">Your details. One simple tap.</p>

          <form id="profileForm" onSubmit={handleSubmit}>
            {/* AVATAR UPLOAD ROW */}
            <div className="profile-upload-row">
              <div className="profile-avatar">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt="Your uploaded profile photo" />
                ) : (
                  <span className="initials">{initials}</span>
                )}
              </div>

              <div className="profile-upload-info">
                <button
                  type="button"
                  className="profile-button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg className="icon" aria-hidden="true">
                    <use href="#i-camera" />
                  </svg>
                  Upload photo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handlePhotoUpload}
                  hidden
                />
                <small>JPG, PNG up to 5 MB</small>

                {photo && (
                  <button
                    type="button"
                    className="profile-button"
                    onClick={handleRemovePhoto}
                    style={{ marginTop: '9px', padding: '6px 10px' }}
                  >
                    Remove photo
                  </button>
                )}
              </div>
            </div>

            {/* FORM INPUT FIELDS */}
            <div className="profile-fields">
              <div className="profile-field">
                <label htmlFor="fullName">Full name *</label>
                <input
                  id="fullName"
                  name="fullName"
                  required
                  maxLength={80}
                  autoComplete="name"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="profile-input"
                />
              </div>

              <div className="profile-field">
                <label htmlFor="jobTitle">Job title</label>
                <input
                  id="jobTitle"
                  name="jobTitle"
                  maxLength={80}
                  autoComplete="organization-title"
                  placeholder="Product Designer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="profile-input"
                />
              </div>

              <div className="profile-field">
                <label htmlFor="company">Company</label>
                <input
                  id="company"
                  name="company"
                  maxLength={100}
                  autoComplete="organization"
                  placeholder="Your company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="profile-input"
                />
              </div>

              <div className="profile-field">
                <label htmlFor="phone">Phone number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  maxLength={25}
                  autoComplete="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="profile-input"
                />
              </div>

              <div className="profile-field">
                <label htmlFor="whatsapp">WhatsApp number</label>
                <input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  maxLength={25}
                  placeholder="Include country code"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="profile-input"
                />
              </div>

              <div className="profile-field">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  maxLength={120}
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="profile-input"
                />
              </div>

              <div className="profile-field full">
                <label htmlFor="address">Address</label>
                <input
                  id="address"
                  name="address"
                  maxLength={200}
                  autoComplete="street-address"
                  placeholder="Street, building or office"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="profile-input"
                />
              </div>

              <div className="profile-field">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  name="city"
                  maxLength={80}
                  autoComplete="address-level2"
                  placeholder="Kozhikode"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="profile-input"
                />
              </div>

              <div className="profile-field">
                <label htmlFor="postal">Postal code</label>
                <input
                  id="postal"
                  name="postal"
                  maxLength={20}
                  autoComplete="postal-code"
                  placeholder="673001"
                  value={postal}
                  onChange={(e) => setPostal(e.target.value)}
                  className="profile-input"
                />
              </div>

              {/* SOCIAL FIELDS (3 COLUMNS) */}
              <div className="profile-social-fields">
                <div className="profile-field">
                  <label htmlFor="website">Website</label>
                  <input
                    id="website"
                    name="website"
                    maxLength={300}
                    placeholder="example.com"
                    inputMode="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="profile-input"
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="instagram">Instagram</label>
                  <input
                    id="instagram"
                    name="instagram"
                    maxLength={300}
                    placeholder="@username"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="profile-input"
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="linkedin">LinkedIn</label>
                  <input
                    id="linkedin"
                    name="linkedin"
                    maxLength={300}
                    placeholder="linkedin.com/in/username"
                    inputMode="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="profile-input"
                  />
                </div>
              </div>

              {/* BIO FULL WIDTH */}
              <div className="profile-field full">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  maxLength={160}
                  placeholder="Tell people a little about yourself"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="profile-textarea"
                />
                <div className="profile-counter">
                  <span>{bio.length}</span>/160
                </div>
              </div>
            </div>

            {/* Mobile preview shortcut button */}
            <button
              type="button"
              onClick={() => setMobileTab('preview')}
              className="md:hidden w-full py-2.5 px-4 mb-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                <path d="M12 18h.01" />
              </svg>
              <span>See Live Phone Preview ({fullName || 'Profile'})</span>
            </button>

            {/* ACTION BUTTONS */}
            <div className="profile-actions">
              {onClose && (
                <button
                  type="button"
                  className="profile-button"
                  onClick={onClose}
                >
                  Close
                </button>
              )}
              <button
                type="button"
                className="profile-button"
                id="saveDraft"
                onClick={handleSaveDraft}
              >
                Save draft
              </button>
              <button
                type="submit"
                className="profile-button black"
                disabled={publishing}
              >
                {publishing ? 'Publishing…' : 'Save & publish'}
              </button>
            </div>

            <p className="profile-note">
              Drafts are saved in this browser. Online publishing activates your permanent NFC redirect and high-res vector QR code.
            </p>

            {statusMessage && (
              <p
                id="status"
                className={`profile-status ${isError ? 'error' : ''}`}
                role="status"
                aria-live="polite"
              >
                {statusMessage}
              </p>
            )}
          </form>

          {/* SUCCESS RESULT CARD UPON PUBLISHING */}
          {result && (
            <div className="mt-8 p-6 rounded-2xl bg-neutral-50 border border-neutral-200/90 shadow-sm animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-emerald-600 mb-2 font-semibold text-sm">
                <svg className="icon w-4 h-4 text-emerald-600" viewBox="0 0 24 24">
                  <path d="M20 6 9 17l-5-5" strokeWidth="2.5" />
                </svg>
                <span>NFC Card Activated & Ready</span>
              </div>
              <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
                Permanent NFC Redirect:{' '}
                <a
                  href={result.permanentNfcUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-neutral-900 underline font-semibold"
                >
                  {result.permanentNfcUrl}
                </a>
              </p>

              <div className="flex flex-wrap items-center gap-4">
                {qrPngUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrPngUrl}
                    alt="QR Code"
                    className="w-24 h-24 rounded-lg border bg-white p-1"
                  />
                )}

                <div className="space-y-2">
                  <a
                    href={result.profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-neutral-900 text-white text-xs font-medium hover:bg-neutral-800"
                  >
                    <span>View Live Digital Profile</span>
                    <svg className="icon w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
                    </svg>
                  </a>

                  {qrPngUrl && (
                    <a
                      href={qrPngUrl}
                      download={`${result.profile.slug}-qr.png`}
                      className="block text-xs font-semibold text-neutral-700 hover:text-neutral-950 underline"
                    >
                      Download High-Res QR Code (.png)
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* RIGHT COLUMN: STICKY IPHONE PREVIEW */}
        <aside
          className={`phone-preview-column ${mobileTab === 'preview' ? 'block' : 'hidden md:block'}`}
          id="preview"
          aria-label="Live profile preview"
        >
          <div className="phone-device">
            <div className="phone-screen">
              {/* STATUS BAR + DYNAMIC ISLAND */}
              <div className="phone-header-top" aria-hidden="true">
                <span>9:41</span>
                <span className="phone-island" />
                <span className="phone-signals">
                  <svg className="icon">
                    <use href="#i-battery" />
                  </svg>
                </span>
              </div>

              {/* PROFILE SCREEN BODY */}
              <div className="phone-profile-body">
                <div className="phone-profile-head">
                  <div className="profile-avatar">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img id="previewPhoto" src={photo} alt="Profile photo" />
                    ) : (
                      <span className="initials" id="previewInitials">
                        {initials}
                      </span>
                    )}
                  </div>

                  <h2 id="previewName">{fullName || 'Your Name'}</h2>
                  {jobTitle && <p className="phone-profile-role">{jobTitle}</p>}
                  {company && <p className="phone-profile-company">{company}</p>}
                  {bio && <p className="phone-profile-bio">{bio}</p>}
                </div>

                {/* SAVE CONTACT BUTTON */}
                <button
                  type="button"
                  className="profile-button black phone-save-contact"
                  id="downloadVcf"
                  onClick={handleDownloadVcf}
                >
                  <svg className="icon" aria-hidden="true">
                    <use href="#i-contact" />
                  </svg>
                  Save Contact
                </button>

                {/* QUICK ACTION BUTTONS */}
                <div className="phone-quick-links">
                  {phoneDigits && (
                    <a href={`tel:${phoneDigits}`} className="phone-quick-link" id="callLink">
                      <span>
                        <svg className="icon" aria-hidden="true">
                          <use href="#i-phone" />
                        </svg>
                      </span>
                      Call
                    </a>
                  )}

                  {email && (
                    <a
                      href={`mailto:${encodeURIComponent(email)}`}
                      className="phone-quick-link"
                      id="emailLink"
                    >
                      <span>
                        <svg className="icon" aria-hidden="true">
                          <use href="#i-mail" />
                        </svg>
                      </span>
                      Email
                    </a>
                  )}

                  {webHref && (
                    <a
                      href={webHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="phone-quick-link"
                      id="websiteLink"
                    >
                      <span>
                        <svg className="icon" aria-hidden="true">
                          <use href="#i-link" />
                        </svg>
                      </span>
                      Website
                    </a>
                  )}

                  {waDigits && (
                    <a
                      href={`https://wa.me/${waDigits}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="phone-quick-link"
                      id="whatsappLink"
                    >
                      <span>
                        <svg className="icon" aria-hidden="true">
                          <use href="#i-chat" />
                        </svg>
                      </span>
                      WhatsApp
                    </a>
                  )}
                </div>

                {/* DETAIL LIST */}
                {hasAnyDetail && (
                  <div className="phone-detail-list" id="detailList">
                    {company && (
                      <div className="phone-detail-item" id="companyRow">
                        <svg className="icon" aria-hidden="true">
                          <use href="#i-building" />
                        </svg>
                        <span id="companyText">{company}</span>
                      </div>
                    )}

                    {formattedAddress && (
                      <a
                        className="phone-detail-item"
                        id="addressRow"
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          formattedAddress
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <svg className="icon" aria-hidden="true">
                          <use href="#i-pin" />
                        </svg>
                        <span id="addressText">{formattedAddress}</span>
                      </a>
                    )}

                    {igHref && (
                      <a
                        className="phone-detail-item"
                        id="instagramRow"
                        href={igHref}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <svg className="icon" aria-hidden="true">
                          <use href="#i-instagram" />
                        </svg>
                        <span id="instagramText">{instagram}</span>
                      </a>
                    )}

                    {liHref && (
                      <a
                        className="phone-detail-item"
                        id="linkedinRow"
                        href={liHref}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <svg className="icon" aria-hidden="true">
                          <use href="#i-linkedin" />
                        </svg>
                        <span id="linkedinText">{linkedin}</span>
                      </a>
                    )}

                    {webHref && (
                      <a
                        className="phone-detail-item"
                        id="websiteRow"
                        href={webHref}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <svg className="icon" aria-hidden="true">
                          <use href="#i-link" />
                        </svg>
                        <span id="websiteText">{website.replace(/^https?:\/\//, '')}</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <p className="phone-preview-label">Live preview · Updates as you type</p>

          {/* Back to Edit Form button on mobile */}
          <button
            type="button"
            onClick={() => setMobileTab('form')}
            className="md:hidden w-full max-w-[320px] mx-auto py-3 px-4 mt-5 rounded-xl bg-neutral-900 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Back to Edit Form</span>
          </button>
        </aside>
      </div>
    </div>
  );
}
