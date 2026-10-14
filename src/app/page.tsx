'use client';

import React from 'react';
import NFCInteractiveShowcase from '@/components/home/NFCInteractiveShowcase';

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-white text-[#111] font-sans antialiased">
      <NFCInteractiveShowcase />
    </div>
  );
}
