/**
 * JobHunter billing plans (INR).
 * Amounts are in paise (₹1 = 100 paise) for Razorpay.
 */

export type PlanId = 'free' | 'pro_monthly' | 'pro_yearly' | 'lifetime';

export interface PlanDefinition {
  id: PlanId;
  name: string;
  description: string;
  /** Amount in paise; 0 for free */
  amount: number;
  currency: 'INR';
  interval: 'none' | 'monthly' | 'yearly' | 'lifetime';
  tier: 'free' | 'pro' | 'lifetime';
  popular?: boolean;
  features: string[];
  limits: {
    aiGenerationsPerMonth: number; // Infinity for unlimited
  };
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Get started with core autofill and light AI usage.',
    amount: 0,
    currency: 'INR',
    interval: 'none',
    tier: 'free',
    features: [
      'Profile & resume management',
      'Browser autofill on major ATS platforms',
      '25 AI generations per month',
      'Application tracking',
    ],
    limits: { aiGenerationsPerMonth: 25 },
  },
  pro_monthly: {
    id: 'pro_monthly',
    name: 'Pro',
    description: 'Unlimited AI and full power for active job searches.',
    amount: 29900, // ₹299
    currency: 'INR',
    interval: 'monthly',
    tier: 'pro',
    popular: true,
    features: [
      'Everything in Free',
      'Unlimited AI smart answers',
      'Cover letters & resume tips',
      'Priority support',
      'All ATS adapters',
    ],
    limits: { aiGenerationsPerMonth: Number.POSITIVE_INFINITY },
  },
  pro_yearly: {
    id: 'pro_yearly',
    name: 'Pro Yearly',
    description: 'Two months free vs monthly — best value for a long hunt.',
    amount: 299900, // ₹2,999
    currency: 'INR',
    interval: 'yearly',
    tier: 'pro',
    features: [
      'Everything in Pro',
      'Billed once per year',
      'Save ~₹587 vs monthly',
    ],
    limits: { aiGenerationsPerMonth: Number.POSITIVE_INFINITY },
  },
  lifetime: {
    id: 'lifetime',
    name: 'Lifetime',
    description: 'Pay once, keep Pro forever.',
    amount: 499900, // ₹4,999
    currency: 'INR',
    interval: 'lifetime',
    tier: 'lifetime',
    features: [
      'Everything in Pro',
      'One-time payment',
      'Lifetime updates',
      'Early access to new adapters',
    ],
    limits: { aiGenerationsPerMonth: Number.POSITIVE_INFINITY },
  },
};

/** Donation presets in paise */
export const DONATION_PRESETS = [
  { id: 'coffee', label: 'Buy a Coffee', amount: 10000, description: 'A small thank-you that keeps development moving.' },
  { id: 'supporter', label: 'Supporter', amount: 50000, description: 'Help cover server costs and keep the service running.', popular: true },
  { id: 'champion', label: 'Champion', amount: 100000, description: 'Fund a major feature or improvement.' },
] as const;

export const PAID_PLAN_IDS: PlanId[] = ['pro_monthly', 'pro_yearly', 'lifetime'];

export function getPlan(planId: string): PlanDefinition | undefined {
  return PLANS[planId as PlanId];
}

export function formatInr(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

/** Period length for a paid plan, in milliseconds from activation. */
export function periodMs(interval: PlanDefinition['interval']): number | null {
  switch (interval) {
    case 'monthly':
      return 30 * 24 * 60 * 60 * 1000;
    case 'yearly':
      return 365 * 24 * 60 * 60 * 1000;
    case 'lifetime':
      return null; // never expires
    default:
      return null;
  }
}
