import { z } from "zod";

export const goalStatusSchema = z.enum(["not_started", "in_progress", "completed", "abandoned"]);

export const goalCategorySchema = z.enum([
  "health",
  "fitness",
  "career",
  "finance",
  "education",
  "personal",
  "relationships",
  "creative",
  "spiritual",
  "other",
]);

export const createGoalSchema = z.object({
  title: z.string().min(1, "Goal title is required").max(500),
  description: z.string().max(5000).nullable(),
  status: goalStatusSchema.default("not_started"),
  targetDate: z.string().datetime({ offset: true }).nullable(),
  category: goalCategorySchema.default("personal"),
  milestones: z
    .array(
      z.object({
        id: z.string().uuid().optional(),
        title: z.string().min(1).max(200),
      }),
    )
    .max(50)
    .default([]),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;

export const updateGoalSchema = createGoalSchema.partial().required({ title: true });

export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;

export const goalFiltersSchema = z.object({
  status: goalStatusSchema.optional(),
  category: goalCategorySchema.optional(),
  search: z.string().max(200).optional(),
});

export type GoalFilters = z.infer<typeof goalFiltersSchema>;
