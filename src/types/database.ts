// src/types/database.ts
// Mirrors the schema in CAPACITI_AI_Assistant_Database_Design_Document.pdf

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

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

// Supabase client compatible Database type
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          full_name: string;
          role?: UserRole;
          department?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Profile>;
        Relationships: [];
      };
      emails: {
        Row: EmailRecord;
        Insert: {
          id?: string;
          user_id: string;
          recipient_name?: string | null;
          recipient_type?: 'learner' | 'stakeholder' | 'management' | 'facilitator' | null;
          subject?: string | null;
          purpose?: string | null;
          context?: string | null;
          email_body?: string | null;
          suggested_next_action?: string | null;
          created_at?: string;
        };
        Update: Partial<EmailRecord>;
        Relationships: [];
      };
      meetings: {
        Row: Meeting;
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          meeting_type?: string | null;
          meeting_date?: string | null;
          transcript?: string | null;
          created_at?: string;
        };
        Update: Partial<Meeting>;
        Relationships: [];
      };
      meeting_summaries: {
        Row: MeetingSummary;
        Insert: {
          id?: string;
          meeting_id: string;
          executive_summary?: string | null;
          key_discussions?: string[] | null;
          decisions?: string[] | null;
          risks?: string[] | null;
          next_steps?: string[] | null;
          created_at?: string;
        };
        Update: Partial<MeetingSummary>;
        Relationships: [];
      };
      tasks: {
        Row: Task;
        Insert: {
          id?: string;
          summary_id?: string | null;
          assigned_user_id?: string | null;
          title: string;
          description?: string | null;
          priority?: TaskPriority;
          effort?: string | null;
          dependency?: string | null;
          status?: TaskStatus;
          due_date?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Task>;
        Relationships: [];
      };
      reports: {
        Row: Report;
        Insert: {
          id?: string;
          user_id: string;
          report_type?: ReportType | string;
          report_title: string;
          report_data?: Record<string, unknown> | null;
          executive_summary?: string | null;
          findings?: string[] | null;
          recommendations?: string[] | null;
          conclusion?: string | null;
          created_at?: string;
        };
        Update: Partial<Report>;
        Relationships: [];
      };
      chat_sessions: {
        Row: ChatSession;
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          module_type?: string | null;
          started_at?: string;
          ended_at?: string | null;
        };
        Update: Partial<ChatSession>;
        Relationships: [];
      };
      chat_messages: {
        Row: ChatMessage;
        Insert: {
          id?: string;
          session_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          tokens_used?: number;
          created_at?: string;
        };
        Update: Partial<ChatMessage>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      task_priority: TaskPriority;
      task_status: TaskStatus;
      report_type: ReportType;
    };
    CompositeTypes: Record<string, never>;
  };
};
