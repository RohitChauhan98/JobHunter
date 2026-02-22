import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Sparkles,
  Heart,
  Github,
  ArrowRight,
  Target,
  Lightbulb,
  Users,
  Shield,
  Code2,
  Globe,
} from 'lucide-react';

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
      'Your data stays on your server. API keys never leave your browser. We offer local LLM support for complete privacy.',
  },
  {
    icon: Heart,
    title: 'Free for Everyone',
    description:
      'No paywalls, no premium tiers, no feature limits. Every tool is available to every user, always.',
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
      'Built by job seekers, for job seekers. Feature requests and contributions from the community shape the roadmap.',
  },
];

const timeline = [
  {
    label: 'The Problem',
    description:
      'Spending 30+ minutes on every job application, rewriting the same answers to "Why do you want to work here?" for the hundredth time.',
  },
  {
    label: 'The Idea',
    description:
      'What if AI could understand your experience and the job context, then generate tailored answers in seconds?',
  },
  {
    label: 'The Solution',
    description:
      'JobHunter — a Chrome extension with AI smart answers, @shortcuts, multi-platform support, and a full web dashboard.',
  },
  {
    label: 'The Mission',
    description:
      'Make job hunting less painful for everyone. Free tools, open source code, and a community that helps each other.',
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute inset-0 dot-grid opacity-40" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-6">
              <Target className="w-3.5 h-3.5" />
              Our Story
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4">
              About{' '}
              <span className="gradient-text">JobHunter</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-xl mx-auto">
              We believe finding a job should be about your skills and
              potential — not how many hours you can spend copy-pasting
              the same answers.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Story timeline */}
      <section className="relative pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="space-y-0">
            {timeline.map((item, i) => (
              <AnimatedSection key={item.label} delay={i * 100}>
                <div className="flex gap-6 group">
                  {/* Line & dot */}
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex-shrink-0 mt-1.5 ring-4 ring-slate-950" />
                    {i < timeline.length - 1 && (
                      <div className="w-px flex-1 bg-gradient-to-b from-indigo-500/30 to-transparent min-h-[60px]" />
                    )}
                  </div>
                  {/* Content */}
                  <div className="pb-10">
                    <div className="text-indigo-400 text-xs font-bold tracking-wider uppercase mb-1">
                      {item.label}
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="relative py-24 bg-slate-900/30 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <AnimatedSection className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
              Our Values
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto">
              The principles that guide every decision we make.
            </p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <AnimatedSection key={v.title} delay={i * 100}>
                <div className="glass-card rounded-2xl p-7 h-full hover:scale-[1.02] transition-transform">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/15 to-purple-500/15 flex items-center justify-center mb-5">
                    <v.icon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">
                    {v.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {v.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="relative py-24">
        <div className="max-w-4xl mx-auto px-6">
          <AnimatedSection className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-3">
              Built With Modern Tech
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto">
              A robust, modern stack designed for reliability and extensibility.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
                  className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center hover:bg-white/[0.04] transition-colors"
                >
                  <div className="text-white font-semibold text-sm">
                    {tech.name}
                  </div>
                  <div className="text-slate-500 text-xs mt-0.5">
                    {tech.sub}
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-white mb-4">
              Join the Community
            </h2>
            <p className="text-slate-400 mb-8">
              Whether you want to use JobHunter, contribute code, or just say
              hi — we&apos;d love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/guide#installation"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold px-7 py-3.5 rounded-full hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Get Started
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-slate-300 hover:text-white border border-white/10 hover:border-white/20 px-7 py-3.5 rounded-full transition-all"
              >
                <Github className="w-4 h-4" />
                View on GitHub
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
