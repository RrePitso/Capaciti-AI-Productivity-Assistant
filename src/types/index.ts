// src/types/index.ts
export * from './database';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface KpiSummary {
  activeLearners: number;
  pendingReports: number;
  tasksDueToday: number;
  emailsSent: number;
}

export interface LearnerActivitySummary {
  id: string;
  full_name: string;
  department: string | null;
  avatar_url: string | null;
  created_at: string;
  taskSummary: { total: number; completed: number; pending: number };
  emailsSent: number;
}

export interface WeeklyCount {
  label: string;
  count: number;
}

export interface LearnerProgressEntry {
  id: string;
  full_name: string;
  department: string | null;
  tasksCompleted: number;
  tasksTotal: number;
}

export interface AnalyticsData {
  taskCompletion: { total: number; completed: number; rate: number };
  meetingsPerWeek: WeeklyCount[];
  emailsPerWeek: WeeklyCount[];
  learnerProgress: LearnerProgressEntry[];
}
