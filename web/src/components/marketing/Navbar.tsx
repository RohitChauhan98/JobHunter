'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Sparkles } from 'lucide-react';

const navLinks = [
  { href: '/features', label: 'Features' },
  { href: '/guide', label: 'Guide' },
  { href: '/about', label: 'About' },
  { href: '/donate', label: 'Support Us', highlight: true },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass-nav border-b border-white/10 shadow-lg shadow-black/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">
            Job<span className="text-indigo-400">Hunter</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                link.highlight
                  ? 'text-purple-300 hover:text-purple-200 hover:bg-purple-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-slate-300 hover:text-white px-4 py-2 text-sm font-medium transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/dashboard"
            className="relative group bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all hover:shadow-lg hover:shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98]"
          >
            Dashboard
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="glass-nav border-t border-white/10 px-6 pb-6 pt-2 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                link.highlight
                  ? 'text-purple-300 hover:bg-purple-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-3 pt-3 border-t border-white/10 mt-3">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="flex-1 text-center text-slate-300 hover:text-white py-2.5 rounded-lg border border-white/10 text-sm font-medium"
            >
              Log in
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex-1 text-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2.5 rounded-lg text-sm font-semibold"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
