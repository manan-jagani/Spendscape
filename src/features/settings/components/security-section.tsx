"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, LogOut, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field } from "@base-ui/react/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useSignOut } from "@/features/auth/hooks/use-sign-out";
import { useChangePassword } from "@/features/settings/hooks/use-change-password";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password."),
  newPassword: z.string().min(8, "Password must be at least 8 characters."),
});

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export function SecuritySection() {
  const signOut = useSignOut();
  const changePassword = useChangePassword();

  const {
    formState: { errors, isDirty, isValid },
    handleSubmit,
    register,
    reset,
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "" },
  });

  useEffect(() => {
    if (changePassword.isSuccess) {
      reset();
    }
  }, [changePassword.isSuccess, reset]);

  async function onSubmit(values: ChangePasswordValues) {
    await changePassword.mutateAsync(values.newPassword);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security</CardTitle>
        <CardDescription>
          Manage your password and account security.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form id="change-password-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Field.Root className="flex flex-col gap-1.5">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                autoComplete="current-password"
                id="currentPassword"
                placeholder="Enter your current password"
                type="password"
                {...register("currentPassword")}
                data-invalid={!!errors.currentPassword || undefined}
              />
              {errors.currentPassword ? (
                <p className="text-xs text-negative" role="alert">
                  {errors.currentPassword.message}
                </p>
              ) : null}
            </Field.Root>
            <Field.Root className="flex flex-col gap-1.5">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                autoComplete="new-password"
                id="newPassword"
                placeholder="At least 8 characters"
                type="password"
                {...register("newPassword")}
                data-invalid={!!errors.newPassword || undefined}
              />
              {errors.newPassword ? (
                <p className="text-xs text-negative" role="alert">
                  {errors.newPassword.message}
                </p>
              ) : null}
            </Field.Root>
            {changePassword.isSuccess ? (
              <p className="text-xs text-positive" role="status">
                Password updated successfully.
              </p>
            ) : null}
            {changePassword.isError ? (
              <p className="text-xs text-negative" role="alert">
                {changePassword.error?.message ?? "Could not update password. Try again."}
              </p>
            ) : null}
            <Button
              disabled={!isDirty || !isValid}
              isLoading={changePassword.isPending}
              size="sm"
              type="submit"
            >
              <KeyRound aria-hidden="true" className="size-4" />
              Update password
            </Button>
          </div>
        </form>

        <Separator />

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-foreground">Sign out</p>
            <p className="text-xs text-muted-foreground">
              Sign out of your account on this device.
            </p>
          </div>
          <Button
            onClick={signOut}
            size="sm"
            variant="outline"
          >
            <LogOut aria-hidden="true" className="size-4" />
            Sign out
          </Button>
        </div>

        <Separator />

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-foreground">Delete account</p>
            <p className="text-xs text-muted-foreground">
              Permanently delete your account and all your data.
            </p>
          </div>
          <Dialog>
            <DialogTrigger
              render={
                <Button size="sm" variant="outline">
                  <Trash2 aria-hidden="true" className="size-4" />
                  Delete account
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader className="px-6 pt-6">
                <DialogTitle>Delete your account?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. All your data, including
                  accounts, transactions, budgets, and insights will be
                  permanently deleted.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center justify-end gap-2 px-6 pb-6">
                <DialogClose
                  render={
                    <Button size="sm" variant="outline">
                      Cancel
                    </Button>
                  }
                />
                <Button
                  disabled
                  size="sm"
                  variant="danger"
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                  Delete permanently
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
