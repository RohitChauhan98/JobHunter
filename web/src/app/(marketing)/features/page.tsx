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
  Sparkles,
  Check,
  Shield,
  Cpu,
  Puzzle,
  Clock,
  Scissors,
  Eye,
  RefreshCw,
} from 'lucide-react';

import { AnimatedSection } from '@/components/marketing/AnimatedSection';

export const metadata: Metadata = {
  title: 'Features — JobHunter',
  description:
    'Discover everything JobHunter can do: AI smart answers, @shortcuts, multi-platform support, profile management, and more.',
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const heroFeatures = [
  {
    icon: Brain,
    title: 'AI Smart Answers',
    subtitle: 'Context-aware responses powered by AI',
    description:
      'JobHunter reads the job posting, company information, and your profile to generate answers that are uniquely tailored to each application. It understands the question context, respects character limits, and outputs clean plain text — no markdown, no citations.',
    highlights: [
      'Reads job description, company info, and question context',
      'References your experience, skills, and custom Q&A library',
      'TF-IDF matching finds the most relevant saved answers',
      'Automatic character limit detection and enforcement',
      'Clean plain-text output — no markdown artifacts',
      'Truncation at sentence boundaries for natural cutoffs',
    ],
    gradient: 'from-indigo-500 to-purple-600',
    bgGlow: 'bg-indigo-600/15',
  },
  {
    icon: Keyboard,
    title: '@Shortcuts System',
    subtitle: 'Instant field filling without AI',
    description:
      'Type @ in any input field and a smart floating dropdown appears with all your profile data. Filter by typing, navigate with keyboard, press Enter to insert. No AI calls needed — works offline and instantly.',
    highlights: [
      '15+ shortcuts: @email, @phone, @linkedin, @github, and more',
      'Real-time filtering as you type after @',
      'Keyboard navigation with arrow keys + Enter',
      'Works in textareas and text inputs',
      'React-compatible value insertion',
      'Customizable from your profile data',
    ],
    gradient: 'from-purple-500 to-pink-500',
    bgGlow: 'bg-purple-600/15',
  },
  {
    icon: Globe,
    title: 'Multi-Platform Support',
    subtitle: 'Works where you apply',
    description:
      'Purpose-built adapters for the most popular Applicant Tracking Systems, plus a generic adapter that works on virtually any job site. The extension automatically detects which platform you\'re on and activates the right adapter.',
    highlights: [
      'Lever — Custom question fields, application fields',
      'Greenhouse — Structured application forms',
      'Workday — Complex multi-step applications',
      'Wellfound (AngelList) — Startup applications',
      'Ashby — Modern ATS forms',
      'SmartRecruiters — Enterprise hiring platforms',
      'Generic adapter for all other job sites',
    ],
    gradient: 'from-blue-500 to-cyan-500',
    bgGlow: 'bg-blue-600/15',
  },
  {
    icon: User,
    title: 'Smart Profile Management',
    subtitle: 'Your data, organized and ready',
    description:
      'A comprehensive profile system with 6 organized tabs: personal info, experience, education, skills, resume, and a beautiful preview card. Everything the AI needs to write great answers.',
    highlights: [
      '6-tab profile: Personal, Experience, Education, Skills, Resume, Preview',
      'Autocomplete skill suggestions from 200+ options',
      'Rich experience entries with descriptions',
      'Custom Q&A library for common questions',
      'Gradient profile preview card',
      'Data syncs with the Chrome extension',
    ],
    gradient: 'from-emerald-500 to-teal-500',
    bgGlow: 'bg-emerald-600/15',
  },
];

const additionalFeatures = [
  {
    icon: Cpu,
    title: 'Multi-Provider AI',
    description: 'OpenAI, Anthropic, OpenRouter, or Local LLM (Ollama). Choose the provider and model that works best for you.',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your data is stored on your own server instance. API keys never leave your browser. Local LLM support for complete privacy.',
  },
  {
    icon: FileText,
    title: 'Resume Management',
    description: 'Drag-and-drop resume upload with file preview. Keep your resume updated and accessible from the dashboard.',
  },
  {
    icon: Scissors,
    title: 'Clean Output',
    description: 'All AI responses are stripped of markdown, citations, bullet points, and formatting. Pure clean text ready for submission.',
  },
  {
    icon: Clock,
    title: 'Character Limits',
    description: 'Automatically detects maxlength attributes and counter text. AI respects limits, truncates at sentence boundaries.',
  },
  {
    icon: Eye,
    title: 'Profile Preview',
    description: 'Beautiful gradient hero card showing your profile at a glance. See how your data looks before it\'s used by the AI.',
  },
  {
    icon: RefreshCw,
    title: 'Auto-Detection',
    description: 'The extension automatically detects form fields, injects Generate buttons, and re-scans when the page changes.',
  },
  {
    icon: Puzzle,
    title: 'Extensible Adapters',
    description: 'Platform-specific adapters with a clean architecture. Easy to add support for new job sites.',
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function FeaturesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute inset-0 dot-grid opacity-40" />
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Full Feature Breakdown
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4">
              Everything You Need to{' '}
              <span className="gradient-text">Apply Smarter</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
              JobHunter is packed with features designed to save you hours on
              every job application. Here&apos;s what&apos;s inside.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Hero features — alternating layout */}
      <section className="relative pb-16">
        <div className="max-w-6xl mx-auto px-6 space-y-28">
          {heroFeatures.map((f, i) => (
            <AnimatedSection key={f.title}>
              <div
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  i % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Text side */}
                <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gradient-to-r ${f.gradient} bg-opacity-10 mb-4`}
                    style={{ background: `linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))` }}
                  >
                    <f.icon className="w-4 h-4 text-indigo-400" />
                    <span className="text-indigo-300 text-sm font-medium">
                      {f.subtitle}
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                    {f.title}
                  </h2>
                  <p className="text-slate-400 leading-relaxed mb-6">
                    {f.description}
                  </p>
                  <ul className="space-y-2.5">
                    {f.highlights.map((h) => (
                      <li
                        key={h}
                        className="flex items-start gap-2.5 text-sm text-slate-300"
                      >
                        <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual side */}
                <div className={i % 2 === 1 ? 'lg:order-1' : ''}>
                  <div className="relative">
                    <div
                      className={`absolute inset-0 ${f.bgGlow} rounded-3xl blur-[60px] scale-90`}
                    />
                    <div className="relative glass-card rounded-2xl p-8 flex items-center justify-center min-h-[280px]">
                      <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${f.gradient} flex items-center justify-center shadow-2xl`}>
                        <f.icon className="w-12 h-12 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Additional features grid */}
      <section className="relative py-28 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedSection className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
              And There&apos;s <span className="gradient-text">More</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Every detail is designed to make your job search faster and less
              painful.
            </p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {additionalFeatures.map((f, i) => (
              <AnimatedSection key={f.title} delay={i * 80}>
                <div className="glass-card rounded-xl p-5 h-full hover:scale-[1.02] hover:-translate-y-0.5 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4">
                    <f.icon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-1.5">
                    {f.title}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
              Convinced?
            </h2>
            <p className="text-slate-400 text-lg mb-8">
              Install JobHunter and start saving hours on every application.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/guide#installation"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold px-7 py-3.5 rounded-full hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/guide"
                className="inline-flex items-center gap-2 text-slate-300 hover:text-white border border-white/10 hover:border-white/20 px-7 py-3.5 rounded-full transition-all"
              >
                Read the Guide
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
