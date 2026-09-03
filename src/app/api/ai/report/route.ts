// src/app/api/ai/report/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getJsonCompletion } from '@/lib/ai/openai';
import { REPORT_SYSTEM_PROMPT, buildReportUserPrompt } from '@/lib/ai/prompts';

const requestSchema = z.object({
  reportType: z.string().min(1),
  reportTitle: z.string().min(1),
  dateRange: z.string().min(1),
  dataSummary: z.string().min(1),
});

interface ReportCompletion {
  executive_summary: string;
  findings: string[];
  recommendations: string[];
  conclusion: string;
}

export async function POST(request: Request) {
  const supabase = await createClient();

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

  const input = parsed.data;

  let completion: ReportCompletion;
  try {
    completion = await getJsonCompletion<ReportCompletion>({
      system: REPORT_SYSTEM_PROMPT,
      user: buildReportUserPrompt({
        reportType: input.reportType,
        dateRange: input.dateRange,
        dataSummary: input.dataSummary,
      }),
    });
  } catch {
    return NextResponse.json({ error: 'AI report generation failed. Please try again.' }, { status: 502 });
  }

  const { data: report, error: dbError } = await supabase
    .from('reports')
    .insert({
      user_id: user.id,
      report_type: input.reportType,
      report_title: input.reportTitle,
      report_data: { date_range: input.dateRange },
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

  return NextResponse.json({ data: report });
}
