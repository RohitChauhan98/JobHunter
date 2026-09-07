'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Crosshair } from 'lucide-react';

const navLinks = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/guide', label: 'Guide' },
  { href: '/about', label: 'About' },
  { href: '/donate', label: 'Support' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-border bg-card/95 backdrop-blur-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-forest text-citrus">
            <Crosshair className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <span className="font-display text-xl font-semibold tracking-tight text-foreground">
            JobHunter
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="link-citrus px-3 py-2 text-sm font-medium text-muted-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="link-citrus px-3 py-2 text-sm font-medium text-muted-foreground"
          >
            Log in
          </Link>
          <Link
            href="/dashboard"
            className="rounded bg-forest px-4 py-2 text-sm font-semibold text-citrus transition-colors hover:bg-forest-mid"
          >
            Dashboard
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded p-2 text-foreground hover:bg-secondary md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={`overflow-hidden border-b border-border bg-card transition-all duration-300 md:hidden ${
          mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 border-none'
        }`}
      >
        <div className="space-y-1 px-6 pb-6 pt-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-3 flex gap-3 border-t border-border pt-3">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="flex-1 rounded border border-border py-2.5 text-center text-sm font-medium text-foreground"
            >
              Log in
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex-1 rounded bg-forest py-2.5 text-center text-sm font-semibold text-citrus"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
