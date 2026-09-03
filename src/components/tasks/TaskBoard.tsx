// src/components/tasks/TaskBoard.tsx
'use client';

import { useTasks } from '@/hooks/useTasks';
import { TaskCard } from './TaskCard';
import { NewTaskForm } from './NewTaskForm';
import type { TaskStatus } from '@/types/database';

const COLUMNS: TaskStatus[] = ['Pending', 'In Progress', 'Blocked', 'Completed'];

export function TaskBoard() {
  const { tasks, isLoading, updateTaskStatus, deleteTask } = useTasks();

  return (
    <div className="space-y-4">
      <NewTaskForm />

      {isLoading ? (
        <p className="text-sm text-capaciti-grey">Loading tasks…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((column) => {
            const columnTasks = tasks.filter((t) => t.status === column);
            return (
              <div key={column} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-capaciti-navy">{column}</h3>
                  <span className="text-xs text-capaciti-grey">{columnTasks.length}</span>
                </div>
                <div className="space-y-3">
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={(status) => updateTaskStatus.mutate({ id: task.id, status })}
                      onDelete={() => deleteTask.mutate(task.id)}
                    />
                  ))}
                  {columnTasks.length === 0 && (
                    <p className="rounded-card border border-dashed border-border p-4 text-center text-xs text-capaciti-grey">
                      No tasks
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
