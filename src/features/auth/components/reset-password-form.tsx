"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { AuthCard } from "@/features/auth/components/auth-card";
import { PasswordField } from "@/features/auth/components/password-field";
import { resetPassword } from "@/features/auth/actions/reset-password";

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters."),
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(resetPassword, {
    status: "idle",
  });

  const {
    formState: { errors },
    register,
    setError,
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "" },
  });

  useEffect(() => {
    if (state.status === "error" && state.fieldErrors) {
      for (const [field, messages] of Object.entries(state.fieldErrors)) {
        if (messages?.[0]) {
          setError(field as keyof ResetPasswordValues, {
            message: messages[0],
          });
        }
      }
    }
  }, [state, setError]);

  return (
    <AuthCard>
      <div className="mb-6 space-y-1.5">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Set new password
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose a strong password for your account.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <PasswordField
          autoComplete="new-password"
          autoFocus
          error={errors.password?.message}
          label="New password"
          placeholder="At least 8 characters"
          {...register("password")}
        />

        {state.status === "error" && !state.fieldErrors ? (
          <p className="text-xs text-negative" role="alert">
            {state.message}
          </p>
        ) : null}

        <Button
          className="w-full"
          isLoading={isPending}
          size="lg"
          type="submit"
        >
          Reset password
          <ArrowRight aria-hidden="true" className="size-4" />
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        <Link
          className="font-medium text-foreground underline-offset-2 outline-none transition-colors duration-fast hover:text-foreground/80 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          href="/auth/login"
        >
          Back to sign in
        </Link>
      </p>
    </AuthCard>
  );
}
