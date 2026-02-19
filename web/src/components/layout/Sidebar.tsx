'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: '📊' },
  { label: 'Profile', href: '/dashboard/profile', icon: '👤' },
  { label: 'Applications', href: '/dashboard/applications', icon: '📋' },
  { label: 'AI Assistant', href: '/dashboard/ai', icon: '🤖' },
  { label: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="flex w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <span className="text-2xl">🎯</span>
        <span className="text-lg font-bold">JobHunter</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User / Logout */}
      <div className="border-t p-4">
        <div className="mb-2 truncate text-sm text-muted-foreground">{user?.email}</div>
        <Button variant="outline" size="sm" className="w-full" onClick={logout}>
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
