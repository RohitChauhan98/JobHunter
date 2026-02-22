import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Download,
  UserPlus,
  Settings,
  Sparkles,
  Keyboard,
  FileText,
  LayoutDashboard,
  Lightbulb,
  ArrowRight,
  Check,
  ChevronRight,
  ExternalLink,
  MonitorSmartphone,
} from 'lucide-react';

import { AnimatedSection } from '@/components/marketing/AnimatedSection';

export const metadata: Metadata = {
  title: 'Guide — JobHunter',
  description:
    'Learn how to set up and use JobHunter to supercharge your job applications with AI-powered smart answers and @shortcuts.',
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const toc = [
  { id: 'installation', label: 'Installation', icon: Download },
  { id: 'account', label: 'Create an Account', icon: UserPlus },
  { id: 'profile', label: 'Set Up Your Profile', icon: Settings },
  { id: 'ai-setup', label: 'Configure AI Provider', icon: Sparkles },
  { id: 'smart-answers', label: 'Using Smart Answers', icon: Sparkles },
  { id: 'shortcuts', label: 'Using @Shortcuts', icon: Keyboard },
  { id: 'resume', label: 'Resume Management', icon: FileText },
  { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
  { id: 'tips', label: 'Tips & Tricks', icon: Lightbulb },
];

const shortcutsList = [
  { cmd: '@email', desc: 'Your email address' },
  { cmd: '@phone', desc: 'Phone number' },
  { cmd: '@fullname', desc: 'Full name (First + Last)' },
  { cmd: '@linkedin', desc: 'LinkedIn profile URL' },
  { cmd: '@github', desc: 'GitHub profile URL' },
  { cmd: '@portfolio', desc: 'Portfolio / personal site' },
  { cmd: '@website', desc: 'Website URL' },
  { cmd: '@city', desc: 'Current city' },
  { cmd: '@state', desc: 'Current state / province' },
  { cmd: '@country', desc: 'Country' },
  { cmd: '@location', desc: 'Full location (City, State, Country)' },
  { cmd: '@company', desc: 'Current / most recent company' },
  { cmd: '@title', desc: 'Current / most recent job title' },
  { cmd: '@school', desc: 'Most recent school' },
  { cmd: '@degree', desc: 'Most recent degree' },
  { cmd: '@skills', desc: 'Comma-separated skills list' },
  { cmd: '@summary', desc: 'Professional summary' },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function GuidePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute inset-0 dot-grid opacity-40" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-6">
              <MonitorSmartphone className="w-3.5 h-3.5" />
              Step-by-Step Guide
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4">
              Get Started with{' '}
              <span className="gradient-text">JobHunter</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
              Everything you need to know to set up your profile, configure AI,
              and start generating smart answers on any job application.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Main content area */}
      <section className="relative pb-28">
        <div className="max-w-7xl mx-auto px-6 flex gap-12">
          {/* Sidebar TOC (sticky, desktop only) */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <p className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-4">
                On this page
              </p>
              <nav className="space-y-1">
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors group"
                  >
                    <item.icon className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0 max-w-3xl">
            {/* ---------------------------------------------------- */}
            {/* 1. Installation                                       */}
            {/* ---------------------------------------------------- */}
            <GuideSection id="installation" title="Installation" icon={Download}>
              <Step n={1}>
                <p>
                  Visit the{' '}
                  <a href="#" className="text-indigo-400 hover:underline">
                    Chrome Web Store listing
                  </a>{' '}
                  for JobHunter (or load the unpacked extension from the GitHub
                  repo for development).
                </p>
              </Step>
              <Step n={2}>
                <p>
                  Click <strong className="text-white">Add to Chrome</strong>{' '}
                  and confirm the permissions dialog.
                </p>
              </Step>
              <Step n={3}>
                <p>
                  The JobHunter icon (
                  <Sparkles className="inline w-4 h-4 text-indigo-400" />) will
                  appear in your browser toolbar. Click it to open the popup.
                </p>
              </Step>
              <Step n={4}>
                <p>
                  Pin the extension for quick access — click the puzzle-piece
                  icon in the toolbar, then the pin next to JobHunter.
                </p>
              </Step>
              <InfoBox>
                <strong>Developer Mode:</strong> To load unpacked, go to{' '}
                <code className="text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded text-xs">
                  chrome://extensions
                </code>
                , enable Developer Mode, click &quot;Load unpacked&quot;, and select the{' '}
                <code className="text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded text-xs">
                  extension/dist
                </code>{' '}
                folder.
              </InfoBox>
            </GuideSection>

            {/* ---------------------------------------------------- */}
            {/* 2. Account                                            */}
            {/* ---------------------------------------------------- */}
            <GuideSection id="account" title="Create an Account" icon={UserPlus}>
              <Step n={1}>
                <p>
                  Open the extension popup and click{' '}
                  <strong className="text-white">Login / Register</strong>, or
                  visit the{' '}
                  <Link href="/register" className="text-indigo-400 hover:underline">
                    registration page
                  </Link>{' '}
                  directly.
                </p>
              </Step>
              <Step n={2}>
                <p>Enter your email and a secure password, then click Register.</p>
              </Step>
              <Step n={3}>
                <p>
                  You&apos;ll be automatically logged in and redirected to the
                  dashboard. Your session syncs with the extension.
                </p>
              </Step>
            </GuideSection>

            {/* ---------------------------------------------------- */}
            {/* 3. Profile                                            */}
            {/* ---------------------------------------------------- */}
            <GuideSection id="profile" title="Set Up Your Profile" icon={Settings}>
              <p className="text-slate-400 leading-relaxed mb-6">
                A complete profile is the foundation for great AI answers. The
                more context you provide, the better the generated responses.
              </p>

              <H4>Personal Information</H4>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Fill in your name, email, phone, location, and social links
                (LinkedIn, GitHub, portfolio). These are also used by
                @shortcuts.
              </p>

              <H4>Work Experience</H4>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Add your work history with company name, title, dates, and
                bullet-point descriptions. The AI uses these to craft
                experience-specific answers.
              </p>

              <H4>Education</H4>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Add degrees, institutions, graduation dates, and relevant
                coursework or achievements.
              </p>

              <H4>Skills</H4>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Use the autocomplete skills input to add technical and soft
                skills. The AI references these when answering &quot;what skills do
                you bring&quot; type questions.
              </p>

              <H4>Custom Q&A</H4>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Pre-write answers to common questions like &quot;Why are you
                looking for a new role?&quot; or &quot;What&apos;s your biggest
                weakness?&quot;. The AI uses TF-IDF matching to find the most
                relevant saved answer and blend it with job-specific context.
              </p>

              <InfoBox>
                <strong>Pro tip:</strong> Write 10-15 custom Q&A pairs covering
                the most common application questions. This dramatically
                improves AI answer quality.
              </InfoBox>
            </GuideSection>

            {/* ---------------------------------------------------- */}
            {/* 4. AI Setup                                           */}
            {/* ---------------------------------------------------- */}
            <GuideSection id="ai-setup" title="Configure AI Provider" icon={Sparkles}>
              <p className="text-slate-400 leading-relaxed mb-6">
                JobHunter supports multiple AI providers. Choose the one that
                works best for you:
              </p>

              <div className="space-y-4 mb-6">
                <ProviderCard
                  name="OpenRouter (Recommended)"
                  description="Aggregates 100+ models including free tier options. Best for getting started — no credit card required."
                  badge="Free Tier Available"
                  badgeColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                />
                <ProviderCard
                  name="OpenAI"
                  description="GPT-4o and GPT-4o-mini. Reliable and fast. Requires an API key with billing enabled."
                  badge="Paid"
                  badgeColor="bg-blue-500/10 text-blue-400 border-blue-500/20"
                />
                <ProviderCard
                  name="Anthropic"
                  description="Claude Sonnet and Haiku models. Excellent at following formatting instructions."
                  badge="Paid"
                  badgeColor="bg-purple-500/10 text-purple-400 border-purple-500/20"
                />
                <ProviderCard
                  name="Local LLM (Ollama)"
                  description="Run models locally for complete privacy. Requires Ollama installed and running."
                  badge="Free / Self-hosted"
                  badgeColor="bg-amber-500/10 text-amber-400 border-amber-500/20"
                />
              </div>

              <Step n={1}>
                <p>Go to the extension&apos;s Options page (right-click icon → Options).</p>
              </Step>
              <Step n={2}>
                <p>
                  Select your preferred AI provider and paste your API key.
                </p>
              </Step>
              <Step n={3}>
                <p>Choose a model (or leave as default for OpenRouter Auto).</p>
              </Step>
            </GuideSection>

            {/* ---------------------------------------------------- */}
            {/* 5. Smart Answers                                      */}
            {/* ---------------------------------------------------- */}
            <GuideSection id="smart-answers" title="Using Smart Answers" icon={Sparkles}>
              <Step n={1}>
                <p>
                  Navigate to any job application page on a supported platform
                  (Lever, Greenhouse, Workday, Wellfound, Ashby,
                  SmartRecruiters, or any site).
                </p>
              </Step>
              <Step n={2}>
                <p>
                  JobHunter automatically detects text fields and injects a{' '}
                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold px-2.5 py-1 rounded-md">
                    ✨ Generate Answer
                  </span>{' '}
                  button next to each question.
                </p>
              </Step>
              <Step n={3}>
                <p>
                  Click the button. The AI reads the question, company info, job
                  description, and your profile, then generates a tailored
                  answer.
                </p>
              </Step>
              <Step n={4}>
                <p>
                  The answer is automatically inserted into the field. Review,
                  edit if needed, and submit your application!
                </p>
              </Step>

              <InfoBox>
                <strong>Character limits:</strong> JobHunter automatically detects
                character limits from the form (maxlength attributes and counter
                text). The AI respects these limits, and answers are truncated
                at sentence boundaries if needed.
              </InfoBox>

              <InfoBox>
                <strong>Clean output:</strong> All AI responses are automatically
                stripped of markdown formatting, bullet points, citations, and
                other artifacts. You get clean, plain-text answers ready for
                submission.
              </InfoBox>
            </GuideSection>

            {/* ---------------------------------------------------- */}
            {/* 6. Shortcuts                                          */}
            {/* ---------------------------------------------------- */}
            <GuideSection id="shortcuts" title="Using @Shortcuts" icon={Keyboard}>
              <p className="text-slate-400 leading-relaxed mb-6">
                The @shortcut system lets you instantly fill any input field
                with data from your profile — no AI needed. Just type{' '}
                <code className="text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded text-xs">
                  @
                </code>{' '}
                to trigger the dropdown.
              </p>

              <Step n={1}>
                <p>
                  Click on any text input or textarea on a job application page.
                </p>
              </Step>
              <Step n={2}>
                <p>
                  Type <span className="text-indigo-400 font-mono font-bold">@</span>.
                  A floating dropdown appears with all available shortcuts.
                </p>
              </Step>
              <Step n={3}>
                <p>
                  Type to filter (e.g.,{' '}
                  <code className="text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded text-xs">
                    @lin
                  </code>{' '}
                  shows @linkedin), or use ↑↓ arrow keys to navigate.
                </p>
              </Step>
              <Step n={4}>
                <p>
                  Press <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-xs text-white">Enter</kbd> or
                  click to insert the value. The @ text is replaced with the
                  actual data.
                </p>
              </Step>

              <H4>All Available Shortcuts</H4>
              <div className="grid sm:grid-cols-2 gap-2 mt-4">
                {shortcutsList.map((s) => (
                  <div
                    key={s.cmd}
                    className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2"
                  >
                    <code className="text-indigo-400 font-mono text-sm font-medium">
                      {s.cmd}
                    </code>
                    <span className="text-slate-500 text-xs">{s.desc}</span>
                  </div>
                ))}
              </div>
            </GuideSection>

            {/* ---------------------------------------------------- */}
            {/* 7. Resume                                             */}
            {/* ---------------------------------------------------- */}
            <GuideSection id="resume" title="Resume Management" icon={FileText}>
              <Step n={1}>
                <p>
                  Go to the <strong className="text-white">Resume</strong> tab
                  in your dashboard profile page.
                </p>
              </Step>
              <Step n={2}>
                <p>
                  Drag and drop a PDF or click to browse. Your resume is
                  uploaded and stored securely.
                </p>
              </Step>
              <Step n={3}>
                <p>
                  You can view, download, or delete your uploaded resume from
                  the same tab.
                </p>
              </Step>

              <InfoBox>
                Keep your resume updated — the AI uses your profile data
                (not the resume file itself) for generating answers, so make
                sure your profile matches your latest resume.
              </InfoBox>
            </GuideSection>

            {/* ---------------------------------------------------- */}
            {/* 8. Dashboard                                          */}
            {/* ---------------------------------------------------- */}
            <GuideSection id="dashboard" title="Dashboard Overview" icon={LayoutDashboard}>
              <p className="text-slate-400 leading-relaxed mb-6">
                The web dashboard is your command center for managing
                everything:
              </p>

              <div className="space-y-3 mb-6">
                {[
                  { label: 'Profile', desc: 'Personal info, experience, education, skills — 6 organized tabs' },
                  { label: 'Q&A Library', desc: 'Save and manage custom question-answer pairs for AI context' },
                  { label: 'Resume', desc: 'Upload, view, and manage your resume files' },
                  { label: 'Profile Preview', desc: 'See how your profile looks with a beautiful gradient card' },
                  { label: 'Settings', desc: 'Configure AI provider, API keys, and extension preferences' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start gap-3 bg-white/[0.02] border border-white/5 rounded-lg p-3"
                  >
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-white text-sm font-medium">
                        {item.label}
                      </span>
                      <p className="text-slate-500 text-xs mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                >
                  Open Dashboard
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </GuideSection>

            {/* ---------------------------------------------------- */}
            {/* 9. Tips                                               */}
            {/* ---------------------------------------------------- */}
            <GuideSection id="tips" title="Tips & Tricks" icon={Lightbulb} last>
              <div className="space-y-4">
                {[
                  {
                    title: 'Write detailed experience descriptions',
                    body: 'The AI pulls from your profile. More detail = better answers. Include specific technologies, metrics, and achievements.',
                  },
                  {
                    title: 'Save 10-15 custom Q&A pairs',
                    body: 'Common questions like "Why this role?", "Biggest weakness?", "Salary expectations?" — having pre-written answers dramatically improves quality.',
                  },
                  {
                    title: 'Review before submitting',
                    body: 'AI-generated answers are a starting point. Always review, personalize, and make them sound like you before submitting.',
                  },
                  {
                    title: 'Use @shortcuts for speed',
                    body: 'For simple fields like email, phone, LinkedIn — use @shortcuts instead of Smart Answers. They\'re instant and don\'t use AI credits.',
                  },
                  {
                    title: 'Try OpenRouter for free',
                    body: 'OpenRouter offers free-tier models. Set your provider to OpenRouter and use the "openrouter/auto" model to get started without any cost.',
                  },
                  {
                    title: 'Button not appearing?',
                    body: 'Try refreshing the page or clicking the extension icon. The extension re-scans for form fields. If the issue persists, the site may use a non-standard form structure.',
                  },
                ].map((tip) => (
                  <div
                    key={tip.title}
                    className="glass-card rounded-xl p-5 group hover:scale-[1.01] transition-transform"
                  >
                    <h4 className="text-white font-medium text-sm mb-1 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      {tip.title}
                    </h4>
                    <p className="text-slate-400 text-sm leading-relaxed pl-6">
                      {tip.body}
                    </p>
                  </div>
                ))}
              </div>
            </GuideSection>

            {/* Bottom CTA */}
            <AnimatedSection className="mt-16 text-center">
              <div className="glass-card rounded-2xl p-10">
                <h3 className="text-2xl font-bold text-white mb-3">
                  Ready to start?
                </h3>
                <p className="text-slate-400 mb-6">
                  Install the extension and land your next interview faster.
                </p>
                <Link
                  href="/guide#installation"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold px-6 py-3 rounded-full hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  Install JobHunter
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function GuideSection({
  id,
  title,
  icon: Icon,
  children,
  last,
}: {
  id: string;
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <AnimatedSection>
      <section
        id={id}
        className={`scroll-mt-24 ${last ? '' : 'mb-16 pb-16 border-b border-white/5'}`}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
        {children}
      </section>
    </AnimatedSection>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 mb-4">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
        <span className="text-indigo-400 text-xs font-bold">{n}</span>
      </div>
      <div className="text-slate-300 text-sm leading-relaxed pt-0.5">
        {children}
      </div>
    </div>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 mb-6 bg-indigo-500/5 border border-indigo-500/15 rounded-xl p-4 text-sm text-slate-300 leading-relaxed">
      {children}
    </div>
  );
}

function H4({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-white font-semibold text-sm mt-6 mb-2 flex items-center gap-1.5">
      <ChevronRight className="w-4 h-4 text-indigo-400" />
      {children}
    </h4>
  );
}

function ProviderCard({
  name,
  description,
  badge,
  badgeColor,
}: {
  name: string;
  description: string;
  badge: string;
  badgeColor: string;
}) {
  return (
    <div className="glass-card rounded-xl p-4 hover:scale-[1.01] transition-transform">
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <h4 className="text-white font-medium text-sm">{name}</h4>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full border ${badgeColor}`}
        >
          {badge}
        </span>
      </div>
      <p className="text-slate-400 text-xs leading-relaxed">{description}</p>
    </div>
  );
}
