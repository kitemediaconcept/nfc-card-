'use client';

import React from 'react';
import { Radio, Layers, Smartphone, Sparkles, Cpu, RefreshCw, BarChart3, Palette } from 'lucide-react';

export default function ServicesSection() {
  const services = [
    {
      icon: Radio,
      title: 'Precision NFC Chip Encoding',
      description:
        'Every card is embedded with certified high-frequency NTAG213/215 microchips programmed with permanent redirect URLs that work with all modern iPhones and Android smartphones.',
      tag: 'Hardware',
    },
    {
      icon: RefreshCw,
      title: 'Zero-Reprint Dynamic Engine',
      description:
        'Update your phone number, designation, company branding, or address anytime from your dashboard. The physical card updates automatically without needing to buy a new one.',
      tag: 'Cloud Platform',
    },
    {
      icon: Palette,
      title: 'Custom Laser Engraving & Print',
      description:
        'Choose from ultra-durable matte PVC, sustainably harvested organic bamboo wood, or laser-etched black stainless steel with your custom enterprise logo.',
      tag: 'Manufacturing',
    },
    {
      icon: BarChart3,
      title: 'Real-Time Contact Analytics',
      description:
        'Track how many times your card has been tapped, which social links are clicked most, and see visitor engagement trends with privacy-conscious analytics.',
      tag: 'Intelligence',
    },
  ];

  return (
    <section id="services" className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-[#484640]/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-bold tracking-[3px] uppercase text-[#995b40] bg-[#f3ddd6] px-3.5 py-1.5 rounded-full">
            Our Services
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#484640] mt-4">
            End-to-End NFC Smart Networking
          </h2>
          <p className="text-sm text-[#89817b] mt-2 leading-relaxed">
            From precision microchip manufacturing to live dynamic profile management, everything you need to leave an unforgettable impression.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-[#faf7f3] p-7 rounded-3xl border border-[#484640]/10 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#995b40]/10 text-[#995b40] flex items-center justify-center mb-5 group-hover:bg-[#995b40] group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#995b40] mb-1 block">
                    {item.tag}
                  </span>
                  <h3 className="font-bold text-[#484640] text-base mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#89817b] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
