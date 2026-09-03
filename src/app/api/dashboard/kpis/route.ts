// src/app/api/dashboard/kpis/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10);

  const [{ count: emailsSent }, { count: pendingReports }, { count: tasksDueToday }, { count: activeLearners }] =
    await Promise.all([
      supabase.from('emails').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase
        .from('reports')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('report_data->>status', null),
      supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .eq('assigned_user_id', user.id)
        .eq('due_date', today)
        .neq('status', 'Completed'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'learner'),
    ]);

  return NextResponse.json({
    data: {
      activeLearners: activeLearners ?? 0,
      pendingReports: pendingReports ?? 0,
      tasksDueToday: tasksDueToday ?? 0,
      emailsSent: emailsSent ?? 0,
    },
  });
}
