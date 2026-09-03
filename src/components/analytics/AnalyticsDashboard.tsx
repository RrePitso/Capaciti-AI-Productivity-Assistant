// src/components/analytics/AnalyticsDashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, TrendingUp } from 'lucide-react';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { WeeklyBarChart } from './WeeklyBarChart';
import type { AnalyticsData } from '@/types';

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/analytics')
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? 'Failed to load analytics');
        if (!cancelled) setData(json.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p className="text-sm text-capaciti-grey">Loading analytics...</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <KpiCard
          label="Task Completion Rate"
          value={`${data.taskCompletion.rate}%`}
          icon={TrendingUp}
          trend={`${data.taskCompletion.completed}/${data.taskCompletion.total} tasks completed`}
          trendTone="neutral"
        />
        <KpiCard label="Total Tasks Tracked" value={data.taskCompletion.total} icon={CheckCircle2} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meeting Volume (last 8 weeks)</CardTitle>
        </CardHeader>
        <CardContent>
          <WeeklyBarChart title="Meetings per week" data={data.meetingsPerWeek} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Volume (last 8 weeks)</CardTitle>
        </CardHeader>
        <CardContent>
          <WeeklyBarChart title="Emails per week" data={data.emailsPerWeek} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Learner Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {data.learnerProgress.length === 0 ? (
            <p>No learner data yet.</p>
          ) : (
            <div className="space-y-2">
              {data.learnerProgress.map((l) => (
                <div key={l.id} className="flex items-center justify-between border-b border-border py-2 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-capaciti-navy">{l.full_name}</p>
                    {l.department && <p className="text-xs text-capaciti-grey">{l.department}</p>}
                  </div>
                  <Badge tone={l.tasksTotal > 0 && l.tasksCompleted === l.tasksTotal ? 'green' : 'blue'}>
                    {l.tasksCompleted}/{l.tasksTotal} tasks
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}