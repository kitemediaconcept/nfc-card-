'use client';

import React from 'react';
import { Radio, QrCode, Download, Smartphone, Zap, ShieldCheck, HeartHandshake, Share2 } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: Radio,
      title: 'Instant Contactless Tap',
      description: 'Works with both iPhone and Android. Hold the card near the top of an iPhone or center-back of Android for instant transmission.',
    },
    {
      icon: QrCode,
      title: 'Offline Dynamic QR Backup',
      description: 'High-res vector QR printed directly on every card. Perfect fallback for older phones or quick camera scans from a distance.',
    },
    {
      icon: Download,
      title: '1-Tap Phone Address Book Save',
      description: 'RFC-compliant UTF-8 vCard (.vcf) support allows recipients to download and save your full contact details with one click.',
    },
    {
      icon: Smartphone,
      title: 'Zero App Downloads Needed',
      description: 'Recipients do not need to download or install any app. Your digital business card opens seamlessly in their default web browser.',
    },
    {
      icon: ShieldCheck,
      title: 'Permanent Smart Redirect URL',
      description: 'The physical NFC chip contains a permanent token URL with HTTP 307 routing. Change phone numbers or jobs without buying new cards.',
    },
    {
      icon: Share2,
      title: 'Social & Portfolio Showcases',
      description: 'Connect LinkedIn, WhatsApp, Instagram, YouTube, websites, and upload services or portfolios to win client trust.',
    },
  ];

  return (
    <section id="features" className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-[#faf7f3] border-t border-[#484640]/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-bold tracking-[3px] uppercase text-[#995b40] bg-[#f3ddd6] px-3.5 py-1.5 rounded-full">
            Key Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#484640] mt-4">
            Designed for Modern Professionals
          </h2>
          <p className="text-sm text-[#89817b] mt-2 leading-relaxed">
            Eliminate traditional paper card clutter. Hand over a contactless card that immediately conveys authority, luxury, and technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white p-7 rounded-3xl border border-[#484640]/10 shadow-sm hover:shadow-md hover:border-[#995b40]/30 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#f3ddd6] text-[#995b40] flex items-center justify-center mb-5 shadow-sm">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-[#484640] text-base mb-2">
                  {feat.title}
                </h3>
                <p className="text-xs text-[#89817b] leading-relaxed">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
