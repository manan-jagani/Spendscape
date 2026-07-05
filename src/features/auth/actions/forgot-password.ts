"use server";

import { z } from "zod";

import {
  actionError,
  actionSuccess,
  type ActionState,
} from "@/lib/actions/action-state";
import { publicEnvironment } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

export async function forgotPassword(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const result = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!result.success) {
    return actionError(
      "Check the highlighted fields.",
      z.flattenError(result.error).fieldErrors,
    );
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(
      result.data.email,
      {
        redirectTo: `${publicEnvironment.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/auth/reset-password`,
      },
    );

    if (error) {
      return actionError("Could not send a reset link. Try again.");
    }
  } catch {
    return actionError("Something went wrong. Try again.");
  }

  return actionSuccess("Check your email for a password reset link.");
}
