// src/app/api/ai/task-suggestion/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getJsonCompletion } from '@/lib/ai/openai';
import { TASK_SUGGESTION_SYSTEM_PROMPT, buildTaskSuggestionUserPrompt } from '@/lib/ai/prompts';
import type { TaskPriority } from '@/types/database';

const requestSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});

interface SuggestionCompletion {
  priority: TaskPriority;
  effort: string;
  dependency: string | null;
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

  try {
    const completion = await getJsonCompletion<SuggestionCompletion>({
      system: TASK_SUGGESTION_SYSTEM_PROMPT,
      user: buildTaskSuggestionUserPrompt(parsed.data),
    });
    return NextResponse.json({ data: completion });
  } catch {
    return NextResponse.json({ error: 'AI suggestion failed' }, { status: 502 });
  }
}
