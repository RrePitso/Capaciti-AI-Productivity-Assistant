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
