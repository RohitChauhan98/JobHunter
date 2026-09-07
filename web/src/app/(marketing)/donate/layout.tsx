import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support Us — JobHunter',
  description:
    'JobHunter has a free tier for everyone. If it has helped you, consider supporting its development.',
};

export default function DonateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
