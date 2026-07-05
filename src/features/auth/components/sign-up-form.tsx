"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, MailCheck } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthField } from "@/features/auth/components/auth-field";
import { PasswordField } from "@/features/auth/components/password-field";
import { signUp } from "@/features/auth/actions/sign-up";
import { signUpSchema } from "@/features/auth/schemas/auth";

type SignUpValues = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState(signUp, {
    status: "idle",
  });

  const {
    formState: { errors },
    register,
    setError,
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", fullName: "", password: "" },
  });

  useEffect(() => {
    if (state.status === "error" && state.fieldErrors) {
      for (const [field, messages] of Object.entries(state.fieldErrors)) {
        if (messages?.[0]) {
          setError(field as keyof SignUpValues, { message: messages[0] });
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
            Already confirmed?{" "}
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
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Start understanding your finances.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <AuthField
          autoComplete="name"
          autoFocus
          error={errors.fullName?.message}
          label="Full name"
          placeholder="Jane Doe"
          type="text"
          {...register("fullName")}
        />

        <AuthField
          autoComplete="email"
          error={errors.email?.message}
          label="Email"
          placeholder="hello@example.com"
          type="email"
          {...register("email")}
        />

        <PasswordField
          autoComplete="new-password"
          error={errors.password?.message}
          label="Password"
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
          Create account
          <ArrowRight aria-hidden="true" className="size-4" />
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link
          className="font-medium text-foreground underline-offset-2 outline-none transition-colors duration-fast hover:text-foreground/80 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          href="/auth/login"
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
