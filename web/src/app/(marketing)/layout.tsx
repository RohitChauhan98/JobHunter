import type { ReactNode } from 'react';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white dark-scroll">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
