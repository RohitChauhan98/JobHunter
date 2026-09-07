'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  Coffee,
  Github,
  Star,
  ArrowRight,
  Server,
  Code2,
  Rocket,
  Users,
  Loader2,
} from 'lucide-react';

import { AnimatedSection } from '@/components/marketing/AnimatedSection';
import { billing as billingApi, type DonationPreset, ApiError } from '@/lib/api';
import { openRazorpayCheckout } from '@/lib/razorpay';
import { useAuth } from '@/lib/auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ICONS = {
  coffee: Coffee,
  supporter: Heart,
  champion: Rocket,
} as const;

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
  const { user } = useAuth();
  const [tiers, setTiers] = useState<DonationPreset[]>([]);
  const [configured, setConfigured] = useState(true);
  const [customAmount, setCustomAmount] = useState('');
  const [email, setEmail] = useState('');
  const [paying, setPaying] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    billingApi
      .plans()
      .then((data) => {
        setTiers(data.donations);
        setConfigured(data.razorpayConfigured);
      })
      .catch((err: Error) => setMessage(err.message));
  }, []);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user?.email]);

  const donate = async (amountPaise: number, label: string) => {
    setMessage('');
    setSuccess('');
    if (!configured) {
      setMessage('Donations are not configured yet. Add Razorpay keys on the server.');
      return;
    }
    if (!user && !email.trim()) {
      setMessage('Enter your email so we can send a receipt.');
      return;
    }

    setPaying(label);
    try {
      const session = await billingApi.donate({
        amount: amountPaise,
        email: email.trim() || undefined,
      });
      const result = await openRazorpayCheckout({
        keyId: session.keyId,
        orderId: session.orderId,
        amount: session.amount,
        currency: session.currency,
        description: `Support JobHunter — ${label}`,
        prefill: { email: email.trim() || session.prefill?.email },
      });
      const verified = await billingApi.verifyDonate(result);
      setSuccess(`Thank you! Your ${verified.amountDisplay} donation was received.`);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Payment cancelled') {
        // no-op
      } else if (err instanceof ApiError || err instanceof Error) {
        setMessage(err.message);
      } else {
        setMessage('Donation failed');
      }
    } finally {
      setPaying(null);
    }
  };

  const onCustom = () => {
    const rupees = Number(customAmount);
    if (!Number.isFinite(rupees) || rupees < 10 || rupees > 100_000) {
      setMessage('Enter an amount between ₹10 and ₹100,000.');
      return;
    }
    void donate(Math.round(rupees * 100), `₹${rupees}`);
  };

  return (
    <>
      <section className="pt-32 pb-16">
        <div className="mx-auto max-w-3xl px-6">
          <AnimatedSection>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-forest">
              Optional support
            </p>
            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Support JobHunter
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              JobHunter has a free tier for everyone. If it has helped you land interviews, a tip
              keeps development moving — or{' '}
              <Link href="/pricing" className="font-medium text-forest underline-offset-2 hover:underline">
                upgrade to Pro
              </Link>{' '}
              for unlimited AI.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {(message || success) && (
        <div className="mx-auto max-w-4xl px-6 pb-4">
          <p
            className={`rounded border px-4 py-3 text-sm ${
              success ? 'border-forest/40 bg-forest/5 text-forest' : 'border-border bg-card'
            }`}
          >
            {success || message}
          </p>
        </div>
      )}

      <section className="pb-12">
        <div className="mx-auto max-w-4xl px-6">
          {!user && (
            <div className="mb-6 max-w-sm">
              <Label htmlFor="donate-email">Email for receipt</Label>
              <Input
                id="donate-email"
                type="email"
                className="mt-1.5"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            {tiers.map((tier, i) => {
              const Icon = ICONS[tier.id as keyof typeof ICONS] || Heart;
              return (
                <AnimatedSection key={tier.id} delay={i * 80}>
                  <div
                    className={`flex h-full flex-col rounded-lg border bg-card p-6 ${
                      tier.popular ? 'border-forest' : 'border-border'
                    }`}
                  >
                    {tier.popular && (
                      <span className="mb-3 self-start rounded bg-citrus px-2 py-0.5 text-xs font-semibold text-forest">
                        Most popular
                      </span>
                    )}
                    <Icon className="mb-3 h-5 w-5 text-forest" strokeWidth={1.75} />
                    <h3 className="font-display text-lg font-semibold">{tier.label}</h3>
                    <p className="mt-1 font-display text-2xl font-semibold text-forest">
                      {tier.amountDisplay}
                    </p>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {tier.description}
                    </p>
                    <button
                      type="button"
                      disabled={Boolean(paying)}
                      onClick={() => donate(tier.amount, tier.label)}
                      className={`mt-6 inline-flex items-center justify-center gap-2 rounded py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 ${
                        tier.popular
                          ? 'bg-forest text-citrus hover:bg-forest-mid'
                          : 'border border-border text-foreground hover:border-forest'
                      }`}
                    >
                      {paying === tier.label && <Loader2 className="h-4 w-4 animate-spin" />}
                      Donate {tier.amountDisplay}
                    </button>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>

          <AnimatedSection className="mt-8">
            <div className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Label htmlFor="custom-amount">Custom amount (₹)</Label>
                <Input
                  id="custom-amount"
                  type="number"
                  min={10}
                  max={100000}
                  className="mt-1.5"
                  placeholder="250"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                />
              </div>
              <button
                type="button"
                disabled={Boolean(paying)}
                onClick={onCustom}
                className="inline-flex items-center justify-center gap-2 rounded border border-border px-4 py-2.5 text-sm font-semibold hover:border-forest disabled:opacity-60"
              >
                {paying && customAmount ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Donate custom
              </button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="border-y border-border bg-card/60 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <AnimatedSection className="mb-10 max-w-xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              Other ways to support
            </h2>
            <p className="mt-3 text-muted-foreground">
              Not everyone can donate — here are free ways to help.
            </p>
          </AnimatedSection>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: Star,
                title: 'Star on GitHub',
                description:
                  'A star helps others discover the project and motivates continued development.',
                href: 'https://github.com',
              },
              {
                icon: Users,
                title: 'Spread the word',
                description:
                  'Tell friends, share on social media, or recommend it in job-seeking communities.',
              },
              {
                icon: Code2,
                title: 'Contribute code',
                description: 'Found a bug? Want a feature? PRs are welcome on GitHub.',
                href: 'https://github.com',
              },
              {
                icon: Github,
                title: 'Report bugs',
                description:
                  'Open an issue. Every bug report makes JobHunter better for everyone.',
              },
            ].map((item, i) => {
              const Comp = item.href ? 'a' : 'div';
              return (
                <AnimatedSection key={item.title} delay={i * 60}>
                  <Comp
                    {...(item.href
                      ? { href: item.href, target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                    className="flex items-start gap-4 rounded-lg border border-border bg-background p-5 transition-colors hover:border-forest"
                  >
                    <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-forest" strokeWidth={1.75} />
                    <div>
                      <h3 className="font-display text-sm font-semibold">{item.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </Comp>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <AnimatedSection className="mb-10 max-w-xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              Where support goes
            </h2>
            <p className="mt-3 text-muted-foreground">
              Every contribution goes into making JobHunter better.
            </p>
          </AnimatedSection>

          <div className="grid gap-8 sm:grid-cols-2">
            {whatFunds.map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 60}>
                <div className="flex items-start gap-4">
                  <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-forest" strokeWidth={1.75} />
                  <div>
                    <h3 className="font-display text-sm font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <AnimatedSection>
            <h2 className="font-display text-3xl font-semibold tracking-tight">Thank you</h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground leading-relaxed">
              Whether you donate, star the repo, or simply use JobHunter — thank you. This project
              exists because of people like you.
            </p>
            <Link
              href="/"
              className="mt-8 inline-flex items-center justify-center gap-2 text-sm font-semibold text-forest hover:text-forest-mid"
            >
              Back to home
              <ArrowRight className="h-4 w-4" />
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
