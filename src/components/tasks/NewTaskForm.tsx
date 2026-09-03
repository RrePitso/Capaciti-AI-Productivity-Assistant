// src/components/tasks/NewTaskForm.tsx
'use client';

import { useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import axios from 'axios';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useTasks } from '@/hooks/useTasks';
import type { TaskPriority } from '@/types/database';

interface Suggestion {
  priority: TaskPriority;
  effort: string;
  dependency: string | null;
}

export function NewTaskForm() {
  const { createTask } = useTasks();
  const [title, setTitle] = useState('');
  const [suggesting, setSuggesting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    let suggestion: Suggestion | null = null;
    try {
      setSuggesting(true);
      const { data } = await axios.post<{ data: Suggestion }>('/api/ai/task-suggestion', { title });
      suggestion = data.data;
    } catch {
      // Non-blocking: fall back to defaults if AI suggestion fails.
    } finally {
      setSuggesting(false);
    }

    createTask.mutate({
      title,
      priority: suggestion?.priority ?? 'P3',
      effort: suggestion?.effort,
      dependency: suggestion?.dependency ?? undefined,
    } as never);

    setTitle('');
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        placeholder="Add a task… AI will suggest priority and effort"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Button type="submit" loading={createTask.isPending || suggesting}>
        {suggesting ? <Sparkles className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        Add
      </Button>
    </form>
  );
}
