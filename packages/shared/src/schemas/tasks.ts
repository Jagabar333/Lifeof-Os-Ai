import { z } from "zod";

export const taskStatusSchema = z.enum(["inbox", "todo", "in_progress", "done", "archived"]);
export const taskPrioritySchema = z.enum(["none", "low", "medium", "high", "urgent"]);

export const createTaskSchema = z.object({
  title: z.string().min(1, "Task title is required").max(500),
  description: z.string().max(5000).optional().nullable(),
  status: taskStatusSchema.optional().default("inbox"),
  priority: taskPrioritySchema.optional().default("none"),
  dueDate: z.string().datetime({ offset: true }).optional().nullable(),
  dueTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  tags: z.array(z.string().max(50)).max(20).optional().default([]),
  categoryId: z.string().uuid().optional().nullable(),
  recurrenceRule: z.string().max(200).optional().nullable(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = createTaskSchema.partial();

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const taskFiltersSchema = z.object({
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  categoryId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  dueBefore: z.string().datetime({ offset: true }).optional(),
  dueAfter: z.string().datetime({ offset: true }).optional(),
  search: z.string().max(200).optional(),
});

export type TaskFilters = z.infer<typeof taskFiltersSchema>;

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().max(50).optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
