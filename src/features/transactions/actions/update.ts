"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { actionError, actionSuccess } from "@/lib/actions/action-state";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/actions/action-state";

const updateTransactionSchema = z.object({
  id: z.string().uuid(),
  account_id: z.string().uuid().optional(),
  category_id: z.string().uuid().nullable().optional(),
  kind: z.enum(["income", "expense", "transfer"]).optional(),
  amount: z.number().positive().optional(),
  currency: z.string().min(1).max(3).optional(),
  merchant: z.string().max(255).nullable().optional(),
  description: z.string().max(500).nullable().optional(),
  occurred_at: z.string().datetime().optional(),
  is_recurring: z.boolean().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export async function updateTransaction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    if (key === "amount") {
      raw[key] = Number(value);
    } else if (key === "is_recurring") {
      raw[key] = value === "true";
    } else if (key === "category_id" && value === "") {
      raw[key] = null;
    } else if (key === "merchant" && value === "") {
      raw[key] = null;
    } else if (key === "description" && value === "") {
      raw[key] = null;
    } else if (key === "notes" && value === "") {
      raw[key] = null;
    } else {
      raw[key] = value;
    }
  });

  const result = updateTransactionSchema.safeParse(raw);
  if (!result.success) {
    return actionError("Invalid transaction data", result.error.flatten().fieldErrors);
  }

  const { id, ...updates } = result.data;

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("transactions")
      .update(updates)
      .eq("id", id);

    if (error) throw error;
  } catch {
    return actionError("Failed to update transaction. Please try again.");
  }

  revalidatePath("/transactions");
  return actionSuccess("Transaction updated successfully");
}
