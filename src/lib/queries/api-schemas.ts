import { z } from "zod";

import type {
  MonthlySummary,
  TransactionsPage,
} from "@/types/api.types";

export const monthlySummarySchema: z.ZodType<MonthlySummary> = z.object({
  total_balance: z.number(),
  income: z.number(),
  expense: z.number(),
  net: z.number(),
  savings_rate: z.number(),
  categories: z.array(
    z.object({
      category_id: z.string().nullable(),
      category_name: z.string().nullable(),
      color: z.string().nullable(),
      total: z.number(),
    }),
  ),
});

export const transactionsPageSchema: z.ZodType<TransactionsPage> = z.object({
  total: z.number(),
  rows: z.array(
    z.object({
      id: z.string(),
      account_id: z.string(),
      account_name: z.string().nullable(),
      category_id: z.string().nullable(),
      category_name: z.string().nullable(),
      category_color: z.string().nullable(),
      kind: z.enum(["income", "expense", "transfer"]),
      amount: z.number(),
      currency: z.string(),
      merchant: z.string().nullable(),
      description: z.string().nullable(),
      occurred_at: z.string(),
      is_recurring: z.boolean(),
      notes: z.string().nullable(),
    }),
  ),
});
