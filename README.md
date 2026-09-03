# CAPACITI AI Productivity Assistant

Production-ready Next.js 15 (App Router) implementation of the MVP defined in:
- `CAPACITI_AI_Productivity_Assistant_PRD_1.docx`
- `Technical_Architecture_Document.pdf`
- `CAPACITI_AI_Assistant_UX_Design_Specification.pdf`
- `CAPACITI_AI_Assistant_Database_Design_Document.pdf`

Stack: **Next.js 15 + TypeScript + Tailwind CSS + Supabase (Postgres/Auth) + OpenAI**.

## 1. Setup

```bash
npm install
cp .env.example .env.local   # fill in Supabase + OpenAI keys
```

Create a Supabase project, then run the migration:

```bash
# via Supabase CLI
supabase link --project-ref <your-project-ref>
supabase db push
# or paste supabase/migrations/0001_init.sql into the SQL editor
```

Run locally:

```bash
npm run dev
```

## 2. Project structure

```
src/
├── app/
│   ├── (auth)/login, register, auth/callback      → Step 2: Authentication
│   ├── (dashboard)/layout.tsx                      → Sidebar + Header shell
│   ├── (dashboard)/dashboard/page.tsx              → Step 3: Dashboard
│   ├── (dashboard)/communications/page.tsx         → Step 4: Email Generator
│   ├── (dashboard)/meetings/page.tsx                → Step 5: Meeting Summarizer
│   ├── (dashboard)/tasks/page.tsx                   → Step 6: Task Planner
│   ├── (dashboard)/reports/page.tsx                 → Step 7: Reporting
│   ├── api/
│   │   ├── auth/me                                  → session + profile (RBAC)
│   │   ├── dashboard/kpis, activity                  → dashboard data
│   │   ├── ai/email, summary, task-suggestion, report → AI Orchestration Layer
│   │   ├── emails, meetings, tasks, tasks/[id], reports → CRUD / persistence
│   └── layout.tsx, providers.tsx, globals.css
├── components/
│   ├── ui/            → Button, Card, Input, Textarea, Select, Badge (design system)
│   ├── layout/         → Sidebar, Header, AiAssistantPanel
│   ├── dashboard/       → KpiCard, ActivityFeed, QuickActions
│   ├── email/            → EmailGeneratorForm
│   ├── meetings/          → MeetingUploadForm, SummaryView
│   ├── tasks/              → TaskBoard, TaskCard, NewTaskForm
│   └── reports/             → ReportBuilderForm
├── hooks/            → useUser, useTasks (React Query)
├── lib/
│   ├── supabase/       → client.ts (browser), server.ts (RSC/routes), middleware.ts
│   ├── ai/               → openai.ts (LLM wrapper), prompts.ts (prompt library)
│   └── utils.ts
├── store/            → useUIStore (Zustand: sidebar/AI panel state)
├── types/            → database.ts (mirrors the DB design doc), index.ts
└── middleware.ts     → session refresh + route protection

supabase/migrations/0001_init.sql → full schema, indexes, RLS policies, auth trigger
```

## 3. Architecture notes

- **Auth**: Supabase Auth (`auth.users`) is the identity source. A `profiles`
  table (role: learner/facilitator/manager/admin) is auto-created via a
  Postgres trigger on signup, matching the RBAC model in the architecture doc.
- **AI Orchestration**: every AI feature (`/api/ai/*`) follows Prompt Manager
  → Context Builder → LLM Integration → persistence, using
  `getJsonCompletion()` to force structured JSON output that's validated with
  `zod` before it touches the database.
- **RLS**: every table is scoped with Row Level Security so a user can only
  read/write their own emails, meetings, tasks, reports, and chat sessions.
- **Meeting → Task integration**: summarizing a meeting automatically creates
  `tasks` rows from the AI-extracted action items, linked via `summary_id`.

## 4. What's stubbed vs. production-ready

- Core CRUD, AI routes, RLS, and UI are fully wired and functional against a
  real Supabase project once you add your keys.
- Email "Send" and calendar integrations (Outlook/Teams/Google Workspace) are
  UI-ready but intentionally left as integration points — wire them to your
  provider of choice (e.g. Microsoft Graph API, Gmail API) in
  `EmailGeneratorForm`'s Send button handler.
- `learners`, `analytics`, and `administration` nav items are present in the
  Sidebar (per the UX spec's navigation order) but their pages aren't
  scaffolded yet — copy the pattern from `communications` or `tasks` to add
  them next.
