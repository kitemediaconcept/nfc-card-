'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Radio,
  QrCode,
  Download,
  Smartphone,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Cpu,
  Zap,
} from 'lucide-react';
import { CARD_PRODUCTS, PlanDuration, SelectedPlanState } from '@/types/pricing';

interface InteractiveScrollCardProps {
  cardName?: string;
  cardRole?: string;
  cardCompany?: string;
  onSelectPlan?: (plan: SelectedPlanState) => void;
}

export default function InteractiveScrollCard({
  cardName = 'Alexander Wright',
  cardRole = 'Founder & Managing Director',
  cardCompany = 'APEX HOLDINGS',
  onSelectPlan,
}: InteractiveScrollCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [hoverTilt, setHoverTilt] = useState({ rx: 0, ry: 0 });
  const [tapRipples, setTapRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [tapToast, setTapToast] = useState<string | null>(null);

  // Active pricing plan duration in Section 3
  const [selectedDuration, setSelectedDuration] = useState<PlanDuration>('1-year');

  // Scroll progress: 0 (Section 1 start), 0.5 (Section 2), 1 (Section 3 pricing)
  const [progress, setProgress] = useState(0);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    let animationFrameId: number;

    const handleScrollAndResize = () => {
      setIsMobile(window.innerWidth < 1024);

      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // The scroll container is 300vh tall.
      const totalScrollDistance = rect.height - windowHeight;
      if (totalScrollDistance <= 0) return;

      const currentScroll = -rect.top;
      const rawProgress = Math.min(Math.max(currentScroll / totalScrollDistance, 0), 1);

      setProgress(rawProgress);
    };

    const onScrollThrottled = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(handleScrollAndResize);
    };

    window.addEventListener('scroll', onScrollThrottled, { passive: true });
    window.addEventListener('resize', onScrollThrottled, { passive: true });
    handleScrollAndResize();

    return () => {
      window.removeEventListener('scroll', onScrollThrottled);
      window.removeEventListener('resize', onScrollThrottled);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Compute 3D transformation values based on progress [0 -> 1]
  // Inverted path according to user request:
  // Phase 1 (0.0): Card starts on the RIGHT (+28vw on desktop, 0 on mobile), Content is on the LEFT.
  // Phase 2 (0.5): Card passes through the CENTER (0vw) with cinematic 3D tilt.
  // Phase 3 (1.0): Card settles firmly on the LEFT (-28vw on desktop, 0 on mobile), Pricing is on the RIGHT.
  const getInterpolatedTransform = (p: number, mobile: boolean) => {
    const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
    const eased = easeInOut(p);

    const maxShift = mobile ? 0 : 28; // 28vw on desktop, 0vw on mobile

    let translateX: number;
    let translateY: number;
    let rotateX: number;
    let rotateY: number;
    let rotateZ: number;
    let scale: number;

    if (eased <= 0.5) {
      const sub = eased / 0.5; // 0 -> 1
      translateX = maxShift - sub * maxShift; // +28vw (Right) -> 0vw (Center)
      translateY = sub * -16; // 0px -> -16px
      rotateX = 8 - sub * 20; // 8deg -> -12deg
      rotateY = 16 - sub * 34; // 16deg -> -18deg
      rotateZ = 3 - sub * 7; // 3deg -> -4deg
      scale = 1 + sub * 0.05;
    } else {
      const sub = (eased - 0.5) / 0.5; // 0 -> 1
      translateX = 0 - sub * maxShift; // 0vw -> -28vw (Left)
      translateY = -16 + sub * 16; // -16px -> 0px
      rotateX = -12 + sub * 18; // -12deg -> 6deg
      rotateY = -18 + sub * 32; // -18deg -> 14deg
      rotateZ = -4 + sub * 7; // -4deg -> 3deg
      scale = 1.05 - sub * 0.05;
    }

    return {
      translateX,
      translateY,
      rotateX,
      rotateY,
      rotateZ,
      scale,
    };
  };

  const transform = getInterpolatedTransform(progress, isMobile);

  // Mouse hover tilt calculation
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current || e.pointerType === 'touch') return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setHoverTilt({
      rx: -y * 12,
      ry: x * 15,
    });
  };

  const handlePointerEnter = () => setIsHovered(true);
  const handlePointerLeave = () => {
    setIsHovered(false);
    setHoverTilt({ rx: 0, ry: 0 });
  };

  // Click / Tap simulation with ripple
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rippleId = Date.now();

    setTapRipples((prev) => [...prev, { id: rippleId, x, y }]);
    setTimeout(() => {
      setTapRipples((prev) => prev.filter((r) => r.id !== rippleId));
    }, 900);

    setTapToast('NFC Tap Triggered · Profile Recognized');
    setTimeout(() => {
      setTapToast(null);
    }, 2400);
  };

  // Total calculated rotation combining scroll kinematics and hover tilt
  const finalRotateX = transform.rotateX + (isHovered ? hoverTilt.rx : 0);
  const finalRotateY = transform.rotateY + (isHovered ? hoverTilt.ry : 0);
  const finalRotateZ = transform.rotateZ;

  // Handle plan selection
  const nfcProduct = CARD_PRODUCTS[0];
  const handleChooseTier = (duration: PlanDuration) => {
    setSelectedDuration(duration);
    const tier = nfcProduct.tiers.find((t) => t.duration === duration) || nfcProduct.tiers[0];

    if (onSelectPlan) {
      onSelectPlan({
        cardId: 'pvc',
        cardTitle: 'NFC CARD',
        tier,
      });
    }

    const formEl = document.getElementById('customer-form-section');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[300vh] bg-white text-neutral-900 select-none"
    >
      {/* Pinned Sticky Stage - Stays fixed in the viewport while scrolling the 300vh */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden [perspective:1400px]">
        {/* Subtle Pure White Ambient Shadow / Floor Lighting */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full pointer-events-none transition-all duration-700 opacity-40"
          style={{
            background:
              'radial-gradient(circle, rgba(0, 0, 0, 0.035) 0%, rgba(0, 0, 0, 0.01) 50%, transparent 70%)',
            transform: `translate3d(${transform.translateX * 0.4}vw, 160px, 0)`,
          }}
          aria-hidden="true"
        />

        {/* Dynamic Floor Shadow beneath Card */}
        <div
          className="absolute w-[240px] sm:w-[280px] h-[30px] rounded-full pointer-events-none transition-transform duration-100 ease-out"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.12) 40%, transparent 75%)',
            transform: `
              translate3d(calc(${transform.translateX}vw), calc(175px + ${transform.translateY}px), 0)
              scale(${transform.scale * (1 + (isHovered ? 0.05 : 0))})
            `,
            filter: 'blur(10px)',
          }}
          aria-hidden="true"
        />

        {/* 3D Black NFC Card Container (Starts on the Right, settles on the Left) */}
        <div
          ref={cardRef}
          onPointerMove={handlePointerMove}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onClick={handleCardClick}
          className="relative z-20 cursor-pointer will-change-transform"
          style={{
            transform: `
              translate3d(calc(${transform.translateX}vw), ${transform.translateY}px, 0)
              scale(${transform.scale})
              rotateX(${finalRotateX}deg)
              rotateY(${finalRotateY}deg)
              rotateZ(${finalRotateZ}deg)
            `,
            transformStyle: 'preserve-3d',
            transition: isHovered
              ? 'transform 0.08s ease-out'
              : 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          role="button"
          tabIndex={0}
          aria-label="Interactive Black NFC Card. Tap to trigger contact transfer."
        >
          {/* Card Physical Body - Pure Matte Black Luxury Card */}
          <div
            className="relative w-[230px] sm:w-[260px] h-[360px] sm:h-[410px] rounded-[22px] p-6 flex flex-col justify-between overflow-hidden border border-neutral-800"
            style={{
              background:
                'linear-gradient(135deg, #141416 0%, #0a0a0c 45%, #000000 100%)',
              boxShadow: `
                0 25px 50px -12px rgba(0, 0, 0, 0.5),
                0 12px 24px -8px rgba(0, 0, 0, 0.35),
                inset 0 1px 1px 0 rgba(255, 255, 255, 0.15),
                inset 0 -1px 1px 0 rgba(0, 0, 0, 0.8)
              `,
            }}
          >
            {/* Fine carbon / brushed texture overlay */}
            <div
              className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay"
              style={{
                backgroundImage:
                  'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)',
                backgroundSize: '4px 4px',
              }}
            />

            {/* Specular sheen highlight responsive to hover / angle */}
            <div
              className="absolute -inset-full pointer-events-none transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle 320px at ${
                  50 + (isHovered ? hoverTilt.ry * 2.5 : 0)
                }% ${
                  50 + (isHovered ? -hoverTilt.rx * 2.5 : 0)
                }%, rgba(255, 255, 255, 0.14) 0%, transparent 60%)`,
              }}
              aria-hidden="true"
            />

            {/* Click Ripple Effect */}
            {tapRipples.map((r) => (
              <span
                key={r.id}
                className="absolute rounded-full pointer-events-none animate-[ripple_0.9s_ease-out_forwards] border border-white/40"
                style={{
                  left: r.x - 70,
                  top: r.y - 70,
                  width: 140,
                  height: 140,
                }}
                aria-hidden="true"
              />
            ))}

            {/* Top Bar: Minimal Logo + NFC Waves Icon */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
                <span className="text-white font-mono tracking-[0.22em] text-[10px] font-bold uppercase">
                  NFC CARD
                </span>
              </div>
              <div className="text-neutral-400 flex items-center gap-1">
                <Radio className="w-4 h-4 text-neutral-300" />
              </div>
            </div>

            {/* Center Area: Metallic EMV Microchip + Wireless Wave Arc */}
            <div className="relative z-10 my-auto flex flex-col items-start gap-3.5">
              {/* Brushed Gold Metallic NFC Chip */}
              <div
                className="w-11 h-9 rounded-md border border-neutral-700/80 shadow-md relative overflow-hidden"
                style={{
                  background:
                    'linear-gradient(135deg, #d4af37 0%, #aa820a 35%, #f3e5ab 65%, #8c6d07 100%)',
                }}
              >
                {/* Chip circuit contact pattern */}
                <div className="absolute inset-0 opacity-40">
                  <div className="w-full h-px bg-neutral-900 top-2.5 absolute" />
                  <div className="w-full h-px bg-neutral-900 top-5 absolute" />
                  <div className="h-full w-px bg-neutral-900 left-3.5 absolute" />
                  <div className="h-full w-px bg-neutral-900 left-7 absolute" />
                </div>
              </div>

              {/* Minimalist Cardholder Branding */}
              <div>
                <p className="text-[9px] font-mono tracking-[0.25em] uppercase text-neutral-400">
                  {cardCompany}
                </p>
                <p className="text-white text-sm sm:text-base font-semibold tracking-tight mt-0.5 font-sans">
                  {cardName}
                </p>
                <p className="text-neutral-400 text-[11px] font-medium tracking-wide mt-0.5">
                  {cardRole}
                </p>
              </div>
            </div>

            {/* Bottom Bar: QR Code + Encrypted Contactless UID */}
            <div className="relative z-10 pt-3 border-t border-neutral-800/80 flex items-end justify-between">
              <div>
                <span className="block text-[8px] font-mono text-neutral-500 uppercase tracking-widest">
                  UID TOKEN
                </span>
                <span className="block text-[10px] font-mono text-neutral-300 font-semibold tracking-wider">
                  8A2F · 94E1
                </span>
              </div>

              <div className="p-1 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 shadow-inner">
                <QrCode className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Overlay Toast Feedback */}
        {tapToast && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-neutral-950 text-white text-[11px] font-medium shadow-2xl border border-neutral-800 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>{tapToast}</span>
          </div>
        )}
      </div>

      {/* THREE SCROLL-DRIVEN CONTENT SECTIONS OVERLAID */}
      <div className="relative z-10 -mt-[300vh] pointer-events-none">
        {/* SECTION 1: HERO - Content on the LEFT, Card starts on the RIGHT (+28vw) */}
        <section
          id="hero-scroll-section"
          className="h-screen w-full flex items-center px-4 sm:px-8 lg:px-16 pointer-events-auto"
        >
          <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left 6 cols: Section 1 Copy (No overlap with card on right) */}
            <div className="lg:col-span-6 text-left max-w-lg">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-900 text-[11px] font-semibold tracking-wider uppercase mb-3 border border-neutral-200">
                <Radio className="w-3 h-3 text-neutral-800" />
                <span>Contactless NFC Card</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-neutral-950 tracking-tight leading-[1.12] mb-4">
                One Tap.<br />
                Every Connection.<br />
                <span className="text-neutral-400">Zero App Downloads.</span>
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6">
                Premium matte black contactless NFC card with dual-frequency transmission.
                Touch any smartphone to instantly exchange phone numbers, vCard address book contacts, and social profiles.
              </p>

              {/* Minimal Key Feature Badges */}
              <div className="grid grid-cols-2 gap-2.5 mb-7">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
                  <div className="w-6 h-6 rounded-lg bg-neutral-950 text-white flex items-center justify-center shrink-0">
                    <Radio className="w-3 h-3" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-900 leading-none">Instant NFC Tap</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">iPhone & Android</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
                  <div className="w-6 h-6 rounded-lg bg-neutral-950 text-white flex items-center justify-center shrink-0">
                    <QrCode className="w-3 h-3" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-900 leading-none">Dynamic QR Backup</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">High-res vector code</p>
                  </div>
                </div>
              </div>

              {/* Action Links */}
              <div className="flex items-center gap-3">
                <a
                  href="#pricing-plans"
                  className="px-5 py-2.5 rounded-full bg-neutral-950 text-white text-xs font-medium hover:bg-neutral-800 transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                >
                  <span>View NFC Card Plans</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <span className="text-[11px] text-neutral-400">
                  Starting at ₹801
                </span>
              </div>
            </div>

            {/* Right 6 cols: Open area where the card begins (+28vw on desktop) */}
            <div className="hidden lg:block lg:col-span-6" aria-hidden="true" />
          </div>
        </section>

        {/* SECTION 2: FEATURES & POINTS - Flanking columns (Card spins cleanly through CENTER) */}
        <section
          id="features"
          className="h-screen w-full flex items-center px-4 sm:px-8 lg:px-16 pointer-events-auto"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col justify-between h-full py-12">
            {/* Header */}
            <div className="text-center max-w-xl mx-auto">
              <span className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase bg-neutral-100 px-3 py-1 rounded-full border border-neutral-200">
                Core Technology
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight mt-2">
                Engineered for Modern Networking
              </h2>
            </div>

            {/* Clean Flanking feature points around the centered card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center w-full">
              {/* Left Column (Cols 1-4) */}
              <div className="lg:col-span-4 space-y-3.5 text-left">
                <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-sm hover:border-neutral-300 transition-all">
                  <div className="flex items-center gap-2 mb-1">
                    <Radio className="w-4 h-4 text-neutral-900" />
                    <h3 className="font-bold text-neutral-900 text-xs">Instant Contactless Tap</h3>
                  </div>
                  <p className="text-[11px] text-neutral-600 leading-relaxed">
                    13.56 MHz high-frequency NFC chip transmits data in under 0.1 seconds with zero battery required.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-sm hover:border-neutral-300 transition-all">
                  <div className="flex items-center gap-2 mb-1">
                    <QrCode className="w-4 h-4 text-neutral-900" />
                    <h3 className="font-bold text-neutral-900 text-xs">Offline Dynamic QR Backup</h3>
                  </div>
                  <p className="text-[11px] text-neutral-600 leading-relaxed">
                    High-res vector QR printed directly on every card for camera scanning from any distance.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-sm hover:border-neutral-300 transition-all">
                  <div className="flex items-center gap-2 mb-1">
                    <Download className="w-4 h-4 text-neutral-900" />
                    <h3 className="font-bold text-neutral-900 text-xs">1-Tap Address Book vCard</h3>
                  </div>
                  <p className="text-[11px] text-neutral-600 leading-relaxed">
                    Recipients save your phone, email, notes, and profile photo directly into Apple & Google Contacts.
                  </p>
                </div>
              </div>

              {/* Middle (Cols 5-8): Kept clear for the card rotating at center */}
              <div className="hidden lg:block lg:col-span-4" aria-hidden="true" />

              {/* Right Column (Cols 9-12) */}
              <div className="lg:col-span-4 space-y-3.5 text-left lg:text-right">
                <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-sm hover:border-neutral-300 transition-all">
                  <div className="flex items-center lg:justify-end gap-2 mb-1">
                    <Smartphone className="w-4 h-4 text-neutral-900" />
                    <h3 className="font-bold text-neutral-900 text-xs">Zero App Downloads</h3>
                  </div>
                  <p className="text-[11px] text-neutral-600 leading-relaxed">
                    Clients don&apos;t install any app. Your digital card opens instantly in their default mobile browser.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-sm hover:border-neutral-300 transition-all">
                  <div className="flex items-center lg:justify-end gap-2 mb-1">
                    <RefreshCw className="w-4 h-4 text-neutral-900" />
                    <h3 className="font-bold text-neutral-900 text-xs">Instant Cloud Updates</h3>
                  </div>
                  <p className="text-[11px] text-neutral-600 leading-relaxed">
                    Change phone numbers or designations anytime. Your physical card updates automatically.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-sm hover:border-neutral-300 transition-all">
                  <div className="flex items-center lg:justify-end gap-2 mb-1">
                    <ShieldCheck className="w-4 h-4 text-neutral-900" />
                    <h3 className="font-bold text-neutral-900 text-xs">Permanent Token Security</h3>
                  </div>
                  <p className="text-[11px] text-neutral-600 leading-relaxed">
                    Tamper-resistant cryptographic redirection guarantees reliable access anywhere in the world.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Indicator */}
            <div className="text-center text-[11px] font-medium text-neutral-400">
              Scroll to settle card into Pricing ↓
            </div>
          </div>
        </section>

        {/* SECTION 3: PRICING - Card settles on the LEFT (-28vw), Pricing is on the RIGHT */}
        <section
          id="pricing-plans"
          className="h-screen w-full flex items-center px-4 sm:px-8 lg:px-16 pointer-events-auto"
        >
          <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left 6 cols: Open area reserved for the card settling on the LEFT */}
            <div className="hidden lg:block lg:col-span-6" aria-hidden="true" />

            {/* Right 6 cols: Pure White Minimal Pricing Details (₹801, ₹1201, ₹1401 for NFC Card) */}
            <div className="lg:col-span-6 text-left max-w-lg">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-900 text-[11px] font-semibold tracking-wider uppercase mb-2.5 border border-neutral-200">
                <Sparkles className="w-3 h-3 text-neutral-900" />
                <span>NFC CARD PRICING</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight leading-tight mb-2">
                Select Your Plan
              </h2>
              <p className="text-xs text-neutral-500 leading-relaxed mb-5">
                Lifetime matte black NFC card hardware with cloud profile hosting & contact saving.
              </p>

              {/* 3 Pricing Options: 1 Year (₹801), 2 Year (₹1201), 3 Year (₹1401) */}
              <div className="space-y-2.5 mb-5">
                {/* 1 Year Plan - ₹801 */}
                <div
                  onClick={() => setSelectedDuration('1-year')}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedDuration === '1-year'
                      ? 'bg-neutral-50 border-neutral-950 shadow-sm'
                      : 'bg-white border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedDuration === '1-year'
                          ? 'border-neutral-950 bg-neutral-950 text-white'
                          : 'border-neutral-300'
                      }`}
                    >
                      {selectedDuration === '1-year' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-950">1 Year Plan</span>
                        <span className="text-[10px] text-neutral-500">NFC Card</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        1-Year cloud profile sync & contact analytics
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base sm:text-lg font-black text-neutral-950">
                      ₹801
                    </span>
                    <span className="block text-[9px] text-neutral-400 line-through">₹1,099</span>
                  </div>
                </div>

                {/* 2 Year Plan - ₹1201 */}
                <div
                  onClick={() => setSelectedDuration('2-year')}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedDuration === '2-year'
                      ? 'bg-neutral-50 border-neutral-950 shadow-sm'
                      : 'bg-white border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedDuration === '2-year'
                          ? 'border-neutral-950 bg-neutral-950 text-white'
                          : 'border-neutral-300'
                      }`}
                    >
                      {selectedDuration === '2-year' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-950">2 Year Plan</span>
                        <span className="text-[10px] text-neutral-500">NFC Card</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        2-Year cloud profile sync + priority updates
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base sm:text-lg font-black text-neutral-950">
                      ₹1,201
                    </span>
                    <span className="block text-[9px] text-neutral-400 line-through">₹1,599</span>
                  </div>
                </div>

                {/* 3 Year Plan - ₹1401 (Best Value) */}
                <div
                  onClick={() => setSelectedDuration('3-year')}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between relative overflow-hidden ${
                    selectedDuration === '3-year'
                      ? 'bg-neutral-50 border-neutral-950 shadow-sm'
                      : 'bg-white border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedDuration === '3-year'
                          ? 'border-neutral-950 bg-neutral-950 text-white'
                          : 'border-neutral-300'
                      }`}
                    >
                      {selectedDuration === '3-year' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-950">3 Year Plan</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-neutral-950 text-white">
                          BEST VALUE
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        3-Year cloud profile sync with zero hidden fees
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base sm:text-lg font-black text-neutral-950">
                      ₹1,401
                    </span>
                    <span className="block text-[9px] text-neutral-400 line-through">₹1,999</span>
                  </div>
                </div>
              </div>

              {/* Order Button */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleChooseTier(selectedDuration)}
                  className="px-6 py-3 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white font-medium text-xs transition-all shadow-md active:scale-95 flex items-center gap-2"
                >
                  <span>Select & Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] text-neutral-500">
                  Instant card generation
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
