import { z } from "zod";

export const habitFrequencySchema = z.enum(["daily", "weekly", "monthly"]);

export const createHabitSchema = z.object({
  name: z.string().min(1, "Habit name is required").max(200),
  description: z.string().max(1000).nullable(),
  frequency: habitFrequencySchema.default("daily"),
  targetCount: z.number().int().positive().default(1),
  category: z.string().max(50).default("other"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .default("#2563EB"),
  icon: z.string().max(50).default("✨"),
});

export type CreateHabitInput = z.infer<typeof createHabitSchema>;

export const updateHabitSchema = createHabitSchema.partial().required({ name: true });

export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;

export const logHabitSchema = z.object({
  habitId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  count: z.number().int().min(0).default(1),
});

export type LogHabitInput = z.infer<typeof logHabitSchema>;
