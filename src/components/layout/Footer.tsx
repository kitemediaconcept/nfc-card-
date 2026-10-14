'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUp } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-white border-t border-neutral-100 py-12 px-6 sm:px-12 mt-16 text-neutral-500 text-xs">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <span className="font-bold text-neutral-900 text-sm">NFC Card</span>
          <span className="text-neutral-300">|</span>
          <span>Contactless Smart Business Cards</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/login" className="hover:text-neutral-900 transition-colors">
            Customer Sign In
          </Link>
          <a href="#features" className="hover:text-neutral-900 transition-colors">
            Features
          </a>
          <a href="#pricing" className="hover:text-neutral-900 transition-colors">
            Pricing
          </a>
          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1 hover:text-neutral-900 transition-colors ml-2"
          >
            <span>Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="max-w-5xl mx-auto text-center sm:text-left mt-6 text-[11px] text-neutral-400">
        © 2026 NFC Card. All rights reserved. Instant one-tap phone networking.
      </div>
    </footer>
  );
}
