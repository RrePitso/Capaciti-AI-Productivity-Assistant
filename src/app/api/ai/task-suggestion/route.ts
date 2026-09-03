// src/app/api/ai/task-suggestion/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getJsonCompletion } from '@/lib/ai/openai';
import { TASK_SUGGESTION_SYSTEM_PROMPT, buildTaskSuggestionUserPrompt } from '@/lib/ai/prompts';

const requestSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});

interface TaskSuggestion {
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  effort: string | null;
  dependency: string | null;
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

  let suggestion: TaskSuggestion;
  try {
    suggestion = await getJsonCompletion<TaskSuggestion>({
      system: TASK_SUGGESTION_SYSTEM_PROMPT,
      user: buildTaskSuggestionUserPrompt(input),
    });
  } catch {
    return NextResponse.json({ error: 'AI suggestion failed. Please try again.' }, { status: 502 });
  }

  return NextResponse.json({ data: suggestion });
}
