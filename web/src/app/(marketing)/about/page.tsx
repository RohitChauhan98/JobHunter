import type { Metadata } from 'next';
import Link from 'next/link';
import { Github, Shield, Code2, Users, Heart } from 'lucide-react';

import { AnimatedSection } from '@/components/marketing/AnimatedSection';

export const metadata: Metadata = {
  title: 'About — JobHunter',
  description:
    'Learn about JobHunter, the free and open source AI-powered job application assistant.',
};

const values = [
  {
    icon: Shield,
    title: 'Privacy First',
    description:
      'Your data stays on your server. API keys never leave your browser. Local LLM support for complete privacy.',
  },
  {
    icon: Heart,
    title: 'Fair pricing',
    description:
      'Core autofill stays free. Pro unlocks unlimited AI when you need it — no dark patterns.',
  },
  {
    icon: Code2,
    title: 'Open Source',
    description:
      'The entire codebase is open. Inspect it, modify it, contribute to it. Transparency builds trust.',
  },
  {
    icon: Users,
    title: 'Community Driven',
    description:
      'Built by job seekers, for job seekers. Feature requests and contributions shape the roadmap.',
  },
];

const timeline = [
  {
    label: 'The Problem',
    description:
      'Spending 30+ minutes on every job application, rewriting the same answers for the hundredth time.',
  },
  {
    label: 'The Idea',
    description:
      'What if AI could understand your experience and the job context, then draft tailored answers in seconds?',
  },
  {
    label: 'The Solution',
    description:
      'JobHunter — a Chrome extension with smart answers, @shortcuts, multi-platform support, and a web dashboard.',
  },
  {
    label: 'The Mission',
    description:
      'Make job hunting less painful. Free tools, open source code, and a community that helps each other.',
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="pt-32 pb-16">
        <div className="mx-auto max-w-3xl px-6">
          <AnimatedSection>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-forest">About</p>
            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              About JobHunter
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Finding a job should be about your skills and potential — not how many hours you can
              spend copy-pasting the same answers.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="space-y-0">
            {timeline.map((item, i) => (
              <AnimatedSection key={item.label} delay={i * 80}>
                <div className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-forest" />
                    {i < timeline.length - 1 && (
                      <div className="w-px min-h-[56px] flex-1 bg-border" />
                    )}
                  </div>
                  <div className="pb-10">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-forest">
                      {item.label}
                    </p>
                    <p className="leading-relaxed text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card/60 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <AnimatedSection className="mb-12 max-w-xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight">Our values</h2>
            <p className="mt-3 text-muted-foreground">
              Principles that guide every decision we make.
            </p>
          </AnimatedSection>

          <div className="grid gap-8 sm:grid-cols-2">
            {values.map((v, i) => (
              <AnimatedSection key={v.title} delay={i * 80}>
                <div className="border-t-2 border-forest pt-5">
                  <v.icon className="mb-3 h-5 w-5 text-forest" strokeWidth={1.75} />
                  <h3 className="font-display text-lg font-semibold">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {v.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <AnimatedSection className="mb-10 max-w-xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight">Built with</h2>
            <p className="mt-3 text-muted-foreground">
              A modern stack designed for reliability and extensibility.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { name: 'Chrome Extension', sub: 'Manifest V3' },
                { name: 'React 18', sub: 'TypeScript' },
                { name: 'Next.js 14', sub: 'App Router' },
                { name: 'Tailwind CSS', sub: 'Utility-first' },
                { name: 'Node.js', sub: 'Express 4' },
                { name: 'Prisma', sub: 'PostgreSQL' },
                { name: 'OpenAI SDK', sub: 'Multi-provider' },
                { name: 'Vite + Rollup', sub: '3-pass build' },
              ].map((tech) => (
                <div
                  key={tech.name}
                  className="rounded border border-border bg-card px-4 py-3 text-center"
                >
                  <div className="text-sm font-semibold text-foreground">{tech.name}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{tech.sub}</div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="border-t border-border bg-forest py-16 text-card">
        <div className="mx-auto max-w-6xl px-6">
          <AnimatedSection>
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              Join the community
            </h2>
            <p className="mt-3 max-w-lg text-card/75">
              Use JobHunter, contribute code, or say hello — we would love to hear from you.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/guide#installation"
                className="inline-flex items-center justify-center gap-2 rounded bg-citrus px-6 py-3 text-sm font-semibold text-forest hover:opacity-90"
              >
                Get started
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded border border-card/30 px-6 py-3 text-sm font-semibold text-card hover:border-card/60"
              >
                <Github className="h-4 w-4" />
                View on GitHub
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
