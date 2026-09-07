import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Brain, Keyboard, Globe, User } from 'lucide-react';

import { AnimatedSection } from '@/components/marketing/AnimatedSection';
import { TypingDemo } from '@/components/marketing/TypingDemo';

export const metadata: Metadata = {
  title: 'JobHunter — Apply faster with your profile and AI',
  description:
    'Store your profile once. Auto-fill applications on Greenhouse, Lever, Workday, and more — with smart answers when you need them.',
};

const features = [
  {
    icon: Brain,
    title: 'Smart answers',
    description:
      'Generate contextual answers from your experience and the job description — then edit before you submit.',
  },
  {
    icon: Keyboard,
    title: '@Shortcuts',
    description:
      'Type @ in any field to pull email, phone, LinkedIn, and more from your saved profile.',
  },
  {
    icon: Globe,
    title: 'Major ATS platforms',
    description:
      'Works on Lever, Greenhouse, Workday, Ashby, Wellfound, SmartRecruiters, and generic forms.',
  },
  {
    icon: User,
    title: 'One reusable profile',
    description:
      'Experience, education, skills, and Q&A live once — reused across every application.',
  },
];

const steps = [
  {
    num: '01',
    title: 'Build your profile',
    description:
      'Add experience, skills, and answers in the dashboard. Import from a resume or enter them by hand.',
  },
  {
    num: '02',
    title: 'Open any job site',
    description:
      'Browse listings on supported platforms. JobHunter detects the form automatically.',
  },
  {
    num: '03',
    title: 'Fill and review',
    description:
      'Auto-fill fields, generate essay answers when needed, then submit yourself.',
  },
];

const platforms = ['Lever', 'Greenhouse', 'Workday', 'Wellfound', 'Ashby', 'SmartRecruiters'];

export default function LandingPage() {
  return (
    <>
      {/* Hero — brand, headline, support, CTAs, product mock */}
      <section className="relative overflow-hidden pt-28 pb-16 md:pt-32 md:pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <AnimatedSection delay={0}>
              <p className="mb-4 font-display text-sm font-semibold uppercase tracking-[0.2em] text-forest">
                JobHunter
              </p>
            </AnimatedSection>

            <AnimatedSection delay={80}>
              <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl leading-[1.05]">
                Apply once.
                <br />
                Reuse everything.
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={160}>
              <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
                Your profile fills the form. AI drafts the hard questions. You review and submit.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={240}>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/guide#installation"
                  className="inline-flex items-center gap-2 rounded bg-forest px-6 py-3 text-sm font-semibold text-citrus transition-colors hover:bg-forest-mid"
                >
                  Install the extension
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/guide"
                  className="inline-flex items-center gap-2 rounded border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-forest"
                >
                  Read the guide
                </Link>
              </div>
            </AnimatedSection>
          </div>

          <AnimatedSection delay={360} className="mt-14 md:mt-16">
            <TypingDemo />
          </AnimatedSection>
        </div>
      </section>

      {/* Platforms */}
      <section className="border-y border-border bg-card/60 py-12">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <AnimatedSection>
            <p className="mb-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Works where you apply
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {platforms.map((name) => (
                <span key={name} className="font-display text-base font-semibold text-foreground/70">
                  {name}
                </span>
              ))}
              <span className="text-sm text-muted-foreground">+ more</span>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <AnimatedSection className="mb-14 max-w-xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Three steps to a filled form
            </h2>
            <p className="mt-3 text-muted-foreground">
              Semi-automated on purpose — you stay in control of what gets submitted.
            </p>
          </AnimatedSection>

          <div className="grid gap-10 md:grid-cols-3">
            {steps.map((s, i) => (
              <AnimatedSection key={s.num} delay={i * 100}>
                <div className="border-t-2 border-forest pt-5">
                  <p className="font-display text-sm font-semibold text-forest">{s.num}</p>
                  <h3 className="mt-2 font-display text-xl font-semibold text-foreground">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {s.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* @Shortcuts */}
      <section className="border-y border-border bg-card/50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <AnimatedSection direction="left">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-forest">
                Instant fill
              </p>
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                @Shortcuts for every field
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Type{' '}
                <span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-sm text-foreground">
                  @
                </span>{' '}
                in any input. Pick from your profile with the keyboard and press Enter.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-2">
                {['@email', '@phone', '@linkedin', '@github', '@fullname', '@city', '@company', '@skills'].map(
                  (s) => (
                    <span
                      key={s}
                      className="rounded border border-border bg-background px-3 py-2 font-mono text-sm text-forest"
                    >
                      {s}
                    </span>
                  ),
                )}
              </div>
            </AnimatedSection>

            <AnimatedSection direction="right" delay={150}>
              <div className="rounded-lg border border-border bg-background p-5">
                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                  LinkedIn Profile URL
                </label>
                <div className="rounded border border-forest bg-card px-4 py-3 text-sm ring-2 ring-citrus/30">
                  <span className="text-muted-foreground">https://linkedin.com/in/</span>
                  <span className="font-medium text-forest">@</span>
                  <span className="ml-0.5 inline-block h-4 w-0.5 bg-forest align-middle animate-[blink_1s_ease-in-out_infinite]" />
                </div>
                <div className="mt-2 overflow-hidden rounded border border-border bg-card">
                  {[
                    { cmd: '@linkedin', val: 'linkedin.com/in/jordanlee', active: true },
                    { cmd: '@email', val: 'jordan@example.com', active: false },
                    { cmd: '@location', val: 'San Francisco, CA', active: false },
                  ].map((item) => (
                    <div
                      key={item.cmd}
                      className={`flex items-center justify-between px-4 py-2.5 text-sm ${
                        item.active ? 'bg-forest/10 text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      <span className="font-mono font-medium text-forest">{item.cmd}</span>
                      <span className="ml-4 truncate text-xs">{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Features — editorial list, not card grid */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <AnimatedSection className="mb-14 max-w-xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              What you get
            </h2>
            <p className="mt-3 text-muted-foreground">
              Tools for speed — without handing over the submit button.
            </p>
          </AnimatedSection>

          <div className="divide-y divide-border border-y border-border">
            {features.map((f, i) => (
              <AnimatedSection key={f.title} delay={i * 80}>
                <div className="grid gap-4 py-8 sm:grid-cols-[140px_1fr] sm:gap-10">
                  <div className="flex items-center gap-2 text-forest">
                    <f.icon className="h-5 w-5" strokeWidth={1.75} />
                    <span className="font-display text-sm font-semibold sm:hidden">{f.title}</span>
                  </div>
                  <div>
                    <h3 className="hidden font-display text-lg font-semibold text-foreground sm:block">
                      {f.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed sm:mt-1">{f.description}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="mt-10">
            <Link
              href="/features"
              className="inline-flex items-center gap-2 text-sm font-semibold text-forest transition-colors hover:text-forest-mid"
            >
              Explore all features
              <ArrowRight className="h-4 w-4" />
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-border bg-forest py-20 text-citrus">
        <div className="mx-auto max-w-6xl px-6">
          <AnimatedSection>
            <div className="max-w-xl">
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl text-card">
                Ready to apply faster?
              </h2>
              <p className="mt-3 text-card/75">
                Free, open source, and built for people who still want to review before they hit
                submit.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/guide#installation"
                  className="inline-flex items-center justify-center gap-2 rounded bg-citrus px-6 py-3 text-sm font-semibold text-forest transition-opacity hover:opacity-90"
                >
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 rounded border border-card/30 px-6 py-3 text-sm font-semibold text-card transition-colors hover:border-card/60"
                >
                  View pricing
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
