import type { ReactNode } from 'react';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="marketing-light min-h-screen text-foreground">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
