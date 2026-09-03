// src/hooks/useTasks.ts
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { Task, TaskStatus } from '@/types/database';

export function useTasks() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => (await axios.get<{ data: Task[] }>('/api/tasks')).data.data,
  });

  const createTask = useMutation({
    mutationFn: async (input: Partial<Task>) => (await axios.post<{ data: Task }>('/api/tasks', input)).data.data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const updateTaskStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) =>
      (await axios.patch<{ data: Task }>(`/api/tasks/${id}`, { status })).data.data,
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previous = queryClient.getQueryData<Task[]>(['tasks']);
      queryClient.setQueryData<Task[]>(['tasks'], (old) =>
        old?.map((t) => (t.id === id ? { ...t, status } : t))
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(['tasks'], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => (await axios.delete(`/api/tasks/${id}`)).data.data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  return {
    tasks: query.data ?? [],
    isLoading: query.isLoading,
    createTask,
    updateTaskStatus,
    deleteTask,
  };
}
