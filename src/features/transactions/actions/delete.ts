"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { actionError, actionSuccess } from "@/lib/actions/action-state";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/actions/action-state";

const deleteTransactionSchema = z.object({
  id: z.string().uuid(),
});

export async function deleteTransaction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = formData.get("id");

  const result = deleteTransactionSchema.safeParse({ id });
  if (!result.success) {
    return actionError("Invalid transaction ID");
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", result.data.id);

    if (error) throw error;
  } catch {
    return actionError("Failed to delete transaction. Please try again.");
  }

  revalidatePath("/transactions");
  return actionSuccess("Transaction deleted successfully");
}
