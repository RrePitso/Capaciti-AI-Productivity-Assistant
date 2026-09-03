// src/app/api/ai/report/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getJsonCompletion } from '@/lib/ai/openai';
import { REPORT_SYSTEM_PROMPT, buildReportUserPrompt } from '@/lib/ai/prompts';

const requestSchema = z.object({
  reportType: z.enum(['progress', 'monthly', 'operational', 'stakeholder']),
  reportTitle: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
});

interface ReportCompletion {
  executive_summary: string;
  findings: string[];
  recommendations: string[];
  conclusion: string;
}

export async function POST(request: Request) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { reportType, reportTitle, startDate, endDate } = parsed.data;

  // Pull the underlying data the report will be grounded in (Reporting Service
  // "Fetch Data" step in the architecture doc's Report Generation Flow).
  const [{ data: tasks }, { data: meetings }, { data: emails }] = await Promise.all([
    supabase
      .from('tasks')
      .select('title, status, priority, due_date')
      .eq('assigned_user_id', user.id)
      .gte('created_at', startDate)
      .lte('created_at', endDate),
    supabase
      .from('meetings')
      .select('title, meeting_type, meeting_date')
      .eq('user_id', user.id)
      .gte('created_at', startDate)
      .lte('created_at', endDate),
    supabase
      .from('emails')
      .select('subject, recipient_type, created_at')
      .eq('user_id', user.id)
      .gte('created_at', startDate)
      .lte('created_at', endDate),
  ]);

  const dataSummary = `Tasks (${tasks?.length ?? 0}): ${JSON.stringify(tasks ?? [])}
Meetings (${meetings?.length ?? 0}): ${JSON.stringify(meetings ?? [])}
Emails sent (${emails?.length ?? 0}): ${JSON.stringify(emails ?? [])}`;

  let completion: ReportCompletion;
  try {
    completion = await getJsonCompletion<ReportCompletion>({
      system: REPORT_SYSTEM_PROMPT,
      user: buildReportUserPrompt({
        reportType,
        dateRange: `${startDate} to ${endDate}`,
        dataSummary,
      }),
    });
  } catch {
    return NextResponse.json({ error: 'AI report generation failed. Please try again.' }, { status: 502 });
  }

  const { data: saved, error: dbError } = await supabase
    .from('reports')
    .insert({
      user_id: user.id,
      report_type: reportType,
      report_title: reportTitle,
      report_data: { startDate, endDate, taskCount: tasks?.length ?? 0, meetingCount: meetings?.length ?? 0, emailCount: emails?.length ?? 0 },
      executive_summary: completion.executive_summary,
      findings: completion.findings,
      recommendations: completion.recommendations,
      conclusion: completion.conclusion,
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ data: saved });
}
