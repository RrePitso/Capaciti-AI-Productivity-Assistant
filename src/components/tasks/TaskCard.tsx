// src/components/tasks/TaskCard.tsx
'use client';

import { Trash2, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { formatDate } from '@/lib/utils';
import type { Task, TaskStatus } from '@/types/database';

const PRIORITY_TONE: Record<Task['priority'], 'red' | 'amber' | 'blue' | 'neutral'> = {
  P1: 'red',
  P2: 'amber',
  P3: 'blue',
  P4: 'neutral',
};

interface TaskCardProps {
  task: Task;
  onStatusChange: (status: TaskStatus) => void;
  onDelete: () => void;
}

export function TaskCard({ task, onStatusChange, onDelete }: TaskCardProps) {
  return (
    <Card className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-capaciti-navy">{task.title}</p>
        <Badge tone={PRIORITY_TONE[task.priority]}>{task.priority}</Badge>
      </div>

      {task.description && <p className="text-xs text-capaciti-grey">{task.description}</p>}

      <div className="flex items-center gap-1 text-xs text-capaciti-grey">
        <Clock className="h-3 w-3" /> Due {formatDate(task.due_date)}
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        <Select
          className="text-xs"
          value={task.status}
          onChange={(e) => onStatusChange(e.target.value as TaskStatus)}
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Blocked">Blocked</option>
          <option value="Completed">Completed</option>
        </Select>
        <button
          onClick={onDelete}
          aria-label="Delete task"
          className="rounded-card p-1.5 text-capaciti-grey hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </Card>
  );
}
