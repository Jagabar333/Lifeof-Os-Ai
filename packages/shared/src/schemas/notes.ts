import { z } from "zod";

export const createNoteSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  content: z.string().max(100000),
  folderId: z.string().uuid().nullable(),
  tags: z.array(z.string().max(50)).max(20).default([]),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;

export const updateNoteSchema = createNoteSchema.partial().required({ title: true });

export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

export const noteFiltersSchema = z.object({
  folderId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().max(200).optional(),
  isPinned: z.boolean().optional(),
});

export type NoteFilters = z.infer<typeof noteFiltersSchema>;
