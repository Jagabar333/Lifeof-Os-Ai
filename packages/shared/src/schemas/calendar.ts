import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(1, "Event title is required").max(500),
  description: z.string().max(5000).nullable(),
  startTime: z.string().datetime({ offset: true }),
  endTime: z.string().datetime({ offset: true }),
  allDay: z.boolean().default(false),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().default(null),
  location: z.string().max(500).nullable(),
  reminderMinutes: z.number().int().nullable().default(15),
  recurrenceRule: z.string().max(200).nullable(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;

export const updateEventSchema = createEventSchema.partial().required({ title: true });

export type UpdateEventInput = z.infer<typeof updateEventSchema>;

export const eventFiltersSchema = z.object({
  startDate: z.string().datetime({ offset: true }).optional(),
  endDate: z.string().datetime({ offset: true }).optional(),
  search: z.string().max(200).optional(),
});

export type EventFilters = z.infer<typeof eventFiltersSchema>;
