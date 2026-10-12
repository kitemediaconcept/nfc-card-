'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight, ArrowLeft, Radio, Sparkles } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#faf7f3]/90 backdrop-blur-md border-b border-[#484640]/10 transition-all">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left Side: Logo */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-[#484640] font-bold text-2xl tracking-tighter flex items-center gap-1.5 focus:outline-none group"
          >
            <span className="text-[#995b40] group-hover:scale-110 transition-transform">///</span>
            <span className="font-serif italic text-2xl">tap.</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-[#89817b]">
            <button
              type="button"
              onClick={() => scrollToSection('services')}
              className="hover:text-[#484640] transition-colors focus:outline-none"
            >
              Services
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="hover:text-[#484640] transition-colors focus:outline-none"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('pricing-plans')}
              className="hover:text-[#995b40] transition-colors focus:outline-none text-[#995b40]"
            >
              Pricing
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('about')}
              className="hover:text-[#484640] transition-colors focus:outline-none"
            >
              About
            </button>
          </nav>
        </div>

        {/* Right Side: Sign In & Get Started Button */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#484640] hover:text-[#995b40] hover:bg-black/5 transition-colors"
          >
            Sign In
          </Link>

          <button
            type="button"
            onClick={() => scrollToSection('pricing-plans')}
            className="px-5 py-2.5 rounded-xl bg-[#995b40] hover:bg-[#814a33] text-white text-xs font-bold shadow-md shadow-[#995b40]/20 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => scrollToSection('pricing-plans')}
            className="px-3.5 py-1.5 rounded-lg bg-[#995b40] text-white text-xs font-bold shadow-sm"
          >
            Get Started
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="p-2 rounded-xl text-[#484640] hover:bg-black/5 focus:outline-none transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation (Phone Responsive) */}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed inset-x-0 top-20 bg-[#faf7f3] border-b border-[#484640]/15 shadow-2xl p-6 animate-in slide-in-from-top-2 duration-200 z-50">
          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="self-start inline-flex items-center gap-1 text-xs font-semibold text-[#89817b] hover:text-[#484640] mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back / Close Menu</span>
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('services')}
              className="text-left py-2.5 px-3 rounded-xl hover:bg-black/5 text-sm font-bold text-[#484640] transition-colors"
            >
              Services
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="text-left py-2.5 px-3 rounded-xl hover:bg-black/5 text-sm font-bold text-[#484640] transition-colors"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('pricing-plans')}
              className="text-left py-2.5 px-3 rounded-xl bg-[#f3ddd6] text-sm font-bold text-[#995b40] transition-colors flex items-center justify-between"
            >
              <span>Pricing & Plans</span>
              <Sparkles className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('about')}
              className="text-left py-2.5 px-3 rounded-xl hover:bg-black/5 text-sm font-bold text-[#484640] transition-colors"
            >
              About
            </button>

            <div className="pt-4 border-t border-[#484640]/10 flex flex-col gap-2.5">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl border border-[#484640]/15 text-center text-xs font-bold text-[#484640] hover:bg-black/5 transition-colors"
              >
                Sign In to Account
              </Link>
              <button
                type="button"
                onClick={() => scrollToSection('pricing-plans')}
                className="w-full py-3 rounded-xl bg-[#995b40] text-white text-center text-xs font-bold shadow-md shadow-[#995b40]/25 transition-all"
              >
                Get Started with Smart Card
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
