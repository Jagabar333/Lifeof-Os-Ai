"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { Task, CreateTaskInput, UpdateTaskInput, PaginationInput } from "@lifeos/shared";
import { apiClient } from "@/lib/api/client";

const TASKS_KEY = ["tasks"] as const;

export function useTasks(pagination?: PaginationInput, filters?: Record<string, string>) {
  return useQuery({
    queryKey: [...TASKS_KEY, pagination, filters],
    queryFn: () =>
      apiClient.get<{
        data: Task[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      }>("/api/tasks", {
        params: { ...pagination, ...filters },
      }),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: [...TASKS_KEY, id],
    queryFn: () => apiClient.get<Task>(`/api/tasks/${id}`),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskInput) =>
      apiClient.post<Task>("/api/tasks", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) =>
      apiClient.patch<Task>(`/api/tasks/${id}`, input),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: TASKS_KEY });
      qc.invalidateQueries({ queryKey: [...TASKS_KEY, data.id] });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<{ id: string }>(`/api/tasks/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
  });
}
