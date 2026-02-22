import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Heart,
  Coffee,
  Github,
  Star,
  ArrowRight,
  Sparkles,
  Server,
  Code2,
  Rocket,
  Users,
} from 'lucide-react';

import { AnimatedSection } from '@/components/marketing/AnimatedSection';

export const metadata: Metadata = {
  title: 'Support Us — JobHunter',
  description:
    'JobHunter is free and open source. If it has helped you, consider supporting its development.',
};

const tiers = [
  {
    icon: Coffee,
    emoji: '☕',
    name: 'Buy a Coffee',
    amount: '$5',
    description: 'A small thank-you that keeps us caffeinated and coding.',
    color: 'from-amber-500 to-orange-500',
    link: '#',
  },
  {
    icon: Heart,
    emoji: '💜',
    name: 'Supporter',
    amount: '$15',
    description: 'Help cover server costs and keep the service running for everyone.',
    color: 'from-pink-500 to-rose-500',
    link: '#',
    popular: true,
  },
  {
    icon: Rocket,
    emoji: '🚀',
    name: 'Champion',
    amount: '$50',
    description: 'Fund a major feature or improvement. Your name on the supporters wall.',
    color: 'from-indigo-500 to-purple-600',
    link: '#',
  },
];

const whatFunds = [
  {
    icon: Server,
    title: 'Server & Infrastructure',
    description: 'Database hosting, API servers, and keeping the service fast and reliable.',
  },
  {
    icon: Code2,
    title: 'Development Time',
    description: 'New features, platform adapters, bug fixes, and AI improvements.',
  },
  {
    icon: Users,
    title: 'Community Support',
    description: 'Documentation, tutorials, responding to issues, and community building.',
  },
  {
    icon: Rocket,
    title: 'Future Plans',
    description: 'Application tracking, analytics, browser integrations, and more platforms.',
  },
];

export default function DonatePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute inset-0 dot-grid opacity-40" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <AnimatedSection>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-300 text-sm font-medium mb-6">
              <Heart className="w-3.5 h-3.5" />
              100% Optional — Always Free to Use
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4">
              Support{' '}
              <span className="gradient-text">JobHunter</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
              JobHunter is free for everyone — no paywalls, no premium tiers, no
              limits. If it&apos;s helped you land interviews, consider buying the
              developer a coffee. ☕
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Donation tiers */}
      <section className="relative pb-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid sm:grid-cols-3 gap-6">
            {tiers.map((tier, i) => (
              <AnimatedSection key={tier.name} delay={i * 120}>
                <div
                  className={`relative glass-card rounded-2xl p-7 text-center h-full transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 ${
                    tier.popular ? 'ring-2 ring-pink-500/30' : ''
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                      Most Popular
                    </div>
                  )}
                  <div className="text-4xl mb-4">{tier.emoji}</div>
                  <h3 className="text-white font-bold text-lg mb-1">
                    {tier.name}
                  </h3>
                  <div className={`text-3xl font-bold mb-3 bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
                    {tier.amount}
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    {tier.description}
                  </p>
                  <a
                    href={tier.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 w-full justify-center py-3 rounded-xl font-semibold text-sm transition-all ${
                      tier.popular
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:shadow-lg hover:shadow-pink-500/25'
                        : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <Heart className="w-4 h-4" />
                    Donate {tier.amount}
                  </a>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* Custom amount note */}
          <AnimatedSection className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              Want to give a different amount?{' '}
              <a
                href="#"
                className="text-indigo-400 hover:text-indigo-300 underline"
              >
                Set a custom donation
              </a>
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Other ways to support */}
      <section className="relative py-24 bg-slate-900/30 border-y border-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <AnimatedSection className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-3">
              Other Ways to Support
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto">
              Not everyone can donate, and that&apos;s perfectly fine! Here are
              free ways to help:
            </p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 gap-5">
            <AnimatedSection delay={0}>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card rounded-xl p-6 flex items-start gap-4 group hover:scale-[1.02] transition-all block"
              >
                <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
                  <Star className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm mb-1">
                    Star on GitHub
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    A star helps others discover the project and motivates
                    continued development.
                  </p>
                </div>
              </a>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <div className="glass-card rounded-xl p-6 flex items-start gap-4 group hover:scale-[1.02] transition-all">
                <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm mb-1">
                    Spread the Word
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Tell your friends, share on social media, or recommend it in
                    job-seeking communities.
                  </p>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card rounded-xl p-6 flex items-start gap-4 group hover:scale-[1.02] transition-all block"
              >
                <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
                  <Code2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm mb-1">
                    Contribute Code
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Found a bug? Want a feature? PRs are welcome! Check the
                    issues tab on GitHub.
                  </p>
                </div>
              </a>
            </AnimatedSection>

            <AnimatedSection delay={300}>
              <div className="glass-card rounded-xl p-6 flex items-start gap-4 group hover:scale-[1.02] transition-all">
                <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
                  <Github className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm mb-1">
                    Report Bugs
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Found something broken? Open an issue. Every bug report makes
                    JobHunter better for everyone.
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* What donations fund */}
      <section className="relative py-24">
        <div className="max-w-4xl mx-auto px-6">
          <AnimatedSection className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-3">
              Where Your Support Goes
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto">
              Every dollar goes directly into making JobHunter better.
            </p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 gap-6">
            {whatFunds.map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 100}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm mb-1">
                      {item.title}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Thank you CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[140px]" />

        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <AnimatedSection>
            <div className="text-5xl mb-6">🙏</div>
            <h2 className="text-3xl font-bold text-white mb-3">
              Thank You
            </h2>
            <p className="text-slate-400 leading-relaxed mb-8">
              Whether you donate, star the repo, or simply use JobHunter to land
              your dream job — thank you. This project exists because of people
              like you.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Back to Home
              <ArrowRight className="w-4 h-4" />
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
