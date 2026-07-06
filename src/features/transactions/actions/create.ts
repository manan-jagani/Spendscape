"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { actionError, actionSuccess } from "@/lib/actions/action-state";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/actions/action-state";

const createTransactionSchema = z.object({
  account_id: z.string().uuid(),
  category_id: z.string().uuid().nullable(),
  kind: z.enum(["income", "expense", "transfer"]),
  amount: z.number().positive(),
  currency: z.string().min(1).max(3),
  merchant: z.string().max(255).nullable(),
  description: z.string().max(500).nullable(),
  occurred_at: z.string().datetime(),
  is_recurring: z.boolean(),
  notes: z.string().max(2000).nullable(),
});

export async function createTransaction(
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

  const result = createTransactionSchema.safeParse(raw);
  if (!result.success) {
    return actionError("Invalid transaction data", result.error.flatten().fieldErrors);
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("transactions")
      .insert(result.data as never); // user_id handled by RLS

    if (error) throw error;
  } catch {
    return actionError("Failed to create transaction. Please try again.");
  }

  revalidatePath("/transactions");
  return actionSuccess("Transaction created successfully");
}
