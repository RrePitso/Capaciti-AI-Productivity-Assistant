// src/app/api/analytics/route.ts
import { NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { startOfWeek, subWeeks, addWeeks, format } from 'date-fns';
import type { Profile, Task, Meeting, EmailRecord } from '@/types';

const ALLOWED_ROLES = ['admin', 'manager'] as const;
const WEEKS_BACK = 8;

function buildWeekBuckets() {
  const now = new Date();
  const start = startOfWeek(subWeeks(now, WEEKS_BACK - 1), { weekStartsOn: 1 });
  return Array.from({ length: WEEKS_BACK }, (_, i) => {
    const weekStart = addWeeks(start, i);
    const weekEnd = addWeeks(weekStart, 1);
    return { label: format(weekStart, 'MMM d'), start: weekStart, end: weekEnd };
  });
}

function countByWeek(dates: (string | null)[], buckets: ReturnType<typeof buildWeekBuckets>) {
  return buckets.map((b) => ({
    label: b.label,
    count: dates.filter((d) => {
      if (!d) return false;
      const dt = new Date(d);
      return dt >= b.start && dt < b.end;
    }).length,
  }));
}

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { data: requesterProfile, error: profileError } = (await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()) as { data: Pick<Profile, 'role'> | null; error: { message: string } | null };

  if (profileError || !requesterProfile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 403 });
  }

  if (!ALLOWED_ROLES.includes(requesterProfile.role as (typeof ALLOWED_ROLES)[number])) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const admin = createServiceRoleClient();

  const [
    { data: allTasks, error: tasksError },
    { data: allMeetings, error: meetingsError },
    { data: allEmails, error: emailsError },
    { data: learners, error: learnersError },
  ] = (await Promise.all([
    admin.from('tasks').select('status'),
    admin.from('meetings').select('created_at'),
    admin.from('emails').select('created_at'),
    admin.from('profiles').select('id, full_name, department').eq('role', 'learner'),
  ])) as [
    { data: Pick<Task, 'status'>[] | null; error: { message: string } | null },
    { data: Pick<Meeting, 'created_at'>[] | null; error: { message: string } | null },
    { data: Pick<EmailRecord, 'created_at'>[] | null; error: { message: string } | null },
    { data: Pick<Profile, 'id' | 'full_name' | 'department'>[] | null; error: { message: string } | null }
  ];

  if (tasksError) return NextResponse.json({ error: tasksError.message }, { status: 500 });
  if (meetingsError) return NextResponse.json({ error: meetingsError.message }, { status: 500 });
  if (emailsError) return NextResponse.json({ error: emailsError.message }, { status: 500 });
  if (learnersError) return NextResponse.json({ error: learnersError.message }, { status: 500 });

  const totalTasks = allTasks?.length ?? 0;
  const completedTasks = (allTasks ?? []).filter((t) => t.status === 'Completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const buckets = buildWeekBuckets();
  const meetingsPerWeek = countByWeek((allMeetings ?? []).map((m) => m.created_at), buckets);
  const emailsPerWeek = countByWeek((allEmails ?? []).map((e) => e.created_at), buckets);

  const learnerIds = (learners ?? []).map((l) => l.id);
  let learnerProgress: {
    id: string;
    full_name: string;
    department: string | null;
    tasksCompleted: number;
    tasksTotal: number;
  }[] = [];

  if (learnerIds.length > 0) {
    const { data: learnerTasks, error: learnerTasksError } = (await admin
      .from('tasks')
      .select('assigned_user_id, status')
      .in('assigned_user_id', learnerIds)) as {
      data: Pick<Task, 'assigned_user_id' | 'status'>[] | null;
      error: { message: string } | null;
    };

    if (learnerTasksError) {
      return NextResponse.json({ error: learnerTasksError.message }, { status: 500 });
    }

    const perLearner = new Map<string, { total: number; completed: number }>();
    for (const t of learnerTasks ?? []) {
      const key = t.assigned_user_id as string;
      const entry = perLearner.get(key) ?? { total: 0, completed: 0 };
      entry.total += 1;
      if (t.status === 'Completed') entry.completed += 1;
      perLearner.set(key, entry);
    }

    learnerProgress = (learners ?? [])
      .map((l) => {
        const stats = perLearner.get(l.id) ?? { total: 0, completed: 0 };
        return {
          id: l.id,
          full_name: l.full_name,
          department: l.department,
          tasksCompleted: stats.completed,
          tasksTotal: stats.total,
        };
      })
      .sort((a, b) => b.tasksCompleted - a.tasksCompleted)
      .slice(0, 10);
  }

  return NextResponse.json({
    data: {
      taskCompletion: { total: totalTasks, completed: completedTasks, rate: completionRate },
      meetingsPerWeek,
      emailsPerWeek,
      learnerProgress,
    },
  });
}
