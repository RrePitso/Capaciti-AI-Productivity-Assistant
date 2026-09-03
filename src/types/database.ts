// src/types/database.ts
// Mirrors the schema in CAPACITI_AI_Assistant_Database_Design_Document.pdf

export type UserRole = 'learner' | 'facilitator' | 'manager' | 'admin';

export interface Profile {
  id: string; // = auth.users.id
  full_name: string;
  role: UserRole;
  department: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailRecord {
  id: string;
  user_id: string;
  recipient_name: string | null;
  recipient_type: 'learner' | 'stakeholder' | 'management' | 'facilitator' | null;
  subject: string | null;
  purpose: string | null;
  context: string | null;
  email_body: string | null;
  suggested_next_action: string | null;
  created_at: string;
}

export interface Meeting {
  id: string;
  user_id: string;
  title: string;
  meeting_type: string | null;
  meeting_date: string | null;
  transcript: string | null;
  created_at: string;
}

export interface MeetingSummary {
  id: string;
  meeting_id: string;
  executive_summary: string | null;
  key_discussions: string[] | null;
  decisions: string[] | null;
  risks: string[] | null;
  next_steps: string[] | null;
  created_at: string;
}

export type TaskPriority = 'P1' | 'P2' | 'P3' | 'P4';
export type TaskStatus = 'Pending' | 'In Progress' | 'Blocked' | 'Completed';

export interface Task {
  id: string;
  summary_id: string | null;
  assigned_user_id: string | null;
  title: string;
  description: string | null;
  priority: TaskPriority;
  effort: string | null;
  dependency: string | null;
  status: TaskStatus;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
}

export type ReportType = 'progress' | 'monthly' | 'operational' | 'stakeholder';

export interface Report {
  id: string;
  user_id: string;
  report_type: ReportType | string;
  report_title: string;
  report_data: Record<string, unknown> | null;
  executive_summary: string | null;
  findings: string[] | null;
  recommendations: string[] | null;
  conclusion: string | null;
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string | null;
  module_type: string | null;
  started_at: string;
  ended_at: string | null;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens_used: number;
  created_at: string;
}

// Supabase generated-style Database type for typed client usage
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      emails: { Row: EmailRecord; Insert: Partial<EmailRecord>; Update: Partial<EmailRecord> };
      meetings: { Row: Meeting; Insert: Partial<Meeting>; Update: Partial<Meeting> };
      meeting_summaries: {
        Row: MeetingSummary;
        Insert: Partial<MeetingSummary>;
        Update: Partial<MeetingSummary>;
      };
      tasks: { Row: Task; Insert: Partial<Task>; Update: Partial<Task> };
      reports: { Row: Report; Insert: Partial<Report>; Update: Partial<Report> };
      chat_sessions: {
        Row: ChatSession;
        Insert: Partial<ChatSession>;
        Update: Partial<ChatSession>;
      };
      chat_messages: {
        Row: ChatMessage;
        Insert: Partial<ChatMessage>;
        Update: Partial<ChatMessage>;
      };
    };
  };
}
