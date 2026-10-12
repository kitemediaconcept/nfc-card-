'use client';

import React, { useState } from 'react';
import { Check, ArrowRight, Sparkles, Shield, Zap, Layers } from 'lucide-react';
import { CARD_PRODUCTS, CardMaterial, PlanDuration, PlanTier, SelectedPlanState } from '@/types/pricing';

interface PricingPlansSectionProps {
  selectedPlan: SelectedPlanState | null;
  onSelectPlan: (plan: SelectedPlanState) => void;
}

export default function PricingPlansSection({
  selectedPlan,
  onSelectPlan,
}: PricingPlansSectionProps) {
  // Keep track of which tier is active/highlighted for each card type
  const [activeTiers, setActiveTiers] = useState<Record<CardMaterial, PlanDuration>>({
    pvc: '1-year',
    wooden: '1-year',
    metal: '2-year',
  });

  const handleTierClick = (cardId: CardMaterial, tierDuration: PlanDuration) => {
    setActiveTiers((prev) => ({ ...prev, [cardId]: tierDuration }));
  };

  const handleSelectCardPlan = (cardId: CardMaterial) => {
    const card = CARD_PRODUCTS.find((c) => c.id === cardId);
    if (!card) return;
    const tierDuration = activeTiers[cardId];
    const tier = card.tiers.find((t) => t.duration === tierDuration) || card.tiers[0];

    onSelectPlan({
      cardId,
      cardTitle: card.title,
      tier,
    });

    // Smooth scroll down to customer form
    const formElement = document.getElementById('customer-form-section');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="pricing-plans" className="w-full bg-[#070707] text-white py-20 px-4 sm:px-6 lg:px-8 border-y border-white/10 relative overflow-hidden">
      {/* Subtle background ambient glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#995b40]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-widest uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Select Cards & Choose Your Plan</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Choose Your NFC Smart Card
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Select your preferred card material and subscription plan below. Once selected, your pricing is locked in and you can personalize your digital business profile and generate your instant QR code.
          </p>
        </div>

        {/* 3 Cards Grid - Matching User Screenshot */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {CARD_PRODUCTS.map((card) => {
            const isSelectedCard = selectedPlan?.cardId === card.id;
            const currentSelectedDuration = activeTiers[card.id];
            // Metal card is featured with green border by default, or card is currently selected
            const hasGreenBorder = card.isFeatured || isSelectedCard;

            return (
              <div
                key={card.id}
                className={`relative flex flex-col justify-between rounded-2xl bg-[#0c0c0d] transition-all duration-300 ${
                  hasGreenBorder
                    ? 'border-2 border-emerald-500 shadow-[0_0_35px_rgba(16,185,129,0.18)] ring-1 ring-emerald-500/50'
                    : 'border border-zinc-800/80 hover:border-zinc-700 hover:shadow-xl'
                }`}
              >
                {/* Top Badge (BEST VALUE / ECO FRIENDLY / PREMIUM) */}
                <div className="absolute top-0 right-0">
                  <span
                    className={`inline-block text-[11px] font-black tracking-wider uppercase px-4 py-1.5 rounded-tr-2xl rounded-bl-xl ${
                      card.id === 'metal'
                        ? 'bg-emerald-500 text-black font-extrabold'
                        : 'bg-emerald-500/20 text-emerald-400 border-l border-b border-emerald-500/30'
                    }`}
                  >
                    {card.badge}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-6 sm:p-8 flex-1">
                  {/* Card Title */}
                  <div className="pt-2 pb-6 border-b border-zinc-800/80">
                    <h3 className="text-xl sm:text-2xl font-black tracking-wider text-white uppercase">
                      {card.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      {card.materialDescription}
                    </p>
                  </div>

                  {/* 3 Tiers (1-Year, 2-Year, 3-Year Plan) */}
                  <div className="divide-y divide-zinc-800/80">
                    {card.tiers.map((tier) => {
                      const isTierActive = currentSelectedDuration === tier.duration;
                      return (
                        <div
                          key={tier.duration}
                          onClick={() => handleTierClick(card.id, tier.duration)}
                          className={`py-5 cursor-pointer transition-colors group rounded-xl px-2.5 -mx-2.5 ${
                            isTierActive
                              ? 'bg-zinc-900/90 ring-1 ring-emerald-500/30'
                              : 'hover:bg-zinc-900/40'
                          }`}
                        >
                          {/* Plan Header & Pricing Row */}
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                                  isTierActive
                                    ? 'border-emerald-500 bg-emerald-500'
                                    : 'border-zinc-600 group-hover:border-zinc-400'
                                }`}
                              >
                                {isTierActive && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-black" />
                                )}
                              </div>
                              <span
                                className={`font-bold text-sm sm:text-base ${
                                  isTierActive ? 'text-white' : 'text-zinc-200'
                                }`}
                              >
                                {tier.name}
                              </span>
                            </div>

                            <div className="text-right">
                              <span className="block text-xs text-zinc-500 line-through font-mono">
                                <span className="currency-sym">₹</span>{tier.originalPrice}
                              </span>
                              <span className="block text-base sm:text-lg font-bold text-emerald-400 font-mono">
                                <span className="currency-sym">₹</span>{tier.discountedPrice}
                              </span>
                            </div>
                          </div>

                          {/* Plan Bullets */}
                          <ul className="space-y-1.5 pl-6 text-xs text-zinc-400">
                            {tier.features.map((feature, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 stroke-[2.5]" />
                                <span className={isTierActive ? 'text-zinc-300' : 'text-zinc-400'}>
                                  {feature}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Card Action Button: SELECT PLAN -> */}
                <div className="p-6 sm:p-8 pt-0">
                  <button
                    type="button"
                    onClick={() => handleSelectCardPlan(card.id)}
                    className={`w-full py-3.5 px-5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                      isSelectedCard
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400'
                        : card.id === 'metal'
                        ? 'bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-black border border-emerald-500/40 shadow-sm'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700/80'
                    }`}
                  >
                    <span>
                      {isSelectedCard
                        ? `SELECTED: ${activeTiers[card.id].toUpperCase()} (₹${
                            card.tiers.find((t) => t.duration === activeTiers[card.id])
                              ?.discountedPrice
                          })`
                        : 'SELECT PLAN →'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Informative Guarantee Row */}
        <div className="mt-14 pt-8 border-t border-zinc-800/80 grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-xs text-zinc-400">
          <div className="flex items-center justify-center gap-2.5">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Instant Profile & Permanent NFC Link Generated</span>
          </div>
          <div className="flex items-center justify-center gap-2.5">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Zero Reprint Fees — Update Contact Details Anytime</span>
          </div>
          <div className="flex items-center justify-center gap-2.5">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>100% Smartphone Compatible (iOS & Android)</span>
          </div>
        </div>
      </div>
    </section>
  );
}
