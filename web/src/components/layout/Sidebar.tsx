'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  User,
  FileText,
  Sparkles,
  Settings,
  CreditCard,
  LogOut,
  Moon,
  Sun,
  Monitor,
  Crosshair,
} from 'lucide-react';

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
  { label: 'Applications', href: '/dashboard/applications', icon: FileText },
  { label: 'AI Assistant', href: '/dashboard/ai', icon: Sparkles },
  { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <aside className="flex w-64 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center gap-3 border-b border-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-forest text-citrus">
          <Crosshair className="h-4 w-4" strokeWidth={2.5} />
        </div>
        <span className="font-display text-lg font-semibold tracking-tight text-foreground">
          JobHunter
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-forest/10 text-forest'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              )}
            >
              <Icon className={cn('h-4 w-4', active && 'text-forest')} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-2">
        <div className="flex items-center gap-1 rounded border border-border bg-background p-1">
          {(
            [
              { id: 'light' as const, icon: Sun, label: 'Light' },
              { id: 'dark' as const, icon: Moon, label: 'Dark' },
              { id: 'system' as const, icon: Monitor, label: 'Auto' },
            ] as const
          ).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTheme(id)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded px-2 py-1.5 text-xs font-medium transition-colors',
                theme === id
                  ? 'bg-forest text-citrus'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border p-3">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-forest/10 text-xs font-bold text-forest">
            {user?.email?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0 flex-1">
            <span className="block truncate text-sm text-muted-foreground">{user?.email}</span>
            {user?.planName && (
              <Link
                href="/dashboard/billing"
                className="text-[11px] font-medium text-forest hover:underline"
              >
                {user.planName} plan
              </Link>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
