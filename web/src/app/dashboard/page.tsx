'use client';

import { useEffect, useState } from 'react';
import { applications } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, TrendingUp, MessageSquare, Trophy } from 'lucide-react';

interface Stats {
  total: number;
  thisWeek: number;
  byStatus: Record<string, number>;
  byPlatform: Record<string, number>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applications
      .stats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusLabels: Record<string, { label: string; dotColor: string }> = {
    draft: { label: 'Draft', dotColor: 'bg-muted-foreground' },
    submitted: { label: 'Submitted', dotColor: 'bg-primary' },
    interview: { label: 'Interview', dotColor: 'bg-yellow-500' },
    offer: { label: 'Offer', dotColor: 'bg-green-500' },
    rejected: { label: 'Rejected', dotColor: 'bg-destructive' },
    withdrawn: { label: 'Withdrawn', dotColor: 'bg-muted-foreground' },
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your job application activity</p>
      </div>

      {loading ? (
        <div className="animate-pulse text-muted-foreground">Loading stats...</div>
      ) : !stats ? (
        <p className="text-muted-foreground">No data yet. Start tracking your applications!</p>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Total Applications', value: stats.total, icon: FileText, color: 'text-primary' },
              { label: 'This Week', value: stats.thisWeek, icon: TrendingUp, color: 'text-primary' },
              { label: 'Interviews', value: stats.byStatus?.interview || 0, icon: MessageSquare, color: 'text-yellow-500' },
              { label: 'Offers', value: stats.byStatus?.offer || 0, icon: Trophy, color: 'text-green-500' },
            ].map((item) => (
              <Card key={item.label} className="border-border/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {item.label}
                  </CardTitle>
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${item.color}`}>{item.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Status & Platform Breakdown */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>By Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(statusLabels).map(([key, { label, dotColor }]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block h-2.5 w-2.5 rounded-full ${dotColor}`} />
                        <span className="text-sm">{label}</span>
                      </div>
                      <span className="font-medium tabular-nums">{stats.byStatus?.[key] || 0}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>By Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.byPlatform || {}).length > 0 ? (
                    Object.entries(stats.byPlatform).map(([platform, count]) => (
                      <div key={platform} className="flex items-center justify-between">
                        <span className="capitalize text-sm">{platform}</span>
                        <span className="font-medium tabular-nums">{count}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No applications yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
