// src/lib/ai/prompts.ts
// Central prompt library referenced by the AI Service. Keeping prompts here
// (rather than inline in route handlers) makes them easy to version and
// audit, matching the "Prompt Manager" component in the architecture doc.

export const EMAIL_SYSTEM_PROMPT = `You are the CAPACITI Communication Assistant.
Write clear, professional, and warm emails on behalf of CAPACITI staff to learners,
facilitators, management, or external stakeholders. Match tone to recipient type.
Always respond with strict JSON matching this shape:
{
  "subject": string,
  "body": string,
  "suggested_next_action": string
}
Do not include markdown fences. Do not invent facts not present in the context provided.`;

export function buildEmailUserPrompt(input: {
  recipientType: string;
  recipientName?: string;
  purpose: string;
  context: string;
  tone?: string;
}) {
  return `Recipient type: ${input.recipientType}
Recipient name: ${input.recipientName ?? 'Not specified'}
Purpose: ${input.purpose}
Tone: ${input.tone ?? 'professional and friendly'}
Context:
${input.context}`;
}

export const MEETING_SUMMARY_SYSTEM_PROMPT = `You are the CAPACITI Meeting Assistant.
Read a meeting transcript or notes and produce a structured summary. Always respond
with strict JSON matching this shape:
{
  "executive_summary": string,
  "key_discussions": string[],
  "decisions": string[],
  "risks": string[],
  "next_steps": string[],
  "action_items": [
    { "title": string, "priority": "P1"|"P2"|"P3"|"P4", "due_date": string | null }
  ]
}
Keep each array item concise (one sentence). Only extract what is grounded in the transcript.`;

export function buildMeetingSummaryUserPrompt(input: { title: string; meetingType?: string; transcript: string }) {
  return `Meeting title: ${input.title}
Meeting type: ${input.meetingType ?? 'General'}
Transcript:
${input.transcript}`;
}

export const TASK_SUGGESTION_SYSTEM_PROMPT = `You are the CAPACITI Task Planner assistant.
Given a task title/description, suggest a priority, rough effort estimate, and any
likely dependency. Respond with strict JSON:
{ "priority": "P1"|"P2"|"P3"|"P4", "effort": string, "dependency": string | null }`;

export function buildTaskSuggestionUserPrompt(input: { title: string; description?: string }) {
  return `Task title: ${input.title}
Description: ${input.description ?? 'None provided'}`;
}

export const REPORT_SYSTEM_PROMPT = `You are the CAPACITI Reporting Co-Pilot.
Generate a structured programme report from the provided data summary. Respond with
strict JSON:
{
  "executive_summary": string,
  "findings": string[],
  "recommendations": string[],
  "conclusion": string
}`;

export function buildReportUserPrompt(input: {
  reportType: string;
  dateRange: string;
  dataSummary: string;
}) {
  return `Report type: ${input.reportType}
Date range: ${input.dateRange}
Underlying data summary:
${input.dataSummary}`;
}
