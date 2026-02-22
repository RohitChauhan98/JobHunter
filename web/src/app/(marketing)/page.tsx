import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Brain,
  Keyboard,
  Globe,
  User,
  FileText,
  BarChart3,
  ArrowRight,
  Check,
  Sparkles,
  Zap,
  Clock,
  Shield,
} from 'lucide-react';

import { AnimatedSection } from '@/components/marketing/AnimatedSection';
import { TypingDemo } from '@/components/marketing/TypingDemo';

export const metadata: Metadata = {
  title: 'JobHunter — AI-Powered Job Application Assistant',
  description:
    'Stop writing the same answers over and over. JobHunter uses AI to generate personalized, context-aware answers for every job application — in one click.',
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const features = [
  {
    icon: Brain,
    title: 'AI Smart Answers',
    description:
      'Generate contextual, personalized answers for every application question. The AI understands the job, company, and your experience.',
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    icon: Keyboard,
    title: '@Shortcuts',
    description:
      'Type @ in any field to instantly fill it from your profile. @email, @phone, @linkedin — 15+ shortcuts at your fingertips.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Globe,
    title: 'Multi-Platform',
    description:
      'Works on Lever, Greenhouse, Workday, Wellfound, Ashby, SmartRecruiters, and any other job site.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: User,
    title: 'Smart Profile',
    description:
      'Store your experience, education, skills, and custom Q&A once. Use them across every application automatically.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: FileText,
    title: 'Resume Manager',
    description:
      'Upload, manage, and attach resumes with drag-and-drop. Keep multiple versions for different roles.',
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    icon: BarChart3,
    title: 'Web Dashboard',
    description:
      'Full-featured dashboard to manage your profile, configure AI providers, and review your Q&A library.',
    gradient: 'from-rose-500 to-red-500',
  },
];

const steps = [
  {
    num: '01',
    title: 'Create Your Profile',
    description:
      'Set up your experience, skills, education, and custom Q&A in the web dashboard. Import from your resume or fill in manually.',
    icon: User,
  },
  {
    num: '02',
    title: 'Visit Any Job Site',
    description:
      'Browse job listings on Lever, Greenhouse, Workday, or any other supported platform. JobHunter activates automatically.',
    icon: Globe,
  },
  {
    num: '03',
    title: 'Click ✨ Generate',
    description:
      'A Generate button appears next to every question. Click it and the AI crafts a perfect, personalized answer in seconds.',
    icon: Sparkles,
  },
];

const platforms = [
  { name: 'Lever', color: 'text-green-400' },
  { name: 'Greenhouse', color: 'text-emerald-400' },
  { name: 'Workday', color: 'text-blue-400' },
  { name: 'Wellfound', color: 'text-orange-400' },
  { name: 'Ashby', color: 'text-purple-400' },
  { name: 'SmartRecruiters', color: 'text-cyan-400' },
];

const stats = [
  { value: '6+', label: 'Platforms Supported', icon: Globe },
  { value: '<30s', label: 'Per Answer', icon: Clock },
  { value: '15+', label: '@Shortcuts', icon: Zap },
  { value: '100%', label: 'Free & Open Source', icon: Shield },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  return (
    <>
      {/* ============================================================ */}
      {/* HERO                                                         */}
      {/* ============================================================ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute inset-0 dot-grid opacity-60" />

        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] animate-pulse-glow [animation-delay:2s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] animate-float-slow" />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-24 pb-20">
          {/* Badge */}
          <AnimatedSection delay={0}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              Free & Open Source Chrome Extension
            </div>
          </AnimatedSection>

          {/* Headline */}
          <AnimatedSection delay={100}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-6">
              Land Your Dream Job
              <br />
              <span className="gradient-text">Faster.</span>
            </h1>
          </AnimatedSection>

          {/* Subtitle */}
          <AnimatedSection delay={200}>
            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Stop writing the same answers over and over. JobHunter uses AI to
              generate personalized, context-aware answers for every job
              application — <span className="text-white font-medium">in one click</span>.
            </p>
          </AnimatedSection>

          {/* CTAs */}
          <AnimatedSection delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <Link
                href="/guide#installation"
                className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold px-8 py-4 rounded-full text-lg transition-all hover:shadow-xl hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="w-5 h-5" />
                Install Free Extension
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/guide"
                className="inline-flex items-center gap-2 text-slate-300 hover:text-white font-medium px-8 py-4 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-lg"
              >
                Read the Guide
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </AnimatedSection>

          {/* Trust badges */}
          <AnimatedSection delay={400}>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
              {['Free forever', 'No credit card', 'Open source'].map((text) => (
                <span key={text} className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  {text}
                </span>
              ))}
            </div>
          </AnimatedSection>

          {/* Demo */}
          <AnimatedSection delay={500} className="mt-16">
            <TypingDemo />
          </AnimatedSection>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-slate-950 to-transparent" />
      </section>

      {/* ============================================================ */}
      {/* PLATFORMS BAR                                                 */}
      {/* ============================================================ */}
      <section className="relative py-16 bg-slate-950 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <AnimatedSection>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-8">
              Works on all major job platforms
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {platforms.map((p) => (
                <span
                  key={p.name}
                  className={`text-lg font-semibold ${p.color} opacity-60 hover:opacity-100 transition-opacity`}
                >
                  {p.name}
                </span>
              ))}
              <span className="text-lg font-semibold text-slate-400 opacity-60">
                + more
              </span>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FEATURES GRID                                                */}
      {/* ============================================================ */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Supercharge Your{' '}
              <span className="gradient-text">Job Search</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Everything you need to apply faster, smarter, and stand out from
              the crowd.
            </p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <AnimatedSection key={f.title} delay={i * 100}>
                <div className="group glass-card rounded-2xl p-7 h-full transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:shadow-xl transition-shadow`}
                  >
                    <f.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">
                    {f.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="text-center mt-12">
            <Link
              href="/features"
              className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Explore all features
              <ArrowRight className="w-4 h-4" />
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* ============================================================ */}
      {/* HOW IT WORKS                                                 */}
      {/* ============================================================ */}
      <section className="relative py-28 bg-slate-900/50">
        <div className="max-w-5xl mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              How It{' '}
              <span className="gradient-text">Works</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Get started in three simple steps. From setup to smart answers in
              under five minutes.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-14 left-[16.7%] right-[16.7%] h-px bg-gradient-to-r from-indigo-500/40 via-purple-500/40 to-pink-500/40" />

            {steps.map((s, i) => (
              <AnimatedSection key={s.num} delay={i * 150}>
                <div className="relative text-center">
                  {/* Step number badge */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-6 relative z-10 shadow-lg shadow-indigo-500/25">
                    <s.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-indigo-400 text-sm font-bold tracking-wider mb-2">
                    STEP {s.num}
                  </div>
                  <h3 className="text-white font-bold text-xl mb-3">
                    {s.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
                    {s.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SHORTCUTS SHOWCASE                                           */}
      {/* ============================================================ */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <AnimatedSection direction="left">
              <div className="text-indigo-400 text-sm font-bold tracking-wider mb-3">
                INSTANT FILL
              </div>
              <h2 className="text-4xl font-bold tracking-tight mb-4">
                <span className="gradient-text">@Shortcuts</span> — Fill Fields
                in a Flash
              </h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Type <span className="text-white font-mono bg-white/10 px-2 py-0.5 rounded">@</span> in
                any input field and a smart dropdown appears with all your
                profile data. Navigate with keyboard, press Enter, done.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  '@email', '@phone', '@linkedin', '@github',
                  '@fullname', '@city', '@company', '@skills',
                ].map((s) => (
                  <div
                    key={s}
                    className="flex items-center gap-2 text-sm text-slate-300 bg-white/5 rounded-lg px-3 py-2 border border-white/5"
                  >
                    <span className="text-indigo-400 font-mono font-medium">
                      {s}
                    </span>
                  </div>
                ))}
              </div>
            </AnimatedSection>

            {/* Mock UI */}
            <AnimatedSection direction="right" delay={200}>
              <div className="glass-card rounded-2xl p-6 glow-indigo">
                {/* Input mock */}
                <label className="block text-slate-400 text-xs font-medium mb-2">
                  LinkedIn Profile URL
                </label>
                <div className="relative">
                  <div className="bg-slate-800/80 border border-white/10 rounded-xl px-4 py-3 text-sm">
                    <span className="text-slate-400">https://linkedin.com/in/</span>
                    <span className="text-indigo-400 font-medium">@</span>
                    <span className="inline-block w-0.5 h-4 bg-indigo-400 align-text-bottom animate-[blink_1s_ease-in-out_infinite]" />
                  </div>

                  {/* Dropdown */}
                  <div className="mt-2 bg-slate-800 border border-white/10 rounded-xl overflow-hidden shadow-xl">
                    {[
                      { cmd: '@linkedin', val: 'linkedin.com/in/johndoe', active: true },
                      { cmd: '@email', val: 'john@example.com', active: false },
                      { cmd: '@location', val: 'San Francisco, CA', active: false },
                    ].map((item) => (
                      <div
                        key={item.cmd}
                        className={`flex items-center justify-between px-4 py-2.5 text-sm ${
                          item.active
                            ? 'bg-indigo-500/15 text-white'
                            : 'text-slate-400 hover:bg-white/5'
                        }`}
                      >
                        <span className="font-mono text-indigo-400 font-medium">
                          {item.cmd}
                        </span>
                        <span className="text-xs text-slate-500 truncate ml-4">
                          {item.val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* STATS                                                        */}
      {/* ============================================================ */}
      <section className="relative py-20 border-y border-white/5 bg-slate-900/30">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <AnimatedSection key={s.label} delay={i * 100}>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <s.icon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-1 gradient-text">
                    {s.value}
                  </div>
                  <div className="text-slate-400 text-sm">{s.label}</div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FINAL CTA                                                    */}
      {/* ============================================================ */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute inset-0 dot-grid opacity-40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-600/15 rounded-full blur-[160px]" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <AnimatedSection>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
              Ready to Land More{' '}
              <span className="gradient-text">Interviews?</span>
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
              Join thousands of job seekers who are saving hours on every
              application. It&apos;s free, it&apos;s open source, and it&apos;s
              waiting for you.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                href="/guide#installation"
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold px-8 py-4 rounded-full text-lg transition-all hover:shadow-xl hover:shadow-indigo-500/25 hover:scale-[1.02]"
              >
                <Sparkles className="w-5 h-5" />
                Get Started — It&apos;s Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </AnimatedSection>

          {/* Support nudge */}
          <AnimatedSection delay={200}>
            <div className="glass-card rounded-2xl p-8 text-center">
              <p className="text-white font-medium mb-2 text-lg">
                ❤️ Love JobHunter?
              </p>
              <p className="text-slate-400 text-sm mb-6">
                This project is free for everyone. If it&apos;s helped you,
                consider supporting its development.
              </p>
              <Link
                href="/donate"
                className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium border border-purple-500/30 rounded-full px-6 py-2.5 hover:bg-purple-500/10 transition-all"
              >
                Support the Project
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
