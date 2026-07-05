"use server";

import { z } from "zod";

import { signUpSchema } from "@/features/auth/schemas/auth";
import { getAuthErrorMessage } from "@/features/auth/utils/auth-error";
import {
  actionError,
  actionSuccess,
  type ActionState,
} from "@/lib/actions/action-state";
import { publicEnvironment } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function signUp(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const result = signUpSchema.safeParse({
    email: formData.get("email"),
    fullName: formData.get("fullName"),
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
    const { error } = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
        data: { full_name: result.data.fullName },
        emailRedirectTo: `${publicEnvironment.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (error) {
      return actionError(getAuthErrorMessage(error.message));
    }
  } catch {
    return actionError("Something went wrong. Try again.");
  }

  return actionSuccess("Check your email to confirm your account.");
}
