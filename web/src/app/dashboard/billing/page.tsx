'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CreditCard, Loader2, Sparkles } from 'lucide-react';

import { billing as billingApi, type BillingStatus, ApiError } from '@/lib/api';
import { openRazorpayCheckout } from '@/lib/razorpay';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function BillingPage() {
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const refresh = useCallback(() => {
    return billingApi
      .status()
      .then(setStatus)
      .catch((err: Error) => setMessage(err.message));
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const upgrade = async (planId: string) => {
    setMessage('');
    if (!status?.razorpayConfigured) {
      setMessage('Razorpay is not configured on the server. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
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
      const next = await billingApi.verify(result);
      setStatus(next);
      await refreshUser().catch(() => undefined);
      setMessage('Payment successful — plan updated.');
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Payment cancelled') {
        // no-op
      } else if (err instanceof ApiError || err instanceof Error) {
        setMessage(err.message);
      } else {
        setMessage('Checkout failed');
      }
    } finally {
      setCheckoutId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const usage = status?.usage.aiGenerations;
  const usageLabel =
    usage?.limit == null
      ? `${usage?.used ?? 0} used (unlimited)`
      : `${usage?.used ?? 0} / ${usage.limit} this month`;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your JobHunter plan and view recent payments.
        </p>
      </div>

      {message && (
        <p className="rounded border border-border bg-card px-4 py-3 text-sm">{message}</p>
      )}

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-forest" />
              Current plan
            </CardTitle>
            <CardDescription>Your active subscription tier</CardDescription>
          </div>
          <Badge variant={status?.isPaid ? 'default' : 'secondary'}>
            {status?.planName || 'Free'}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Tier</dt>
              <dd className="font-medium capitalize">{status?.plan}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Billing interval</dt>
              <dd className="font-medium capitalize">
                {status?.planInterval === 'none' ? '—' : status?.planInterval}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Renews / expires</dt>
              <dd className="font-medium">
                {status?.plan === 'lifetime'
                  ? 'Never'
                  : status?.planExpiresAt
                    ? new Date(status.planExpiresAt).toLocaleDateString()
                    : '—'}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                AI usage
              </dt>
              <dd className="font-medium">{usageLabel}</dd>
            </div>
          </dl>

          {!status?.isPaid && (
            <div className="flex flex-wrap gap-2 border-t border-border pt-4">
              <Button
                onClick={() => upgrade('pro_monthly')}
                disabled={Boolean(checkoutId)}
              >
                {checkoutId === 'pro_monthly' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Upgrade Pro — ₹299/mo
              </Button>
              <Button
                variant="outline"
                onClick={() => upgrade('pro_yearly')}
                disabled={Boolean(checkoutId)}
              >
                Yearly — ₹2,999
              </Button>
              <Button
                variant="outline"
                onClick={() => upgrade('lifetime')}
                disabled={Boolean(checkoutId)}
              >
                Lifetime — ₹4,999
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/pricing">Compare plans</Link>
              </Button>
            </div>
          )}

          {status?.plan === 'pro' && (
            <div className="flex flex-wrap gap-2 border-t border-border pt-4">
              <Button
                variant="outline"
                onClick={() => upgrade('lifetime')}
                disabled={Boolean(checkoutId)}
              >
                Switch to Lifetime — ₹4,999
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/pricing">View plans</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment history</CardTitle>
          <CardDescription>Recent successful charges via Razorpay</CardDescription>
        </CardHeader>
        <CardContent>
          {!status?.payments?.length ? (
            <p className="text-sm text-muted-foreground">No payments yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {status.payments.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <div>
                    <p className="font-medium capitalize">
                      {p.type}
                      {p.planId ? ` · ${p.planId.replace('_', ' ')}` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(p.createdAt).toLocaleString()}
                      {p.razorpayPaymentId ? ` · ${p.razorpayPaymentId}` : ''}
                    </p>
                  </div>
                  <span className="font-medium text-forest">
                    ₹{(p.amount / 100).toLocaleString('en-IN')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
