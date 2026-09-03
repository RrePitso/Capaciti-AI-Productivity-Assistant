// src/app/(dashboard)/dashboard/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { GraduationCap, FileBarChart, ListChecks, Mail } from 'lucide-react';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { ActivityFeed, type ActivityItem } from '@/components/dashboard/ActivityFeed';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import type { KpiSummary } from '@/types';

export default function DashboardPage() {
  const { data: kpis } = useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: async () => (await axios.get<{ data: KpiSummary }>('/api/dashboard/kpis')).data.data,
  });

  const { data: activity } = useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: async () => (await axios.get<{ data: ActivityItem[] }>('/api/dashboard/activity')).data.data,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-capaciti-navy">Dashboard</h1>
        <p className="text-sm text-capaciti-grey">
          A central overview of productivity, learners, reports, meetings, and AI activity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Active Learners" value={kpis?.activeLearners ?? '—'} icon={GraduationCap} />
        <KpiCard label="Pending Reports" value={kpis?.pendingReports ?? '—'} icon={FileBarChart} />
        <KpiCard label="Tasks Due Today" value={kpis?.tasksDueToday ?? '—'} icon={ListChecks} />
        <KpiCard label="Emails Sent" value={kpis?.emailsSent ?? '—'} icon={Mail} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <ActivityFeed items={activity ?? []} />
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Insights</CardTitle>
            </CardHeader>
            <CardContent>
              3 learners have overdue check-ins this week. Consider prioritising outreach via the
              Communication Assistant.
            </CardContent>
          </Card>
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
