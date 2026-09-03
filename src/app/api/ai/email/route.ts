// src/app/api/ai/email/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getJsonCompletion } from '@/lib/ai/openai';
import { EMAIL_SYSTEM_PROMPT, buildEmailUserPrompt } from '@/lib/ai/prompts';

const requestSchema = z.object({
  recipientType: z.enum(['learner', 'stakeholder', 'management', 'facilitator']),
  recipientName: z.string().optional(),
  purpose: z.string().min(1, 'Purpose is required'),
  context: z.string().min(1, 'Context is required'),
  tone: z.string().optional(),
});

interface EmailCompletion {
  subject: string;
  body: string;
  suggested_next_action: string;
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

  let completion: EmailCompletion;
  try {
    completion = await getJsonCompletion<EmailCompletion>({
      system: EMAIL_SYSTEM_PROMPT,
      user: buildEmailUserPrompt(input),
    });
  } catch (err) {
    console.error('[AI Email] Generation failed:', err);
    return NextResponse.json({ error: 'AI generation failed. Please try again.' }, { status: 502 });
  }

  const { data: saved, error: dbError } = await supabase
    .from('emails')
    .insert({
      user_id: user.id,
      recipient_name: input.recipientName ?? null,
      recipient_type: input.recipientType,
      subject: completion.subject,
      purpose: input.purpose,
      context: input.context,
      email_body: completion.body,
      suggested_next_action: completion.suggested_next_action,
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ data: saved });
}
