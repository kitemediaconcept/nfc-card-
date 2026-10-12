'use client';

import React from 'react';
import { Sparkles, Leaf, CheckCircle2, Award, Zap } from 'lucide-react';

export default function AboutSection() {
  return (
    <section id="about" className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-[#484640]/10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left Column: Story */}
        <div className="space-y-6">
          <span className="text-[11px] font-bold tracking-[3px] uppercase text-[#995b40] bg-[#f3ddd6] px-3.5 py-1.5 rounded-full">
            About tap. Cards
          </span>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#484640] leading-tight">
            Stop handing out cards that get thrown away.
          </h2>

          <p className="text-sm sm:text-base text-[#89817b] leading-relaxed">
            Over 88% of paper business cards distributed every year are discarded within one week. Traditional business cards get crumpled in wallets, become outdated the moment phone numbers change, and cost hundreds of dollars each time you re-order.
          </p>

          <p className="text-sm sm:text-base text-[#89817b] leading-relaxed">
            With <strong>/// tap.</strong>, you carry just one physical card crafted from premium PVC, sustainable natural wood, or laser-etched black steel. Whenever you meet a new client or collaborator, simply tap their phone or show your high-res dynamic QR code. Your full digital presence—contact details, social channels, and services—is instantly shared and saved.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-[#faf7f3] border border-[#484640]/10 flex items-start gap-3">
              <Leaf className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-xs font-bold text-[#484640]">Eco-Conscious</strong>
                <span className="text-xs text-[#89817b]">One card replaces 1,000s of discarded paper cards.</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#faf7f3] border border-[#484640]/10 flex items-start gap-3">
              <Award className="w-5 h-5 text-[#995b40] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-xs font-bold text-[#484640]">Instant Premium Vibe</strong>
                <span className="text-xs text-[#89817b]">Unmatched first impression during high-stakes meetings.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Box */}
        <div className="relative">
          <div className="rounded-3xl p-8 sm:p-10 bg-[#faf7f3] border border-[#484640]/10 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#484640]/10">
              <span className="text-xs font-bold uppercase tracking-wider text-[#995b40]">
                Traditional vs tap.
              </span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                100% Digital Synergy
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                  ✕
                </div>
                <div>
                  <strong className="text-[#484640] block">Paper Cards</strong>
                  <p className="text-[#89817b]">Require typing details into phone manually. Discarded or lost quickly. Cost money on every reprint.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-[#484640] block">/// tap. NFC Cards</strong>
                  <p className="text-[#89817b]">1-tap contactless transmission straight to recipient contacts. Dynamic updates forever. Never runs out of stock.</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#484640]/10 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#89817b] block">Total Networking Reach</span>
                <strong className="text-lg font-bold text-[#484640]">Unlimited Contact Sharing</strong>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#f3ddd6] text-[#995b40] flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
