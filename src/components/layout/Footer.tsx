'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Radio, QrCode, ArrowUp } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="w-full bg-[#0d0d0f] text-zinc-300 border-t border-zinc-800/80 pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 mb-14">
          {/* Brand Info (2 columns on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href="/"
              className="text-white font-bold text-2xl tracking-tighter flex items-center gap-1.5 focus:outline-none"
            >
              <span className="text-[#995b40]">///</span>
              <span className="font-serif italic text-2xl">tap.</span>
            </Link>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-sm">
              The next-generation contactless digital business card. Share contact numbers, addresses, social profiles, and portfolios instantly with one simple phone tap or QR scan.
            </p>

            <div className="pt-2 flex flex-wrap gap-3 text-[11px] font-semibold text-zinc-400">
              <span className="inline-flex items-center gap-1 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full">
                <Radio className="w-3 h-3 text-emerald-400" />
                <span>NFC ISO 14443A</span>
              </span>
              <span className="inline-flex items-center gap-1 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full">
                <QrCode className="w-3 h-3 text-emerald-400" />
                <span>High-Res Dynamic QR</span>
              </span>
              <span className="inline-flex items-center gap-1 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>SSL Encrypted Redirects</span>
              </span>
            </div>
          </div>

          {/* Column 1: Product */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Product
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('features')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('services')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Services
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('pricing-plans')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Pricing & Plans
                </button>
              </li>
              <li>
                <Link
                  href="/p/alexrivera"
                  target="_blank"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Sample Live Profile
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('how-it-works')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  How NFC Cards Work
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('about')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  About Us
                </button>
              </li>
              <li>
                <a
                  href="mailto:contact@tapnfc.com"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Contact Support
                </a>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Customer Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Admin Management
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Pricing */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Legal & Pricing
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('pricing-plans')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Pricing Policy
                </button>
              </li>
              <li>
                <span className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Refund & Replacement
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© 2026 tap. NFC Digital Business Cards. All rights reserved.</p>

          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
