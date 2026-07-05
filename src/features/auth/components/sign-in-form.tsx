"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthField } from "@/features/auth/components/auth-field";
import { PasswordField } from "@/features/auth/components/password-field";
import { signIn } from "@/features/auth/actions/sign-in";
import { signInSchema } from "@/features/auth/schemas/auth";

type SignInValues = z.infer<typeof signInSchema>;

export function SignInForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const error = searchParams.get("error");

  const [state, formAction, isPending] = useActionState(signIn, {
    status: "idle",
  });

  const {
    formState: { errors },
    register,
    setError,
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "", next: next ?? undefined },
  });

  useEffect(() => {
    if (state.status === "error" && state.fieldErrors) {
      for (const [field, messages] of Object.entries(state.fieldErrors)) {
        if (messages?.[0]) {
          setError(field as keyof SignInValues, { message: messages[0] });
        }
      }
    }
  }, [state, setError]);

  return (
    <AuthCard>
      <div className="mb-6 space-y-1.5">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your Spendscape account.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <input name="next" type="hidden" value={next ?? ""} />

        <AuthField
          autoComplete="email"
          autoFocus
          error={errors.email?.message}
          label="Email"
          placeholder="hello@example.com"
          type="email"
          {...register("email")}
        />

        <div className="space-y-2">
          <PasswordField
            autoComplete="current-password"
            error={errors.password?.message}
            label="Password"
            placeholder="Enter your password"
            {...register("password")}
          />
          <div className="flex justify-end">
            <Link
              className="text-xs text-muted-foreground underline-offset-2 outline-none transition-colors duration-fast hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
              href="/auth/forgot-password"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {state.status === "error" && !state.fieldErrors ? (
          <p className="text-xs text-negative" role="alert">
            {state.message}
          </p>
        ) : null}

        {error === "auth_callback_failed" ? (
          <p className="text-xs text-negative" role="alert">
            Sign-in link expired or invalid. Try signing in again.
          </p>
        ) : null}

        <Button
          className="w-full"
          isLoading={isPending}
          size="lg"
          type="submit"
        >
          Sign in
          <ArrowRight aria-hidden="true" className="size-4" />
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          className="font-medium text-foreground underline-offset-2 outline-none transition-colors duration-fast hover:text-foreground/80 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          href="/auth/signup"
        >
          Create one
        </Link>
      </p>
    </AuthCard>
  );
}
