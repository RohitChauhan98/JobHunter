import Link from 'next/link';
import { Sparkles, Github, Heart } from 'lucide-react';

const productLinks = [
  { href: '/features', label: 'Features' },
  { href: '/guide', label: 'Guide' },
  { href: '/donate', label: 'Support Us' },
];

const resourceLinks = [
  { href: '/guide#installation', label: 'Installation' },
  { href: '/guide#smart-answers', label: 'Smart Answers' },
  { href: '/guide#shortcuts', label: '@Shortcuts' },
  { href: '/guide#dashboard', label: 'Dashboard' },
];

const legalLinks = [
  { href: '/about', label: 'About' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-slate-950">
      {/* Gradient line at top */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">
                Job<span className="text-indigo-400">Hunter</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
              AI-powered Chrome extension that fills job applications with
              smart, personalized answers. Free & open source.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Product</h4>
            <ul className="space-y-3">
              {productLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Resources</h4>
            <ul className="space-y-3">
              {resourceLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Legal</h4>
            <ul className="space-y-3">
              {legalLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} JobHunter. All rights reserved.
          </p>
          <p className="text-slate-500 text-sm flex items-center gap-1.5">
            Made with <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" /> for
            job seekers everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
