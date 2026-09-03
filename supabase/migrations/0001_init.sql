-- supabase/migrations/0001_init.sql
-- CAPACITI AI Assistant — initial schema
-- Mirrors CAPACITI_AI_Assistant_Database_Design_Document.pdf, adapted to use
-- Supabase Auth (auth.users) as the source of truth for identity, with a
-- `profiles` table for app-specific fields, per the "Recommended Supabase
-- Enhancements" section of that document.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles (extends auth.users)
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('learner', 'facilitator', 'manager', 'admin')),
  department text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create a profile row whenever a new auth user signs up, reading the
-- full_name/role passed in via supabase.auth.signUp({ options: { data } }).
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    coalesce(new.raw_user_meta_data->>'role', 'facilitator')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- emails
-- ---------------------------------------------------------------------------
create table if not exists emails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  recipient_name text,
  recipient_type text,
  subject text,
  purpose text,
  context text,
  email_body text,
  suggested_next_action text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- meetings
-- ---------------------------------------------------------------------------
create table if not exists meetings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  meeting_type text,
  meeting_date timestamptz,
  transcript text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- meeting_summaries
-- ---------------------------------------------------------------------------
create table if not exists meeting_summaries (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references meetings(id) on delete cascade,
  executive_summary text,
  key_discussions jsonb,
  decisions jsonb,
  risks jsonb,
  next_steps jsonb,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- tasks
-- ---------------------------------------------------------------------------
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  summary_id uuid references meeting_summaries(id) on delete set null,
  assigned_user_id uuid references profiles(id) on delete cascade,
  title text not null,
  description text,
  priority text default 'P3' check (priority in ('P1', 'P2', 'P3', 'P4')),
  effort text,
  dependency text,
  status text default 'Pending' check (status in ('Pending', 'In Progress', 'Blocked', 'Completed')),
  due_date date,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- reports
-- ---------------------------------------------------------------------------
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  report_type text,
  report_title text,
  report_data jsonb,
  executive_summary text,
  findings jsonb,
  recommendations jsonb,
  conclusion text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- chat_sessions / chat_messages
-- ---------------------------------------------------------------------------
create table if not exists chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text,
  module_type text,
  started_at timestamptz default now(),
  ended_at timestamptz
);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references chat_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  tokens_used integer default 0,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists idx_emails_user on emails(user_id);
create index if not exists idx_emails_created on emails(created_at desc);
create index if not exists idx_meetings_user on meetings(user_id);
create index if not exists idx_meetings_date on meetings(meeting_date desc);
create index if not exists idx_summary_meeting on meeting_summaries(meeting_id);
create index if not exists idx_tasks_assignee on tasks(assigned_user_id);
create index if not exists idx_tasks_status on tasks(status);
create index if not exists idx_tasks_due on tasks(due_date);
create index if not exists idx_reports_user on reports(user_id);
create index if not exists idx_reports_type on reports(report_type);
create index if not exists idx_chat_session_user on chat_sessions(user_id);
create index if not exists idx_chat_messages_session on chat_messages(session_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table profiles enable row level security;
alter table emails enable row level security;
alter table meetings enable row level security;
alter table meeting_summaries enable row level security;
alter table tasks enable row level security;
alter table reports enable row level security;
alter table chat_sessions enable row level security;
alter table chat_messages enable row level security;

create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

create policy "Users can manage own emails" on emails for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own meetings" on meetings for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can view summaries of own meetings" on meeting_summaries for select
  using (exists (select 1 from meetings m where m.id = meeting_id and m.user_id = auth.uid()));
create policy "Users can insert summaries of own meetings" on meeting_summaries for insert
  with check (exists (select 1 from meetings m where m.id = meeting_id and m.user_id = auth.uid()));

create policy "Users can manage own tasks" on tasks for all
  using (auth.uid() = assigned_user_id) with check (auth.uid() = assigned_user_id);

create policy "Users can manage own reports" on reports for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own chat sessions" on chat_sessions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own chat messages" on chat_messages for all
  using (exists (select 1 from chat_sessions s where s.id = session_id and s.user_id = auth.uid()))
  with check (exists (select 1 from chat_sessions s where s.id = session_id and s.user_id = auth.uid()));
