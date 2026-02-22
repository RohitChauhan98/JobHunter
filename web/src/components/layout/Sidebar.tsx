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
  LogOut,
  Moon,
  Sun,
  Monitor,
  Target,
} from 'lucide-react';

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
  { label: 'Applications', href: '/dashboard/applications', icon: FileText },
  { label: 'AI Assistant', href: '/dashboard/ai', icon: Sparkles },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <aside className="flex w-64 flex-col border-r border-border/50 bg-card/50 backdrop-blur-sm">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border/50 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Target className="h-5 w-5 text-primary" />
        </div>
        <span className="text-lg font-bold gradient-text-blue">JobHunter</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-primary/10 text-primary shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <Icon className={cn('h-4 w-4', active && 'text-primary')} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="px-3 pb-2">
        <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-1">
          <button
            onClick={() => setTheme('light')}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-all',
              theme === 'light'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Sun className="h-3.5 w-3.5" />
            Light
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-all',
              theme === 'dark'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Moon className="h-3.5 w-3.5" />
            Dark
          </button>
          <button
            onClick={() => setTheme('system')}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-all',
              theme === 'system'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Monitor className="h-3.5 w-3.5" />
            Auto
          </button>
        </div>
      </div>

      {/* User / Logout */}
      <div className="border-t border-border/50 p-3">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {user?.email?.[0]?.toUpperCase() || '?'}
          </div>
          <span className="truncate text-sm text-muted-foreground">{user?.email}</span>
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
