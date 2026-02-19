'use client';

import { useEffect, useState } from 'react';
import { applications } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  const statusLabels: Record<string, { label: string; color: string }> = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
    submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-800' },
    interview: { label: 'Interview', color: 'bg-yellow-100 text-yellow-800' },
    offer: { label: 'Offer', color: 'bg-green-100 text-green-800' },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
    withdrawn: { label: 'Withdrawn', color: 'bg-gray-100 text-gray-600' },
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
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.thisWeek}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Interviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{stats.byStatus?.interview || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Offers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.byStatus?.offer || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Status Breakdown */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>By Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(statusLabels).map(([key, { label, color }]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
                          {label}
                        </span>
                      </div>
                      <span className="font-medium">{stats.byStatus?.[key] || 0}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>By Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.byPlatform || {}).length > 0 ? (
                    Object.entries(stats.byPlatform).map(([platform, count]) => (
                      <div key={platform} className="flex items-center justify-between">
                        <span className="capitalize">{platform}</span>
                        <span className="font-medium">{count}</span>
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
