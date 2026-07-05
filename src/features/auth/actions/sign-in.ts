"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { signInSchema } from "@/features/auth/schemas/auth";
import { getAuthErrorMessage } from "@/features/auth/utils/auth-error";
import {
  actionError,
  type ActionState,
} from "@/lib/actions/action-state";
import { getSafeRedirectPath } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";

export async function signIn(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const result = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") ?? undefined,
  });

  if (!result.success) {
    return actionError(
      "Check the highlighted fields.",
      z.flattenError(result.error).fieldErrors,
    );
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: result.data.email,
      password: result.data.password,
    });

    if (error) {
      return actionError(getAuthErrorMessage(error.message));
    }
  } catch {
    return actionError("Something went wrong. Try again.");
  }

  redirect(getSafeRedirectPath(result.data.next));
}
