// src/app/(dashboard)/reports/page.tsx
import { ReportBuilderForm } from '@/components/reports/ReportBuilderForm';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-capaciti-navy">Report Generator</h1>
        <p className="text-sm text-capaciti-grey">
          One-click reports grounded in your tasks, meetings, and communications for the selected
          date range.
        </p>
      </div>
      <ReportBuilderForm />
    </div>
  );
}
