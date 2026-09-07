import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing — JobHunter',
  description:
    'Free tier with light AI usage. Pro unlocks unlimited smart answers, cover letters, and resume tips.',
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
