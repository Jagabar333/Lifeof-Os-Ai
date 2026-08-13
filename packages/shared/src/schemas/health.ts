import { z } from "zod";

export const healthMetricTypeSchema = z.enum([
  "weight",
  "height",
  "sleep_hours",
  "steps",
  "calories",
  "water",
  "heart_rate",
  "blood_pressure_systolic",
  "blood_pressure_diastolic",
  "mood",
]);

export const createHealthMetricSchema = z.object({
  type: healthMetricTypeSchema,
  value: z.number(),
  unit: z.string().max(20),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().max(1000).nullable(),
});

export type CreateHealthMetricInput = z.infer<typeof createHealthMetricSchema>;

export const healthFiltersSchema = z.object({
  type: healthMetricTypeSchema.optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type HealthFilters = z.infer<typeof healthFiltersSchema>;
