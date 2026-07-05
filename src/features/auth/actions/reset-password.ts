"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import {
  actionError,
  type ActionState,
} from "@/lib/actions/action-state";
import { createClient } from "@/lib/supabase/server";

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters."),
});

export async function resetPassword(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const result = resetPasswordSchema.safeParse({
    password: formData.get("password"),
  });

  if (!result.success) {
    return actionError(
      "Check the highlighted fields.",
      z.flattenError(result.error).fieldErrors,
    );
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password: result.data.password,
    });

    if (error) {
      return actionError("Could not reset your password. Try again.");
    }
  } catch {
    return actionError("Something went wrong. Try again.");
  }

  redirect("/dashboard");
}
