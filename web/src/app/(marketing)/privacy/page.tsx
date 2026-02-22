import type { Metadata } from 'next';
import { AnimatedSection } from '@/components/marketing/AnimatedSection';
import { Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy — JobHunter',
  description: 'Privacy policy for the JobHunter Chrome extension and web dashboard.',
};

export default function PrivacyPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-6">
              <Shield className="w-3.5 h-3.5" />
              Last updated: February 2026
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Privacy Policy
            </h1>
            <p className="text-slate-400 text-lg">
              Your privacy matters. Here&apos;s how JobHunter handles your data.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Content */}
      <section className="relative pb-28">
        <div className="max-w-3xl mx-auto px-6">
          <div className="prose-invert space-y-10">
            <PolicySection title="1. Overview">
              <p>
                JobHunter is a free, open-source Chrome extension and web
                application designed to help you fill out job applications more
                efficiently. We are committed to protecting your privacy and
                being transparent about how we handle your data.
              </p>
            </PolicySection>

            <PolicySection title="2. Data We Collect">
              <p>When you create an account and use JobHunter, we store:</p>
              <ul>
                <li>
                  <strong>Account information:</strong> Email address and hashed
                  password (never stored in plain text).
                </li>
                <li>
                  <strong>Profile data:</strong> Name, contact information, work
                  experience, education, skills, and any custom Q&A pairs you
                  create.
                </li>
                <li>
                  <strong>Resume files:</strong> PDF resumes you upload through
                  the dashboard.
                </li>
              </ul>
            </PolicySection>

            <PolicySection title="3. Data We Do NOT Collect">
              <ul>
                <li>We do not track your browsing history or visited URLs.</li>
                <li>We do not collect data from job sites you visit.</li>
                <li>We do not sell, share, or monetize your personal data.</li>
                <li>
                  We do not use analytics trackers, advertising pixels, or
                  third-party tracking scripts.
                </li>
                <li>
                  We do not store your AI provider API keys on our servers —
                  they are stored locally in your browser.
                </li>
              </ul>
            </PolicySection>

            <PolicySection title="4. How Your Data Is Used">
              <p>Your profile data is used exclusively to:</p>
              <ul>
                <li>
                  Generate personalized AI answers when you click the &quot;Generate
                  Answer&quot; button on a job application.
                </li>
                <li>Populate @shortcut values when you type @ in form fields.</li>
                <li>Display your profile in the web dashboard.</li>
              </ul>
              <p>
                When you generate an AI answer, your profile data and the
                question context are sent to your chosen AI provider (OpenAI,
                Anthropic, OpenRouter, or a local LLM). The data sent depends
                on the provider you choose.
              </p>
            </PolicySection>

            <PolicySection title="5. AI Provider Data">
              <p>
                When using cloud AI providers (OpenAI, Anthropic, OpenRouter),
                question context and relevant profile excerpts are sent to
                their APIs. Please review the privacy policies of your chosen
                provider:
              </p>
              <ul>
                <li>
                  <a href="https://openai.com/privacy" className="text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">
                    OpenAI Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="https://www.anthropic.com/privacy" className="text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">
                    Anthropic Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="https://openrouter.ai/privacy" className="text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">
                    OpenRouter Privacy Policy
                  </a>
                </li>
              </ul>
              <p>
                For maximum privacy, use the Local LLM (Ollama) option. All
                processing stays on your machine.
              </p>
            </PolicySection>

            <PolicySection title="6. Data Storage & Security">
              <ul>
                <li>
                  Passwords are hashed with bcrypt before storage.
                </li>
                <li>
                  All API communication uses HTTPS encryption.
                </li>
                <li>
                  Authentication uses JWT tokens with expiration.
                </li>
                <li>
                  AI provider API keys are stored in your browser&apos;s local
                  storage only — they never touch our servers.
                </li>
              </ul>
            </PolicySection>

            <PolicySection title="7. Data Deletion">
              <p>
                You can delete your account and all associated data at any time
                through the dashboard settings. Upon deletion, all your profile
                data, Q&A pairs, and uploaded resumes are permanently removed
                from our servers.
              </p>
            </PolicySection>

            <PolicySection title="8. Open Source">
              <p>
                JobHunter is open source. You can audit the entire codebase to
                verify our privacy practices. You can also self-host the
                backend for complete data control.
              </p>
            </PolicySection>

            <PolicySection title="9. Changes to This Policy">
              <p>
                We may update this privacy policy from time to time. Significant
                changes will be announced on the website and in the extension
                changelog.
              </p>
            </PolicySection>

            <PolicySection title="10. Contact">
              <p>
                If you have questions about this privacy policy or how your data
                is handled, please open an issue on our GitHub repository.
              </p>
            </PolicySection>
          </div>
        </div>
      </section>
    </>
  );
}

function PolicySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatedSection>
      <div>
        <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
        <div className="text-slate-400 text-sm leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_strong]:text-slate-200">
          {children}
        </div>
      </div>
    </AnimatedSection>
  );
}
