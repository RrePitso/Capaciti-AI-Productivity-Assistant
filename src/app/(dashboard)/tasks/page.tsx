// src/app/(dashboard)/tasks/page.tsx
import { TaskBoard } from '@/components/tasks/TaskBoard';

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-capaciti-navy">Task Planner</h1>
        <p className="text-sm text-capaciti-grey">
          Organize priorities across your own tasks and action items generated from meetings.
        </p>
      </div>
      <TaskBoard />
    </div>
  );
}
