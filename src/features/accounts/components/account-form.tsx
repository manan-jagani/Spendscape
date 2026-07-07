"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectItemText,
  SelectList,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ACCOUNT_TYPE_COLORS,
  ACCOUNT_TYPE_ICONS,
  ACCOUNT_TYPE_LABELS,
} from "@/features/accounts/types";

import type { AccountFormValues, AccountRow, AccountType } from "@/features/accounts/types";

const accountSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  institution: z.string().max(255),
  type: z.enum(
    ["checking", "savings", "credit_card", "cash", "investment", "loan"],
  ),
  currency: z.string().min(1, "Currency is required").max(3).toUpperCase(),
  current_balance: z.string(),
});

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = (
  Object.entries(ACCOUNT_TYPE_LABELS) as [AccountType, string][]
).map(([value, label]) => ({ value, label }));

interface AccountFormProps {
  account?: AccountRow | null;
  onSubmit: (values: AccountFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function AccountForm({
  account,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: AccountFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: account?.name ?? "",
      institution: account?.institution ?? "",
      type: account?.type ?? "checking",
      currency: account?.currency ?? "INR",
      current_balance: account ? String(account.current_balance) : "",
    },
  });

  const selectedType = useWatch({ control, name: "type" });
  const isEditing = !!account;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground" htmlFor="name">
          Name
        </label>
        <Input
          id="name"
          placeholder="e.g. HDFC Salary Account"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-xs text-negative">{errors.name.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground" htmlFor="type">
          Type
        </label>
        <Select
          value={selectedType}
          onValueChange={(value) =>
            setValue("type", value as AccountType)
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectPopup>
            <SelectList>
              {ACCOUNT_TYPES.map((type) => {
                const Icon = ACCOUNT_TYPE_ICONS[type.value];
                const color = ACCOUNT_TYPE_COLORS[type.value];
                return (
                  <SelectItem key={type.value} value={type.value}>
                    <Icon
                      className="size-4"
                      style={{ color }}
                      aria-hidden="true"
                    />
                    <SelectItemText>{type.label}</SelectItemText>
                  </SelectItem>
                );
              })}
            </SelectList>
          </SelectPopup>
        </Select>
        {errors.type && (
          <p className="text-xs text-negative">{errors.type.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground" htmlFor="institution">
          Institution
        </label>
        <Input
          id="institution"
          placeholder="e.g. HDFC Bank"
          {...register("institution")}
        />
        {errors.institution && (
          <p className="text-xs text-negative">{errors.institution.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground" htmlFor="currency">
          Currency
        </label>
        <Input
          id="currency"
          placeholder="INR"
          maxLength={3}
          className="uppercase"
          {...register("currency")}
        />
        {errors.currency && (
          <p className="text-xs text-negative">{errors.currency.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground" htmlFor="current_balance">
          {isEditing ? "Current Balance" : "Opening Balance"}
        </label>
        <Input
          id="current_balance"
          type="number"
          step="0.01"
          placeholder="0.00"
          {...register("current_balance")}
        />
        {errors.current_balance && (
          <p className="text-xs text-negative">{errors.current_balance.message}</p>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {isEditing ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
