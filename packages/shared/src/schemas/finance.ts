import { z } from "zod";

export const financeAccountTypeSchema = z.enum([
  "checking",
  "savings",
  "credit",
  "investment",
  "cash",
  "other",
]);

export const createFinanceAccountSchema = z.object({
  name: z.string().min(1).max(200),
  type: financeAccountTypeSchema.default("checking"),
  balance: z.number().default(0),
  currency: z.string().length(3).default("USD"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().default(null),
  icon: z.string().max(50).nullable().default(null),
});

export type CreateFinanceAccountInput = z.infer<typeof createFinanceAccountSchema>;

export const createTransactionSchema = z.object({
  accountId: z.string().uuid(),
  amount: z.number(),
  type: z.enum(["income", "expense", "transfer"]),
  category: z.string().min(1).max(100),
  description: z.string().max(1000),
  date: z.string().datetime({ offset: true }),
  tags: z.array(z.string().max(50)).max(20).default([]),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

export const transactionFiltersSchema = z.object({
  accountId: z.string().uuid().optional(),
  type: z.enum(["income", "expense", "transfer"]).optional(),
  category: z.string().optional(),
  startDate: z.string().datetime({ offset: true }).optional(),
  endDate: z.string().datetime({ offset: true }).optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  search: z.string().max(200).optional(),
});

export type TransactionFilters = z.infer<typeof transactionFiltersSchema>;
