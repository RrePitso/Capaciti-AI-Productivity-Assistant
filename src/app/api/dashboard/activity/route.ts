// src/app/api/dashboard/activity/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ActivityItem } from '@/components/dashboard/ActivityFeed';

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const [{ data: emails }, { data: meetings }, { data: tasks }, { data: reports }] = await Promise.all([
    supabase.from('emails').select('id, subject, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('meetings').select('id, title, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('tasks').select('id, title, created_at').eq('assigned_user_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('reports').select('id, report_title, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
  ]);

  const items: ActivityItem[] = [
    ...(emails ?? []).map((e) => ({ id: e.id, type: 'email' as const, title: e.subject ?? 'Untitled email', timestamp: e.created_at })),
    ...(meetings ?? []).map((m) => ({ id: m.id, type: 'meeting' as const, title: m.title, timestamp: m.created_at })),
    ...(tasks ?? []).map((t) => ({ id: t.id, type: 'task' as const, title: t.title, timestamp: t.created_at })),
    ...(reports ?? []).map((r) => ({ id: r.id, type: 'report' as const, title: r.report_title, timestamp: r.created_at })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  return NextResponse.json({ data: items });
}
