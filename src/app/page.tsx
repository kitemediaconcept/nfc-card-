'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import PricingPlansSection from '@/components/home/PricingPlansSection';
import QuickCustomerCardCreator from '@/components/home/QuickCustomerCardCreator';
import ServicesSection from '@/components/home/ServicesSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import AboutSection from '@/components/home/AboutSection';
import { SelectedPlanState } from '@/types/pricing';
import {
  Radio,
  QrCode,
  Download,
  Smartphone,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function LandingPage() {
  // State for the card plan chosen by customer
  const [selectedPlan, setSelectedPlan] = useState<SelectedPlanState | null>(null);

  const handleSelectPlan = (plan: SelectedPlanState) => {
    setSelectedPlan(plan);
  };

  const handleChangePlan = () => {
    const el = document.getElementById('pricing-plans');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#faf7f3] text-[#484640] font-sans selection:bg-[#995b40] selection:text-white flex flex-col justify-between">
      {/* 1. STICKY TOP NAVBAR (Left logo, Services, Features, Pricing, About, Sign In, Get Started, Mobile Drawer) */}
      <Navbar />

      <main className="w-full flex-1">
        {/* 2. HERO SECTION (Full-width with 3D interactive tilt hero card) */}
        <HeroSection />

        {/* 3. SELECT CARDS & PRICING PLANS SECTION (PVC Card, Wooden Card, Metal Card with 1, 2, 3-Yr Tiers) */}
        <PricingPlansSection
          selectedPlan={selectedPlan}
          onSelectPlan={handleSelectPlan}
        />

        {/* 4. CUSTOMER DETAILS & NFC QR GENERATOR (Gated until plan selected as requested) */}
        <section
          id="customer-form-section"
          className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20"
        >
          <QuickCustomerCardCreator
            selectedPlan={selectedPlan}
            onChangePlan={handleChangePlan}
          />
        </section>

        {/* 5. SERVICES SECTION */}
        <ServicesSection />

        {/* 6. FEATURES SECTION */}
        <FeaturesSection />

        {/* 7. HOW IT WORKS SECTION (Workflow Guide) */}
        <section id="how-it-works" className="w-full py-16 sm:py-24 bg-white/70 border-t border-[#484640]/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-[11px] font-bold tracking-[3px] uppercase text-[#995b40] bg-[#f3ddd6] px-3.5 py-1.5 rounded-full">
                Step-by-Step Flow
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#484640] mt-4">
                How Your NFC Digital Card Works
              </h2>
              <p className="text-sm text-[#89817b] mt-2 leading-relaxed">
                Seamless contactless technology with permanent smart redirects and instant smartphone contact saving.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Step 1 */}
              <div className="bg-[#faf7f3] p-6 rounded-3xl border border-[#484640]/10 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-[#995b40] text-white font-bold text-sm flex items-center justify-center mb-4 shadow-md shadow-[#995b40]/20">
                    1
                  </div>
                  <h3 className="font-bold text-[#484640] text-base mb-1">
                    1. Choose Card & Plan
                  </h3>
                  <p className="text-xs text-[#89817b] leading-relaxed">
                    Select your material (PVC, Wooden, or Metal) and subscription length (1, 2, or 3 years).
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#484640]/10 text-[11px] text-[#995b40] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Locked-in discounted rates</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-[#faf7f3] p-6 rounded-3xl border border-[#484640]/10 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-[#57504a] text-white font-bold text-sm flex items-center justify-center mb-4 shadow-md">
                    2
                  </div>
                  <h3 className="font-bold text-[#484640] text-base mb-1">
                    2. Add Customer Details
                  </h3>
                  <p className="text-xs text-[#89817b] leading-relaxed">
                    Enter your name, job title, company, phone, WhatsApp, email, and office address.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#484640]/10 text-[11px] text-[#57504a] font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Instant live profile link</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-[#faf7f3] p-6 rounded-3xl border border-[#484640]/10 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-[#8c7e74] text-white font-bold text-sm flex items-center justify-center mb-4 shadow-md">
                    3
                  </div>
                  <h3 className="font-bold text-[#484640] text-base mb-1">
                    3. Get QR Code & NFC URL
                  </h3>
                  <p className="text-xs text-[#89817b] leading-relaxed">
                    Download high-res PNG or vector SVG QR codes and receive your permanent redirect URL (<code className="font-mono text-[#995b40]">/c/{'{token}'}</code>).
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#484640]/10 text-[11px] text-[#8c7e74] font-semibold flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Ready for printing & chip write</span>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-[#faf7f3] p-6 rounded-3xl border border-[#484640]/10 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-[#c5b3a4] text-[#45403e] font-bold text-sm flex items-center justify-center mb-4 shadow-md">
                    4
                  </div>
                  <h3 className="font-bold text-[#484640] text-base mb-1">
                    4. One-Tap Phone Contact Save
                  </h3>
                  <p className="text-xs text-[#89817b] leading-relaxed">
                    Recipients tap the card to their phone to view the profile and download your full vCard (.vcf) with zero app downloads.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#484640]/10 text-[11px] text-[#995b40] font-semibold flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" />
                  <span>Works on iPhone & Android</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. ABOUT SECTION */}
        <AboutSection />

        {/* 9. PERMANENT NFC FEATURE HIGHLIGHT BANNER */}
        <section className="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div
            className="text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(115deg, #18181b 0%, #27272a 50%, #09090b 100%)',
            }}
          >
            <div className="max-w-3xl relative z-10 space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-[2px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                Permanent NFC Technology
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                Change Details Anytime Without Replacing Cards
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                When you write your permanent card URL to the NFC chip or print your QR code, it points to our high-speed HTTP 307 redirect engine. If you update your phone number, change your office address, or redesign your branding, the physical card and printed QR code continue working smoothly without ever replacing the physical hardware!
              </p>

              <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-zinc-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Zero card replacement costs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Live draft vs publish controls</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>RFC-compliant UTF-8 vCard (.vcf)</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 10. COMPREHENSIVE FULL-WIDTH FOOTER (Product, Company, Legal, Contact) */}
      <Footer />
    </div>
  );
}
