'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, ArrowRight, Loader2 } from 'lucide-react';

import { AnimatedSection } from '@/components/marketing/AnimatedSection';
import { billing as billingApi, type BillingPlan, ApiError } from '@/lib/api';
import { openRazorpayCheckout } from '@/lib/razorpay';
import { useAuth } from '@/lib/auth';

type IntervalTab = 'monthly' | 'yearly';

export default function PricingPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<IntervalTab>('monthly');
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    billingApi
      .plans()
      .then((data) => {
        setPlans(data.plans);
        setConfigured(data.razorpayConfigured);
      })
      .catch((err: Error) => setMessage(err.message))
      .finally(() => setLoading(false));
  }, []);

  const free = plans.find((p) => p.id === 'free');
  const monthly = plans.find((p) => p.id === 'pro_monthly');
  const yearly = plans.find((p) => p.id === 'pro_yearly');
  const lifetime = plans.find((p) => p.id === 'lifetime');
  const pro = tab === 'monthly' ? monthly : yearly;

  const startCheckout = async (planId: string) => {
    setMessage('');
    if (authLoading) return;
    if (!user) {
      router.push(`/login?next=/pricing`);
      return;
    }
    if (!configured) {
      setMessage('Payments are not configured yet. Add Razorpay keys on the server.');
      return;
    }

    setCheckoutId(planId);
    try {
      const session = await billingApi.checkout(planId);
      const result = await openRazorpayCheckout({
        keyId: session.keyId,
        orderId: session.orderId,
        amount: session.amount,
        currency: session.currency,
        description: session.planName || 'JobHunter plan',
        prefill: session.prefill,
      });
      await billingApi.verify(result);
      await refreshUser().catch(() => undefined);
      setMessage('Payment successful — your plan is active.');
      router.push('/dashboard/billing');
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Payment cancelled') {
        setMessage('');
      } else if (err instanceof ApiError) {
        setMessage(err.message);
      } else if (err instanceof Error) {
        setMessage(err.message);
      } else {
        setMessage('Checkout failed');
      }
    } finally {
      setCheckoutId(null);
    }
  };

  return (
    <>
      <section className="pt-32 pb-12">
        <div className="mx-auto max-w-3xl px-6">
          <AnimatedSection>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-forest">
              Pricing
            </p>
            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Simple plans for every hunt
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Start free. Upgrade when you need unlimited AI for cover letters, smart answers, and
              resume tips.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="pb-8">
        <div className="mx-auto flex max-w-4xl justify-center px-6">
          <div className="inline-flex rounded border border-border bg-card p-1">
            {(['monthly', 'yearly'] as const).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
                  tab === id
                    ? 'bg-forest text-citrus'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {id === 'monthly' ? 'Monthly' : 'Yearly — save ~16%'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {message && (
        <div className="mx-auto max-w-4xl px-6 pb-4">
          <p className="rounded border border-border bg-card px-4 py-3 text-sm text-foreground">
            {message}
          </p>
        </div>
      )}

      <section className="pb-20">
        <div className="mx-auto max-w-5xl px-6">
          {loading ? (
            <div className="flex justify-center py-16 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              {free && (
                <PlanCard
                  plan={free}
                  priceLabel="₹0"
                  period=""
                  cta="Current free tier"
                  href={user ? '/dashboard' : '/register'}
                  disabled={false}
                />
              )}
              {pro && (
                <PlanCard
                  plan={pro}
                  priceLabel={pro.amountDisplay}
                  period={tab === 'monthly' ? '/ month' : '/ year'}
                  cta={checkoutId === pro.id ? 'Opening…' : `Upgrade to ${pro.name}`}
                  onClick={() => startCheckout(pro.id)}
                  loading={checkoutId === pro.id}
                  highlighted
                />
              )}
              {lifetime && (
                <PlanCard
                  plan={lifetime}
                  priceLabel={lifetime.amountDisplay}
                  period=" once"
                  cta={checkoutId === lifetime.id ? 'Opening…' : 'Get Lifetime'}
                  onClick={() => startCheckout(lifetime.id)}
                  loading={checkoutId === lifetime.id}
                />
              )}
            </div>
          )}

          <AnimatedSection className="mt-10 text-center text-sm text-muted-foreground">
            Prefer to tip without upgrading?{' '}
            <Link href="/donate" className="font-medium text-forest underline-offset-2 hover:underline">
              Support JobHunter
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}

function PlanCard({
  plan,
  priceLabel,
  period,
  cta,
  onClick,
  href,
  highlighted,
  loading,
  disabled,
}: {
  plan: BillingPlan;
  priceLabel: string;
  period: string;
  cta: string;
  onClick?: () => void;
  href?: string;
  highlighted?: boolean;
  loading?: boolean;
  disabled?: boolean;
}) {
  const buttonClass = highlighted
    ? 'bg-forest text-citrus hover:bg-forest-mid'
    : 'border border-border text-foreground hover:border-forest';

  return (
    <AnimatedSection>
      <div
        className={`flex h-full flex-col rounded-lg border bg-card p-6 ${
          highlighted ? 'border-forest' : 'border-border'
        }`}
      >
        {highlighted && (
          <span className="mb-3 self-start rounded bg-citrus px-2 py-0.5 text-xs font-semibold text-forest">
            Most popular
          </span>
        )}
        <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
        <p className="mt-4 font-display text-3xl font-semibold text-forest">
          {priceLabel}
          {period && <span className="text-base font-normal text-muted-foreground">{period}</span>}
        </p>
        <ul className="mt-6 flex-1 space-y-2">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-forest" strokeWidth={2} />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        {href ? (
          <Link
            href={href}
            className={`mt-6 inline-flex items-center justify-center gap-2 rounded py-2.5 text-sm font-semibold transition-colors ${buttonClass}`}
          >
            {cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <button
            type="button"
            disabled={disabled || loading}
            onClick={onClick}
            className={`mt-6 inline-flex items-center justify-center gap-2 rounded py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 ${buttonClass}`}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {cta}
          </button>
        )}
      </div>
    </AnimatedSection>
  );
}
