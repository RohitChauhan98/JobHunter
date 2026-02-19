'use client';

import { useEffect, useState, useCallback } from 'react';
import { applications as appsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  platform: string;
  jobUrl: string;
  status: string;
  appliedAt: string | null;
  notes: string;
  createdAt: string;
}

interface ListResult {
  items: Application[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const STATUS_OPTIONS = ['draft', 'submitted', 'interview', 'offer', 'rejected', 'withdrawn'] as const;

const statusStyle: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  submitted: { label: 'Submitted', variant: 'default' },
  interview: { label: 'Interview', variant: 'outline' },
  offer: { label: 'Offer', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'destructive' },
  withdrawn: { label: 'Withdrawn', variant: 'secondary' },
};

export default function ApplicationsPage() {
  const [data, setData] = useState<ListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [message, setMessage] = useState('');

  // Add form
  const [form, setForm] = useState({ jobTitle: '', company: '', platform: '', jobUrl: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const fetchApps = useCallback(async () => {
    setLoading(true);
    try {
      const result = await appsApi.list({
        page,
        limit: 20,
        search: search || undefined,
        status: filterStatus || undefined,
      });
      setData(result);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page, search, filterStatus]);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const addApplication = async () => {
    if (!form.jobTitle || !form.company || !form.jobUrl) return;
    setSaving(true);
    try {
      await appsApi.create({ ...form, status: 'draft' });
      setForm({ jobTitle: '', company: '', platform: '', jobUrl: '', notes: '' });
      setShowAdd(false);
      setMessage('Application added!');
      fetchApps();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await appsApi.update(id, { status });
      setData((prev) =>
        prev
          ? { ...prev, items: prev.items.map((a) => (a.id === id ? { ...a, status } : a)) }
          : prev,
      );
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const deleteApp = async (id: string) => {
    if (!confirm('Delete this application?')) return;
    try {
      await appsApi.delete(id);
      fetchApps();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Applications</h1>
          <p className="text-muted-foreground">Track and manage all your job applications</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)}>{showAdd ? 'Cancel' : '+ Add Application'}</Button>
      </div>

      {message && (
        <div
          className={`rounded-md p-3 text-sm ${message.startsWith('Error') ? 'bg-destructive/10 text-destructive' : 'bg-green-50 text-green-700'}`}
        >
          {message}
          <button className="ml-2 underline" onClick={() => setMessage('')}>dismiss</button>
        </div>
      )}

      {/* Add Form */}
      {showAdd && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">New Application</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Job Title *</Label>
              <Input value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Company *</Label>
              <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Platform</Label>
              <Input
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
                placeholder="greenhouse, lever, workday…"
              />
            </div>
            <div className="space-y-1">
              <Label>Job URL *</Label>
              <Input
                value={form.jobUrl}
                onChange={(e) => setForm({ ...form, jobUrl: e.target.value })}
                type="url"
                placeholder="https://…"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>Notes</Label>
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Button onClick={addApplication} disabled={saving}>
                {saving ? 'Saving…' : 'Save Application'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search by title or company…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-64"
        />
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {statusStyle[s]?.label || s}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="animate-pulse text-muted-foreground">Loading…</div>
      ) : !data || data.items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No applications found. Add one above or start applying with the extension!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {data.items.map((app) => (
            <Card key={app.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-semibold">{app.jobTitle}</h3>
                    <Badge variant={statusStyle[app.status]?.variant || 'secondary'}>
                      {statusStyle[app.status]?.label || app.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {app.company}
                    {app.platform && <span className="ml-2 capitalize">· {app.platform}</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Added {new Date(app.createdAt).toLocaleDateString()}
                    {app.appliedAt && <span> · Applied {new Date(app.appliedAt).toLocaleDateString()}</span>}
                  </p>
                  {app.notes && <p className="mt-1 text-sm text-muted-foreground">{app.notes}</p>}
                </div>

                <div className="ml-4 flex items-center gap-2">
                  <select
                    value={app.status}
                    onChange={(e) => updateStatus(app.id, e.target.value)}
                    className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {statusStyle[s]?.label || s}
                      </option>
                    ))}
                  </select>
                  <a
                    href={app.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Open
                  </a>
                  <Button variant="ghost" size="sm" onClick={() => deleteApp(app.id)}>
                    🗑
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {data.page} of {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
