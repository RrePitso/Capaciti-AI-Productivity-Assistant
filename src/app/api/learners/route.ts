// src/app/api/learners/route.ts
import { NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import type { Profile, Task, EmailRecord } from '@/types';

const ALLOWED_ROLES = ['facilitator', 'manager', 'admin'] as const;

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

  const { data: learners, error: learnersError } = (await admin
    .from('profiles')
    .select('id, full_name, department, avatar_url, created_at')
    .eq('role', 'learner')
    .order('full_name', { ascending: true })) as {
    data: Pick<Profile, 'id' | 'full_name' | 'department' | 'avatar_url' | 'created_at'>[] | null;
    error: { message: string } | null;
  };

  if (learnersError) {
    return NextResponse.json({ error: learnersError.message }, { status: 500 });
  }

  const learnerIds = (learners ?? []).map((l) => l.id);

  if (learnerIds.length === 0) {
    return NextResponse.json({ data: [] });
  }

  const [{ data: tasks, error: tasksError }, { data: emails, error: emailsError }] = (await Promise.all([
    admin.from('tasks').select('assigned_user_id, status').in('assigned_user_id', learnerIds),
    admin.from('emails').select('user_id').in('user_id', learnerIds),
  ])) as [
    { data: Pick<Task, 'assigned_user_id' | 'status'>[] | null; error: { message: string } | null },
    { data: Pick<EmailRecord, 'user_id'>[] | null; error: { message: string } | null }
  ];

  if (tasksError) {
    return NextResponse.json({ error: tasksError.message }, { status: 500 });
  }
  if (emailsError) {
    return NextResponse.json({ error: emailsError.message }, { status: 500 });
  }

  const taskCounts = new Map<string, { total: number; completed: number; pending: number }>();
  for (const t of tasks ?? []) {
    const key = t.assigned_user_id as string;
    const entry = taskCounts.get(key) ?? { total: 0, completed: 0, pending: 0 };
    entry.total += 1;
    if (t.status === 'Completed') entry.completed += 1;
    else entry.pending += 1;
    taskCounts.set(key, entry);
  }

  const emailCounts = new Map<string, number>();
  for (const e of emails ?? []) {
    const key = e.user_id as string;
    emailCounts.set(key, (emailCounts.get(key) ?? 0) + 1);
  }

  const data = (learners ?? []).map((l) => ({
    ...l,
    taskSummary: taskCounts.get(l.id) ?? { total: 0, completed: 0, pending: 0 },
    emailsSent: emailCounts.get(l.id) ?? 0,
  }));

  return NextResponse.json({ data });
}
