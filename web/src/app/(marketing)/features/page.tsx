import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Brain,
  Keyboard,
  Globe,
  User,
  FileText,
  ArrowRight,
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

const heroFeatures = [
  {
    icon: Brain,
    title: 'AI Smart Answers',
    subtitle: 'Context-aware responses',
    description:
      'JobHunter reads the job posting, company information, and your profile to generate answers tailored to each application. It respects character limits and outputs clean plain text.',
    highlights: [
      'Reads job description, company info, and question context',
      'References your experience, skills, and custom Q&A library',
      'TF-IDF matching finds the most relevant saved answers',
      'Automatic character limit detection and enforcement',
      'Clean plain-text output — no markdown artifacts',
      'Truncation at sentence boundaries for natural cutoffs',
    ],
  },
  {
    icon: Keyboard,
    title: '@Shortcuts System',
    subtitle: 'Instant field filling',
    description:
      'Type @ in any input field and a floating dropdown appears with your profile data. Filter by typing, navigate with keyboard, press Enter to insert. Works offline and instantly.',
    highlights: [
      '15+ shortcuts: @email, @phone, @linkedin, @github, and more',
      'Real-time filtering as you type after @',
      'Keyboard navigation with arrow keys + Enter',
      'Works in textareas and text inputs',
      'React-compatible value insertion',
      'Customizable from your profile data',
    ],
  },
  {
    icon: Globe,
    title: 'Multi-Platform Support',
    subtitle: 'Works where you apply',
    description:
      'Purpose-built adapters for popular ATS platforms, plus a generic adapter for other job sites. The extension detects the platform and activates the right adapter.',
    highlights: [
      'Lever — Custom question fields, application fields',
      'Greenhouse — Structured application forms',
      'Workday — Complex multi-step applications',
      'Wellfound (AngelList) — Startup applications',
      'Ashby — Modern ATS forms',
      'SmartRecruiters — Enterprise hiring platforms',
      'Generic adapter for all other job sites',
    ],
  },
  {
    icon: User,
    title: 'Smart Profile Management',
    subtitle: 'Your data, organized and ready',
    description:
      'A comprehensive profile with personal info, experience, education, skills, resume, and preview. Everything the AI needs to write useful answers.',
    highlights: [
      'Tabs for Personal, Experience, Education, Skills, Resume, Preview',
      'Autocomplete skill suggestions from 200+ options',
      'Rich experience entries with descriptions',
      'Custom Q&A library for common questions',
      'Profile preview before the AI uses your data',
      'Data syncs with the Chrome extension',
    ],
  },
];

const additionalFeatures = [
  {
    icon: Cpu,
    title: 'Multi-Provider AI',
    description:
      'OpenAI, Anthropic, OpenRouter, or Local LLM (Ollama). Choose the provider and model that works best for you.',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description:
      'Your data is stored on your own server instance. API keys never leave your browser. Local LLM support for complete privacy.',
  },
  {
    icon: FileText,
    title: 'Resume Management',
    description:
      'Drag-and-drop resume upload with file preview. Keep your resume updated and accessible from the dashboard.',
  },
  {
    icon: Scissors,
    title: 'Clean Output',
    description:
      'All AI responses are stripped of markdown, citations, and formatting. Pure clean text ready for submission.',
  },
  {
    icon: Clock,
    title: 'Character Limits',
    description:
      'Automatically detects maxlength attributes and counter text. AI respects limits, truncates at sentence boundaries.',
  },
  {
    icon: Eye,
    title: 'Profile Preview',
    description:
      'See how your profile looks at a glance before it is used by the AI or the extension.',
  },
  {
    icon: RefreshCw,
    title: 'Auto-Detection',
    description:
      'The extension automatically detects form fields, injects Generate buttons, and re-scans when the page changes.',
  },
  {
    icon: Puzzle,
    title: 'Extensible Adapters',
    description:
      'Platform-specific adapters with a clean architecture. Easy to add support for new job sites.',
  },
];

export default function FeaturesPage() {
  return (
    <>
      <section className="pt-32 pb-16">
        <div className="mx-auto max-w-3xl px-6">
          <AnimatedSection>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-forest">
              Features
            </p>
            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Everything you need to apply smarter
            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Tools designed to save hours on every application — without taking
              over the submit button.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-6xl space-y-24 px-6">
          {heroFeatures.map((f, i) => (
            <AnimatedSection key={f.title}>
              <div className={`grid items-start gap-10 lg:grid-cols-2 ${i % 2 === 1 ? '' : ''}`}>
                <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-forest">
                    {f.subtitle}
                  </p>
                  <h2 className="font-display text-3xl font-semibold tracking-tight">
                    {f.title}
                  </h2>
                  <p className="mt-4 leading-relaxed text-muted-foreground">{f.description}</p>
                  <ul className="mt-6 space-y-2.5">
                    {f.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2.5 text-sm text-foreground/80">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={i % 2 === 1 ? 'lg:order-1' : ''}>
                  <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-border bg-card">
                    <div className="flex h-16 w-16 items-center justify-center rounded bg-forest text-citrus">
                      <f.icon className="h-8 w-8" strokeWidth={1.75} />
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card/60 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <AnimatedSection className="mb-12 max-w-xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight">And more</h2>
            <p className="mt-3 text-muted-foreground">
              Details that make the job search faster and less painful.
            </p>
          </AnimatedSection>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {additionalFeatures.map((f, i) => (
              <AnimatedSection key={f.title} delay={i * 60}>
                <div className="border-t-2 border-forest pt-4">
                  <f.icon className="mb-3 h-5 w-5 text-forest" strokeWidth={1.75} />
                  <h3 className="font-display text-sm font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {f.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-forest py-16 text-card">
        <div className="mx-auto max-w-6xl px-6">
          <AnimatedSection>
            <h2 className="font-display text-3xl font-semibold tracking-tight">Convinced?</h2>
            <p className="mt-3 max-w-lg text-card/75">
              Install JobHunter and start saving hours on every application.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/guide#installation"
                className="inline-flex items-center justify-center gap-2 rounded bg-citrus px-6 py-3 text-sm font-semibold text-forest hover:opacity-90"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/guide"
                className="inline-flex items-center justify-center gap-2 rounded border border-card/30 px-6 py-3 text-sm font-semibold text-card hover:border-card/60"
              >
                Read the guide
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
