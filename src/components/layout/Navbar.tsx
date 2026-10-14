'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-5 z-50 w-full px-4 sm:px-8 transition-all">
      <div className="w-full max-w-5xl mx-auto h-14 px-6 rounded-2xl bg-white/90 backdrop-blur-md border border-neutral-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex items-center justify-between">
        {/* Left: NFC Card brand matching reference */}
        <Link
          href="/"
          className="text-neutral-900 font-bold text-base tracking-tight hover:opacity-80 transition-opacity"
        >
          NFC Card
        </Link>

        {/* Right Desktop: Features & Pricing */}
        <nav className="hidden sm:flex items-center gap-8 text-sm font-medium text-neutral-600">
          <button
            type="button"
            onClick={() => scrollTo('features')}
            className="hover:text-neutral-950 transition-colors focus:outline-none"
          >
            Features
          </button>
          <button
            type="button"
            onClick={() => scrollTo('pricing')}
            className="hover:text-neutral-950 transition-colors focus:outline-none"
          >
            Pricing
          </button>
        </nav>

        {/* Mobile menu toggle */}
        <div className="flex sm:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
            className="p-1.5 text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed inset-x-4 top-20 bg-white/95 backdrop-blur-xl border border-neutral-200 rounded-2xl shadow-xl p-4 flex flex-col gap-3 z-50">
          <button
            type="button"
            onClick={() => scrollTo('features')}
            className="text-left py-2 px-3 rounded-lg hover:bg-neutral-50 text-sm font-medium text-neutral-800"
          >
            Features
          </button>
          <button
            type="button"
            onClick={() => scrollTo('pricing')}
            className="text-left py-2 px-3 rounded-lg hover:bg-neutral-50 text-sm font-medium text-neutral-800"
          >
            Pricing
          </button>
          <button
            type="button"
            onClick={() => scrollTo('customer-form-section')}
            className="text-left py-2 px-3 rounded-lg bg-neutral-950 text-white text-sm font-medium"
          >
            Activate Card
          </button>
        </div>
      )}
    </header>
  );
}
