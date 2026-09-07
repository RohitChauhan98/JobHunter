import Link from 'next/link';
import { Crosshair, Github } from 'lucide-react';

const productLinks = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
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
    <footer className="relative border-t border-border bg-card">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-forest" />

      <div className="mx-auto max-w-6xl px-6 pb-8 pt-14">
        <div className="mb-12 grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-forest text-citrus">
                <Crosshair className="h-4 w-4" strokeWidth={2.5} />
              </div>
              <span className="font-display text-lg font-semibold tracking-tight text-foreground">
                JobHunter
              </span>
            </Link>
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Chrome extension that fills job applications with smart,
              personalized answers. Free and open source.
            </p>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:border-forest hover:text-forest"
            >
              <Github className="h-4 w-4" />
            </a>
          </div>

          <div>
            <h4 className="mb-4 font-display text-sm font-semibold text-foreground">Product</h4>
            <ul className="space-y-3">
              {productLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-forest"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display text-sm font-semibold text-foreground">Resources</h4>
            <ul className="space-y-3">
              {resourceLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-forest"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display text-sm font-semibold text-foreground">Legal</h4>
            <ul className="space-y-3">
              {legalLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-forest"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} JobHunter. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">Built for job seekers everywhere</p>
        </div>
      </div>
    </footer>
  );
}
