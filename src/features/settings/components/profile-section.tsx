"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, LoaderCircle } from "lucide-react";
import { useEffect } from "react";
import { Field } from "@base-ui/react/field";
import { useForm, useController } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectItem,
  SelectList,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useProfile } from "@/features/settings/hooks/use-profile";
import { useUpdateProfile } from "@/features/settings/hooks/use-update-profile";
import {
  CURRENCIES,
  profileFormSchema,
  type ProfileFormValues,
} from "@/features/settings/types";

interface ProfileSectionProps {
  email: string;
}

export function ProfileSection({ email }: ProfileSectionProps) {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
    register,
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { full_name: "", currency: "INR" },
  });

  const { field: currencyField } = useController({
    control,
    name: "currency",
  });

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name ?? "",
        currency: profile.currency,
      });
    }
  }, [profile, reset]);

  async function onSubmit(values: ProfileFormValues) {
    await updateProfile.mutateAsync(values);
    reset(values);
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Your personal information and default currency.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <LoaderCircle aria-hidden="true" className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Your personal information and default currency.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="grid size-14 place-items-center rounded-full bg-accent text-lg font-semibold text-accent-foreground transition-transform duration-fast hover:scale-105 motion-reduce:transition-none">
              {profile?.full_name
                ? profile.full_name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : "?"}
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">
                {profile?.full_name ?? "User"}
              </p>
              <p className="text-xs text-muted-foreground">{email}</p>
            </div>
          </div>

          <Separator />

          <Field.Root className="flex flex-col gap-1.5">
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              placeholder="Your name"
              {...register("full_name")}
              data-invalid={!!errors.full_name || undefined}
            />
            {errors.full_name ? (
              <p className="text-xs text-negative" role="alert">
                {errors.full_name.message}
              </p>
            ) : null}
          </Field.Root>

          <Field.Root className="flex flex-col gap-1.5">
            <Label htmlFor="currency">Preferred currency</Label>
            <Select
              value={currencyField.value}
              onValueChange={(value: string | null) => {
                if (value) currencyField.onChange(value);
              }}
            >
              <SelectTrigger id="currency" data-invalid={!!errors.currency || undefined}>
                <SelectValue placeholder="Select a currency" />
              </SelectTrigger>
              <SelectPopup>
                <SelectList>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectList>
              </SelectPopup>
            </Select>
            {errors.currency ? (
              <p className="text-xs text-negative" role="alert">
                {errors.currency.message}
              </p>
            ) : null}
          </Field.Root>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button
            disabled={!isDirty}
            isLoading={updateProfile.isPending}
            size="sm"
            type="submit"
          >
            {updateProfile.isSuccess && !isDirty ? (
              <>
                <Check aria-hidden="true" className="size-4" />
                Saved
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
