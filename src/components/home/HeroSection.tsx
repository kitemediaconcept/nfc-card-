'use client';

import React from 'react';
import Link from 'next/link';
import InteractiveHeroCard from './InteractiveHeroCard';
import { ExternalLink, ArrowRight, Star, Users, Sparkles } from 'lucide-react';

export default function HeroSection() {
  const scrollToPricing = () => {
    const el = document.getElementById('pricing-plans');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="relative overflow-hidden bg-[#faf7f3]">
      {/* Background radial gradients matching reference styling */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 66% 95%, rgba(232, 189, 176, 0.5) 0%, transparent 48%),
            radial-gradient(ellipse at 12% 100%, #f3ddd6 0%, transparent 45%),
            #faf7f3
          `,
        }}
      />

      {/* Hero Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:pt-16 sm:pb-24 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] items-center gap-10 lg:gap-14 min-h-[560px]">
        {/* Left Column: Typography & CTAs */}
        <section className="text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f3ddd6] text-[#995b40] text-[11px] font-bold tracking-[2.5px] uppercase mb-4 sm:mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>One card. Every connection.</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-normal tracking-[-3px] sm:tracking-[-4px] text-[#484640] leading-[1.05] mb-5 sm:mb-6">
            The card you<br />
            will{' '}
            <span
              className="font-medium bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(100deg, #57504a, #c1aaa0)',
              }}
            >
              love.
            </span>
          </h1>

          <p className="text-[#89817b] text-base sm:text-lg leading-relaxed max-w-[420px] mb-8">
            Your name, your business, your world. Share it all with one contactless tap or instant dynamic QR code.
          </p>

          {/* Action Button & Email Bar */}
          <div className="flex flex-wrap items-center gap-3.5 mb-8">
            <button
              type="button"
              onClick={scrollToPricing}
              className="border-0 rounded-xl bg-[#995b40] hover:bg-[#814a33] text-white px-6 py-3.5 text-sm font-semibold shadow-[0_8px_22px_rgba(153,91,64,0.25)] transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
            >
              <span>Select Card & View Plans</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              href="/p/alexrivera"
              target="_blank"
              className="rounded-xl border border-[#484640]/15 bg-white/70 hover:bg-white text-[#484640] px-5 py-3.5 text-sm font-semibold transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5 shadow-sm"
            >
              <span>View Sample Profile</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#89817b]" />
            </Link>
          </div>

          {/* Social Proof Badges matching reference screenshot */}
          <div className="flex items-center gap-6 py-4 border-y border-[#484640]/10 text-xs text-[#89817b]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#f3ddd6] text-[#995b40] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-[#484640] font-semibold text-sm">156k+</strong>
                <span>Active Cards</span>
              </div>
            </div>

            <div className="w-px h-8 bg-[#484640]/10" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#f3ddd6] text-[#995b40] flex items-center justify-center">
                <Star className="w-4 h-4 fill-[#995b40]" />
              </div>
              <div>
                <strong className="block text-[#484640] font-semibold text-sm">4.9★</strong>
                <span>Ratings on TP</span>
              </div>
            </div>
          </div>

          {/* Features note */}
          <div className="flex gap-8 mt-8 text-xs text-[#89817b]">
            <div>
              <strong className="block text-[#484640] text-sm font-medium mb-1">
                One tap
              </strong>
              Instant contactless sharing
            </div>
            <div>
              <strong className="block text-[#484640] text-sm font-medium mb-1">
                Always current
              </strong>
              Update anytime without new cards
            </div>
          </div>
        </section>

        {/* Right Column: 3D Interactive Card */}
        <section className="flex justify-center">
          <InteractiveHeroCard />
        </section>
      </main>
    </div>
  );
}
