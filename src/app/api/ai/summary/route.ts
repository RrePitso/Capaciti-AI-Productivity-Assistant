// src/app/api/ai/summary/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getJsonCompletion } from '@/lib/ai/openai';
import { MEETING_SUMMARY_SYSTEM_PROMPT, buildMeetingSummaryUserPrompt } from '@/lib/ai/prompts';
import type { TaskPriority } from '@/types/database';

const requestSchema = z.object({
  title: z.string().min(1),
  meetingType: z.string().optional(),
  meetingDate: z.string().optional(),
  transcript: z.string().min(1, 'Transcript or notes are required'),
});

interface SummaryCompletion {
  executive_summary: string;
  key_discussions: string[];
  decisions: string[];
  risks: string[];
  next_steps: string[];
  action_items: { title: string; priority: TaskPriority; due_date: string | null }[];
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

  const input = parsed.data;

  // 1. Persist the raw meeting record.
  const { data: meeting, error: meetingError } = await supabase
    .from('meetings')
    .insert({
      user_id: user.id,
      title: input.title,
      meeting_type: input.meetingType ?? null,
      meeting_date: input.meetingDate ?? new Date().toISOString(),
      transcript: input.transcript,
    })
    .select()
    .single();

  if (meetingError) {
    return NextResponse.json({ error: meetingError.message }, { status: 500 });
  }

  // 2. Run AI summarisation.
  let completion: SummaryCompletion;
  try {
    completion = await getJsonCompletion<SummaryCompletion>({
      system: MEETING_SUMMARY_SYSTEM_PROMPT,
      user: buildMeetingSummaryUserPrompt({
        title: input.title,
        meetingType: input.meetingType,
        transcript: input.transcript,
      }),
    });
  } catch {
    return NextResponse.json({ error: 'AI summarisation failed. Please try again.' }, { status: 502 });
  }

  // 3. Persist the structured summary.
  const { data: summary, error: summaryError } = await supabase
    .from('meeting_summaries')
    .insert({
      meeting_id: meeting.id,
      executive_summary: completion.executive_summary,
      key_discussions: completion.key_discussions,
      decisions: completion.decisions,
      risks: completion.risks,
      next_steps: completion.next_steps,
    })
    .select()
    .single();

  if (summaryError) {
    return NextResponse.json({ error: summaryError.message }, { status: 500 });
  }

  // 4. Auto-create tasks from action items (Meeting -> Task Planner integration).
  const tasksToInsert = (completion.action_items ?? []).map((item) => ({
    summary_id: summary.id,
    assigned_user_id: user.id,
    title: item.title,
    priority: item.priority ?? 'P3',
    status: 'Pending' as const,
    due_date: item.due_date,
  }));

  let createdTasks: unknown[] = [];
  if (tasksToInsert.length > 0) {
    const { data: tasks } = await supabase.from('tasks').insert(tasksToInsert).select();
    createdTasks = tasks ?? [];
  }

  return NextResponse.json({ data: { meeting, summary, tasks: createdTasks } });
}
