"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, MailCheck } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthField } from "@/features/auth/components/auth-field";
import { forgotPassword } from "@/features/auth/actions/forgot-password";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(forgotPassword, {
    status: "idle",
  });

  const {
    formState: { errors },
    register,
    setError,
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    if (state.status === "error" && state.fieldErrors) {
      for (const [field, messages] of Object.entries(state.fieldErrors)) {
        if (messages?.[0]) {
          setError(field as keyof ForgotPasswordValues, {
            message: messages[0],
          });
        }
      }
    }
  }, [state, setError]);

  if (state.status === "success") {
    return (
      <AuthCard>
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-positive/15">
            <MailCheck
              aria-hidden="true"
              className="size-6 text-positive"
            />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Check your email
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {state.message}
          </p>
          <p className="mt-6 text-xs text-muted-foreground">
            Remember your password?{" "}
            <Link
              className="font-medium text-foreground underline-offset-2 outline-none transition-colors duration-fast hover:text-foreground/80 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
              href="/auth/login"
            >
              Sign in
            </Link>
          </p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <div className="mb-6 space-y-1.5">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Reset your password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <AuthField
          autoComplete="email"
          autoFocus
          error={errors.email?.message}
          label="Email"
          placeholder="hello@example.com"
          type="email"
          {...register("email")}
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
          Send reset link
          <ArrowRight aria-hidden="true" className="size-4" />
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-2 outline-none transition-colors duration-fast hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          href="/auth/login"
        >
          <ArrowLeft aria-hidden="true" className="size-3" />
          Back to sign in
        </Link>
      </div>
    </AuthCard>
  );
}
