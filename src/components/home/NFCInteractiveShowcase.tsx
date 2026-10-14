'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CARD_PRODUCTS, PlanDuration, SelectedPlanState } from '@/types/pricing';
import QuickCustomerCardCreator from '@/components/home/QuickCustomerCardCreator';
import PaymentCheckoutModal from '@/components/home/PaymentCheckoutModal';

interface NFCInteractiveShowcaseProps {
  onPlanSelected?: (plan: SelectedPlanState) => void;
}

export default function NFCInteractiveShowcase({ onPlanSelected }: NFCInteractiveShowcaseProps) {
  // Mobile menu toggle
  const [menuOpen, setMenuOpen] = useState(false);

  // Payment & Checkout state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<{
    transactionId: string;
    amount: number;
    planName: string;
    method: string;
  } | null>(null);

  // Selected plan duration
  const [selectedDuration, setSelectedDuration] = useState<PlanDuration>('1-year');
  const [selectedPlanState, setSelectedPlanState] = useState<SelectedPlanState>({
    cardId: 'pvc',
    cardTitle: 'NFC CARD',
    tier: CARD_PRODUCTS[0].tiers[0],
  });

  // Tap ripple on the card
  const [tapRipples, setTapRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [tapToast, setTapToast] = useState(false);

  // Refs for anchors & header
  const headerRef = useRef<HTMLElement>(null);
  const heroAnchorRef = useRef<HTMLDivElement>(null);
  const featureAnchorRef = useRef<HTMLDivElement>(null);
  const priceAnchorRef = useRef<HTMLDivElement>(null);

  // Sticky nav elevation on scroll
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled((window.scrollY || window.pageYOffset) > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile nav on escape key or outside click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Lock background scroll when modal is active
  useEffect(() => {
    if (isProfileModalOpen || isCheckoutOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isProfileModalOpen, isCheckoutOpen]);

  // Stage & Tilt refs for 60fps GPU transforms
  const stageRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);

  // Plan select handler
  const handleSelectPlan = (duration: PlanDuration) => {
    setSelectedDuration(duration);
    const tier = CARD_PRODUCTS[0].tiers.find((t) => t.duration === duration) || CARD_PRODUCTS[0].tiers[0];
    const plan: SelectedPlanState = {
      cardId: 'pvc',
      cardTitle: 'NFC CARD',
      tier,
    };
    setSelectedPlanState(plan);
    if (onPlanSelected) {
      onPlanSelected(plan);
    }
  };

  // Restore verified payment on mount if available
  useEffect(() => {
    try {
      const saved = JSON.parse(
        sessionStorage.getItem('nfc_payment_verified') ||
        localStorage.getItem('nfc_payment_verified') ||
        'null'
      );
      if (saved && saved.transactionId) {
        setPaymentDetails(saved);
      }
    } catch {
      // Ignored
    }
  }, []);

  const handlePaymentSuccess = (details: {
    transactionId: string;
    amount: number;
    planName: string;
    method: string;
  }) => {
    setPaymentDetails(details);
    setIsCheckoutOpen(false);
    setIsProfileModalOpen(true);
    try {
      sessionStorage.setItem('nfc_payment_verified', JSON.stringify(details));
      localStorage.setItem('nfc_payment_verified', JSON.stringify(details));
    } catch {
      // Ignored
    }
  };

  const scrollToForm = () => {
    const el = document.getElementById('customer-form-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToSection = (id: string) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Card physics & continuous scroll tracking
  const updateCardPosition = useCallback(() => {
    if (!stageRef.current) return;

    const heroAnchor = heroAnchorRef.current;
    const featureAnchor = featureAnchorRef.current;
    const priceAnchor = priceAnchorRef.current;

    if (!heroAnchor || !featureAnchor || !priceAnchor) return;

    const scrollY = window.scrollY || window.pageYOffset;
    const innerHeight = window.innerHeight;
    const isMobile = window.innerWidth <= 720;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const anchors = [heroAnchor, featureAnchor, priceAnchor];
    const points = anchors.map((anchor) => {
      const rect = anchor.getBoundingClientRect();
      return {
        x: rect.left + window.scrollX + rect.width / 2,
        y: rect.top + scrollY + rect.height / 2,
      };
    });

    const stops = [
      0,
      Math.max(1, points[1].y - innerHeight * 0.53),
      Math.max(2, points[2].y - innerHeight * 0.53),
    ];

    const clamp = (val: number) => Math.max(0, Math.min(1, val));
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const ease = (t: number) => t * t * (3 - 2 * t);

    const y = Math.max(0, scrollY);
    const segment = y < stops[1] ? 0 : 1;
    const progress = clamp(
      (y - stops[segment]) / Math.max(1, stops[segment + 1] - stops[segment])
    );

    let x: number;
    let cardY: number;
    let rotation: number;

    if (isMobile || prefersReducedMotion) {
      let nearest = 0;
      let minDistance = Infinity;

      points.forEach((point, index) => {
        const dist = Math.abs(point.y - y - innerHeight * 0.55);
        if (dist < minDistance) {
          nearest = index;
          minDistance = dist;
        }
      });

      x = points[nearest].x;
      cardY = points[nearest].y;
      rotation = prefersReducedMotion ? 0 : [-14, -7, 7][nearest];
    } else {
      const from = points[segment];
      const to = points[segment + 1];

      const p = ease(progress);
      x = lerp(from.x, to.x, p);
      cardY = lerp(from.y, to.y, progress);
      rotation = lerp([-15, -7][segment], [-7, 7][segment], p);
    }

    const stage = stageRef.current;
    stage.style.transform = `translate3d(${x - stage.offsetWidth / 2}px, ${
      cardY - stage.offsetHeight / 2
    }px, 0) rotate(${rotation}deg)`;
  }, []);

  useEffect(() => {
    let animId: number;
    const onScroll = () => {
      cancelAnimationFrame(animId);
      animId = requestAnimationFrame(updateCardPosition);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    updateCardPosition();

    // Check after fonts ready
    if (document.fonts) {
      document.fonts.ready.then(updateCardPosition);
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(animId);
    };
  }, [updateCardPosition]);

  // Pointer hover tilt
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!tiltRef.current || e.pointerType === 'touch') return;
    const rect = tiltRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    tiltRef.current.style.setProperty('--tilt-x', `${(0.5 - y) * 14}deg`);
    tiltRef.current.style.setProperty('--tilt-y', `${(x - 0.5) * 18}deg`);
    tiltRef.current.style.setProperty('--shine-x', `${x * 100}%`);
    tiltRef.current.style.setProperty('--shine-y', `${y * 100}%`);
  };

  const handlePointerLeave = () => {
    if (!tiltRef.current) return;
    tiltRef.current.style.setProperty('--tilt-x', '0deg');
    tiltRef.current.style.setProperty('--tilt-y', '0deg');
  };

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setTapRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setTapRipples((prev) => prev.filter((r) => r.id !== id));
    }, 800);

    setTapToast(true);
    setTimeout(() => setTapToast(false), 2400);
  };

  return (
    <div className="relative w-full bg-white text-[#111] overflow-x-clip selection:bg-[#111] selection:text-white">
      {/* 1. NFC FLOATING NAV BAR (Matches user code & screenshot) */}
      <header
        ref={headerRef}
        className={`nfc-header is-ready ${menuOpen ? 'is-open' : ''} ${isScrolled ? 'is-scrolled' : ''} ${isProfileModalOpen || isCheckoutOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <nav className="nfc-nav" aria-label="Main navigation">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('home');
            }}
            className="nfc-brand"
            aria-label="NFC Card home"
          >
            <svg
              viewBox="0 0 32 32"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              className="w-[27px] h-[29px] overflow-visible shrink-0"
              style={{ width: '27px', height: '29px', fill: 'none', stroke: 'currentColor' }}
              aria-hidden="true"
            >
              <path d="M5 12Q9 16 5 20" />
              <path d="M11 8Q18 16 11 24" />
              <path d="M18 5Q27 16 18 27" />
              <path d="M25 2Q36 16 25 30" />
            </svg>
            <span>NFC Card</span>
          </a>

          <button
            className="nfc-menu-toggle"
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="nfc-menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span>
            <span></span>
          </button>

          <div className="nfc-menu" id="nfc-menu">
            <a
              href="#features"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('features');
              }}
            >
              How it works
            </a>
            <a
              href="#customer-form-section"
              onClick={(e) => {
                e.preventDefault();
                setMenuOpen(false);
                scrollToForm();
              }}
            >
              Create card
            </a>
            <a
              href="#preview"
              onClick={(e) => {
                e.preventDefault();
                setMenuOpen(false);
                const previewEl = document.getElementById('preview');
                if (previewEl) previewEl.scrollIntoView({ behavior: 'smooth' });
                else scrollToForm();
              }}
            >
              Card preview
            </a>
          </div>
        </nav>
      </header>

      {/* 2. HERO SECTION WITH GIANT "NFC" WATERMARK (Exact match to screenshot & code) */}
      <section
        id="home"
        className="relative h-[max(780px,100svh)] max-h-[1050px] pt-[155px] px-6 overflow-hidden flex flex-col items-center"
      >
        <div className="relative z-[3] text-center max-w-3xl mx-auto">
          <h1 className="m-0 text-[clamp(44px,5.7vw,78px)] leading-[1.04] tracking-[-0.065em] font-medium text-[#111]">
            <span className="text-[#a3a3a3]">One card.</span>
            <br />
            Every connection.
          </h1>
          <p className="my-5 mb-6 text-[15px] text-[#777] leading-[1.6]">
            Share your world with a single tap.
          </p>
          <a
            href="#pricing"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('pricing');
            }}
            className="inline-flex justify-center items-center gap-[14px] bg-[#111] hover:bg-[#333] text-white border border-[#111] rounded-[30px] px-6 py-[15px] text-[13px] font-medium transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-black/5"
          >
            <span>Create your card</span>
            <svg
              className="w-[15px] h-[15px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M5 19 19 5M5 5h14v14" />
            </svg>
          </a>
        </div>

        {/* GIANT "NFC" WATERMARK LETTERS SPANNING THE BOTTOM (Exact match to screenshot) */}
        <div
          className="hero-letters absolute left-1/2 bottom-[-0.15em] -translate-x-1/2 text-[clamp(260px,38vw,620px)] leading-none font-bold tracking-[-0.075em] text-[#202020] pointer-events-none select-none z-[1]"
          aria-hidden="true"
        >
          NFC
        </div>

        {/* Position Anchor where the card floats in Hero */}
        <div
          ref={heroAnchorRef}
          id="heroAnchor"
          className="absolute left-1/2 top-[71%] w-px h-px pointer-events-none"
          aria-hidden="true"
        />
      </section>

      {/* 3. FEATURES SECTION ("How it works") */}
      <section
        id="features"
        className="relative max-w-[1180px] mx-auto min-h-[650px] py-[110px] px-8 grid grid-cols-1 md:grid-cols-2 gap-[70px] items-center scroll-mt-[115px]"
      >
        <div className="max-w-lg">
          <p className="m-0 mb-[18px] text-[10px] uppercase tracking-[2.5px] text-[#777] font-semibold">
            Made for everyday connections
          </p>
          <h2 className="m-0 mb-7 text-[clamp(32px,4vw,52px)] leading-[1.08] tracking-[-0.055em] font-medium text-[#111]">
            Small card.
            <br />
            More possibilities.
          </h2>

          {/* Feature 1 */}
          <article className="flex gap-4 items-start mt-7">
            <span className="w-10 h-10 shrink-0 border border-[#e9e9e9] rounded-[12px] grid place-items-center bg-white shadow-sm">
              <svg
                className="w-[19px] h-[19px] text-[#111]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="10" cy="7" r="3" />
                <path d="M3 21v-3a7 7 0 0 1 14 0v3M20 7v6m-3-3h6" />
              </svg>
            </span>
            <div>
              <h3 className="m-0 mb-2 text-[15px] font-medium text-[#111]">
                Instant contact sharing
              </h3>
              <p className="m-0 text-[13px] leading-[1.7] max-w-[310px] text-[#777]">
                Tap your card on a compatible phone to open your digital profile.
              </p>
            </div>
          </article>

          {/* Feature 2 */}
          <article className="flex gap-4 items-start mt-7">
            <span className="w-10 h-10 shrink-0 border border-[#e9e9e9] rounded-[12px] grid place-items-center bg-white shadow-sm">
              <svg
                className="w-[19px] h-[19px] text-[#111]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="m15 4 5 5M4 20l5-1L21 7l-5-5L4 14v6Z" />
              </svg>
            </span>
            <div>
              <h3 className="m-0 mb-2 text-[15px] font-medium text-[#111]">
                Update your details anytime
              </h3>
              <p className="m-0 text-[13px] leading-[1.7] max-w-[310px] text-[#777]">
                Change your contact details and links without replacing your card.
              </p>
            </div>
          </article>

          {/* Feature 3 */}
          <article className="flex gap-4 items-start mt-7">
            <span className="w-10 h-10 shrink-0 border border-[#e9e9e9] rounded-[12px] grid place-items-center bg-white shadow-sm">
              <svg
                className="w-[19px] h-[19px] text-[#111]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="6" height="6" rx="1" />
                <rect x="15" y="3" width="6" height="6" rx="1" />
                <rect x="3" y="15" width="6" height="6" rx="1" />
                <path d="M15 15h3v3h3v3h-6v-3m6-6v3" />
              </svg>
            </span>
            <div>
              <h3 className="m-0 mb-2 text-[15px] font-medium text-[#111]">
                A QR code alternative
              </h3>
              <p className="m-0 text-[13px] leading-[1.7] max-w-[310px] text-[#777]">
                Let visitors scan your QR code to access the same online profile.
              </p>
            </div>
          </article>
        </div>

        {/* Feature Visual Space (Anchor where the card glides on right) */}
        <div className="min-h-[320px] grid place-items-center pointer-events-none" aria-hidden="true">
          <div ref={featureAnchorRef} id="featureAnchor" className="w-px h-px" />
        </div>
      </section>

      {/* 4. PRICING SECTION ("Create card") */}
      <section
        id="pricing"
        className="relative max-w-[1180px] mx-auto min-h-[760px] pt-[160px] pb-[110px] px-8 grid grid-cols-1 md:grid-cols-2 gap-[70px] items-center border-t border-[#f0f0f0] scroll-mt-[115px]"
      >
        {/* Price Visual Space (Anchor where the card glides on left) */}
        <div className="min-h-[320px] grid place-items-center pointer-events-none order-2 md:order-1" aria-hidden="true">
          <div ref={priceAnchorRef} id="priceAnchor" className="w-px h-px" />
        </div>

        {/* Pricing Copy on the right */}
        <div className="w-full max-w-[460px] order-1 md:order-2">
          <p className="m-0 mb-[18px] text-[10px] uppercase tracking-[2.5px] text-[#777] font-semibold">
            Choose your duration
          </p>
          <h2 className="m-0 mb-7 text-[clamp(32px,4vw,52px)] leading-[1.08] tracking-[-0.055em] font-medium text-[#111]">
            NFC Card
          </h2>
          <p className="text-[12px] text-[#777] leading-[1.6] mb-6">
            One card for your contact details, links and business profile.
          </p>

          <fieldset className="m-0 mb-6 p-0 border border-[#e5e5e5] rounded-[18px] overflow-hidden bg-white shadow-sm" aria-label="Choose your plan">
            {/* 1 Year */}
            <label
              onClick={() => handleSelectPlan('1-year')}
              className={`flex items-center justify-between gap-5 p-[23px] cursor-pointer transition-colors border-b border-[#ededed] ${
                selectedDuration === '1-year' ? 'bg-[#fafafa] shadow-[inset_3px_0_#111]' : 'hover:bg-[#fafafa]'
              }`}
            >
              <span className="flex items-center gap-3 text-[14px] text-[#111] font-medium">
                <input
                  type="radio"
                  name="plan"
                  value="1"
                  checked={selectedDuration === '1-year'}
                  onChange={() => handleSelectPlan('1-year')}
                  className="w-4 h-4 accent-[#111] m-0"
                />
                1 Year
              </span>
              <strong className="text-[21px] font-medium tracking-[-0.5px] text-[#111]">
                <span className="currency-sym mr-0.5">र</span>801
              </strong>
            </label>

            {/* 2 Years */}
            <label
              onClick={() => handleSelectPlan('2-year')}
              className={`flex items-center justify-between gap-5 p-[23px] cursor-pointer transition-colors border-b border-[#ededed] ${
                selectedDuration === '2-year' ? 'bg-[#fafafa] shadow-[inset_3px_0_#111]' : 'hover:bg-[#fafafa]'
              }`}
            >
              <span className="flex items-center gap-3 text-[14px] text-[#111] font-medium">
                <input
                  type="radio"
                  name="plan"
                  value="2"
                  checked={selectedDuration === '2-year'}
                  onChange={() => handleSelectPlan('2-year')}
                  className="w-4 h-4 accent-[#111] m-0"
                />
                2 Years
              </span>
              <strong className="text-[21px] font-medium tracking-[-0.5px] text-[#111]">
                <span className="currency-sym mr-0.5">र</span>1,201
              </strong>
            </label>

            {/* 3 Years */}
            <label
              onClick={() => handleSelectPlan('3-year')}
              className={`flex items-center justify-between gap-5 p-[23px] cursor-pointer transition-colors ${
                selectedDuration === '3-year' ? 'bg-[#fafafa] shadow-[inset_3px_0_#111]' : 'hover:bg-[#fafafa]'
              }`}
            >
              <span className="flex items-center gap-3 text-[14px] text-[#111] font-medium">
                <input
                  type="radio"
                  name="plan"
                  value="3"
                  checked={selectedDuration === '3-year'}
                  onChange={() => handleSelectPlan('3-year')}
                  className="w-4 h-4 accent-[#111] m-0"
                />
                3 Years
              </span>
              <strong className="text-[21px] font-medium tracking-[-0.5px] text-[#111]">
                <span className="currency-sym mr-0.5">र</span>1,401
              </strong>
            </label>
          </fieldset>

          <button
            type="button"
            onClick={() => setIsCheckoutOpen(true)}
            className="w-full inline-flex justify-center items-center gap-[18px] bg-[#111] hover:bg-[#333] text-white border border-[#111] rounded-[30px] p-[15px] text-[13px] font-medium transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-lg"
          >
            <span>
              Pay <span className="currency-sym">र</span>{selectedPlanState.tier.discountedPrice.toLocaleString()} &amp; Create Profile
            </span>
            <svg
              className="w-[15px] h-[15px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M5 19 19 5M5 5h14v14" />
            </svg>
          </button>
        </div>
      </section>

      {/* 5. THE SINGLE CARD THAT MOVES BETWEEN SECTION ANCHORS (Exact implementation from User Code) */}
      <div
        ref={stageRef}
        id="cardStage"
        className="card-stage absolute left-0 top-0 z-[8] w-[clamp(270px,35vw,480px)] [aspect-ratio:1.586] [perspective:1200px] pointer-events-none will-change-transform"
        aria-hidden="true"
      >
        <div
          ref={tiltRef}
          id="cardTilt"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          onClick={handleCardClick}
          className="card-tilt w-full h-full relative [transform-style:preserve-3d] transition-transform duration-200 ease-out pointer-events-auto cursor-pointer"
          style={{
            transform: 'rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))',
          }}
        >
          {/* Card Physical Body */}
          <div
            className="nfc-card relative w-full h-full rounded-[20px] overflow-hidden text-white border border-[#555] shadow-[1px_3px_0_#8d8d8d,2px_5px_0_#292929,0_24px_35px_#00000022]"
            style={{
              background: `
                radial-gradient(ellipse at 12% 0%, #424242, transparent 65%),
                linear-gradient(130deg, #242424, #090909)
              `,
            }}
          >
            {/* Specular Radial Shine */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at var(--shine-x, 30%) var(--shine-y, 20%), rgba(255,255,255,0.13), transparent 55%)',
              }}
            />

            {/* Ripple on tap */}
            {tapRipples.map((r) => (
              <span
                key={r.id}
                className="absolute rounded-full pointer-events-none border border-white/40 animate-[ripple_0.8s_ease-out_forwards]"
                style={{
                  left: r.x - 60,
                  top: r.y - 60,
                  width: 120,
                  height: 120,
                }}
              />
            ))}

            {/* Contactless waves on Top Right */}
            <svg
              className="card-symbol absolute right-[8%] top-[12%] w-[12%] h-[20%] text-white"
              viewBox="0 0 32 32"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M6 12q4 4 0 8" />
              <path d="M12 8q7 8 0 16" />
              <path d="M18 4q10 12 0 24" />
              <path d="M24 1q12 15 0 30" />
            </svg>

            {/* NFC Card text on Bottom Left */}
            <span className="card-label absolute bottom-[13%] left-[8%] text-[clamp(16px,2vw,25px)] tracking-[-0.6px] text-[#e5e5e5] font-medium font-sans">
              NFC Card
            </span>
          </div>
        </div>
      </div>

      {/* Tap toast */}
      {tapToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#111] text-white text-xs font-medium shadow-2xl border border-neutral-700 animate-in fade-in slide-in-from-bottom-2">
          Contactless NFC Tap Recognized
        </div>
      )}

      {/* 6. FULL-WIDTH NFC MOBILE SHOWCASE SECTION */}
      <section
        id="customer-form-section"
        className="w-full py-6 md:py-12 bg-white overflow-hidden border-t border-[#f0f0f0]"
      >
        <div className="w-full max-w-none flex justify-center items-center">
          <img
            src="/images/nfcmobile.png"
            alt="NFC Card Mobile Contactless Experience"
            className="w-full h-auto object-contain select-none"
            loading="eager"
          />
        </div>
      </section>

      {/* Floating profile setup pill if payment confirmed */}
      {paymentDetails && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[calc(100%-32px)] p-4 rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl border border-neutral-200 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-left">
              <p className="text-xs font-semibold text-neutral-900 m-0">Payment Confirmed ({paymentDetails.planName})</p>
              <p className="text-[11px] text-neutral-500 m-0">ID: {paymentDetails.transactionId}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsProfileModalOpen(true)}
            className="px-4 py-2 bg-[#111] hover:bg-[#333] text-white text-xs font-medium rounded-xl transition-all shadow-sm"
          >
            Edit Profile Setup
          </button>
        </div>
      )}

      {/* Profile Creator Modal */}
      {isProfileModalOpen && paymentDetails && (
        <div
          className="fixed inset-0 z-[2500] flex flex-col justify-end sm:justify-center sm:items-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsProfileModalOpen(false)}
        >
          <div
            className="relative w-full h-[100dvh] sm:h-auto sm:max-h-[92vh] sm:max-w-5xl bg-white sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 sm:my-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header: ALWAYS visible on mobile & desktop, never blocked by navbar or scrolled away */}
            <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 sm:px-8 sm:py-4 bg-white/95 backdrop-blur-md border-b border-neutral-100 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="7" r="4" />
                    <path d="M4 21v-2a8 8 0 0 1 16 0v2Z" />
                  </svg>
                </div>
                <div className="truncate">
                  <h2 className="text-sm sm:text-base font-bold text-neutral-900 truncate m-0">Create your profile</h2>
                  <p className="text-[11px] text-neutral-500 truncate m-0">NFC Smart Card Setup</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center transition-all shrink-0 active:scale-95 shadow-sm"
                aria-label="Close profile setup"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Modal Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-8 sm:py-8">
              <QuickCustomerCardCreator
                selectedPlan={selectedPlanState}
                onChangePlan={() => {
                  setIsProfileModalOpen(false);
                  scrollToSection('pricing');
                }}
                paymentDetails={paymentDetails}
                onClose={() => setIsProfileModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* 7. PAYMENT CHECKOUT MODAL */}
      <PaymentCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedPlan={selectedPlanState}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* 8. MINIMAL FOOTER (Matches User Code) */}
      <footer className="footer max-w-[1180px] mx-auto py-7 px-8 border-t border-[#eee] flex justify-between gap-5 text-[#888] text-[12px]">
        <span className="font-medium text-[#444]">NFC Card</span>
        <span>One card. Every connection.</span>
      </footer>
    </div>
  );
}
