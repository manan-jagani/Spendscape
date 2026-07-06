"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectItem,
  SelectItemText,
  SelectList,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccounts } from "@/features/dashboard/hooks/use-accounts";
import { useCategories } from "@/features/transactions/hooks/use-categories";

import type { TransactionFormValues } from "@/features/transactions/types";
import type { TransactionPageRow } from "@/types/api.types";

const transactionSchema = z.object({
  account_id: z.string().min(1, "Account is required"),
  category_id: z.string().min(1, "Category is required"),
  kind: z.enum(["income", "expense", "transfer"], "Type is required"),
  amount: z.string().min(1, "Amount is required").regex(/^\d+(\.\d{1,2})?$/, "Invalid amount"),
  currency: z.string().min(1, "Currency is required").max(3),
  merchant: z.string().max(255),
  description: z.string().max(500),
  occurred_at: z.string().min(1, "Date is required"),
  is_recurring: z.boolean(),
  notes: z.string().max(2000),
});

const KINDS = [
  { value: "expense", label: "Expense" },
  { value: "income", label: "Income" },
  { value: "transfer", label: "Transfer" },
] as const;

interface TransactionFormProps {
  transaction?: TransactionPageRow | null;
  onSubmit: (values: TransactionFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

function FormSkeleton() {
  return (
    <div className="flex flex-col gap-5 rounded-xl border border-border/50 bg-background/30 p-5 backdrop-blur-sm">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
}

export function TransactionForm({
  transaction,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: TransactionFormProps) {
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      account_id: transaction?.account_id ?? "",
      category_id: transaction?.category_id ?? "",
      kind: transaction?.kind ?? "expense",
      amount: transaction ? String(transaction.amount) : "",
      currency: transaction?.currency ?? "INR",
      merchant: transaction?.merchant ?? "",
      description: transaction?.description ?? "",
      occurred_at: transaction
        ? new Date(transaction.occurred_at).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
      is_recurring: transaction?.is_recurring ?? false,
      notes: transaction?.notes ?? "",
    },
  });

  const selectedKind = useWatch({ control, name: "kind" });
  const selectedAccountId = useWatch({ control, name: "account_id" });
  const selectedCategoryId = useWatch({ control, name: "category_id" });

  if (accountsLoading || categoriesLoading) {
    return <FormSkeleton />;
  }

  const hasNoAccounts = !accounts || accounts.length === 0;

  const kindItems = KINDS.map((k) => ({ value: k.value, label: k.label }));
  const accountItems =
    accounts?.map((a) => ({ value: a.id, label: a.name })) ?? [];
  const categoryItems =
    categories?.map((c) => ({ value: c.id, label: c.name })) ?? [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground" htmlFor="kind">
          Type
        </label>
        <Select
          value={selectedKind}
          onValueChange={(value) => setValue("kind", value as "income" | "expense" | "transfer")}
          items={kindItems}
        >
          <SelectTrigger className="w-full" disabled={hasNoAccounts}>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectPopup>
            <SelectList>
              {KINDS.map((kind) => (
                <SelectItem key={kind.value} value={kind.value}>
                  <SelectItemText>{kind.label}</SelectItemText>
                </SelectItem>
              ))}
            </SelectList>
          </SelectPopup>
        </Select>
        {errors.kind && (
          <p className="text-xs text-negative">{errors.kind.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground" htmlFor="account_id">
          Account
        </label>
        {hasNoAccounts ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-border/50 bg-background/30 px-4 py-6 text-center backdrop-blur-sm">
            <p className="text-sm text-muted-foreground">No accounts found.</p>
            <p className="text-xs text-muted-foreground">
              Create your first account to add transactions.
            </p>
          </div>
        ) : (
          <Select
            value={selectedAccountId}
            onValueChange={(value) => setValue("account_id", value as string)}
            items={accountItems}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectPopup>
              <SelectList>
                {accounts?.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    <SelectItemText>{account.name}</SelectItemText>
                  </SelectItem>
                ))}
              </SelectList>
            </SelectPopup>
          </Select>
        )}
        {errors.account_id && (
          <p className="text-xs text-negative">{errors.account_id.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground" htmlFor="category_id">
          Category
        </label>
        <Select
          value={selectedCategoryId}
          onValueChange={(value) => setValue("category_id", value as string)}
          items={categoryItems}
        >
          <SelectTrigger className="w-full" disabled={hasNoAccounts}>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectPopup>
            <SelectList>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <SelectItemText>{category.name}</SelectItemText>
                </SelectItem>
              ))}
            </SelectList>
          </SelectPopup>
        </Select>
        {errors.category_id && (
          <p className="text-xs text-negative">{errors.category_id.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground" htmlFor="amount">
          Amount
        </label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          disabled={hasNoAccounts}
          {...register("amount")}
        />
        {errors.amount && (
          <p className="text-xs text-negative">{errors.amount.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground" htmlFor="merchant">
          Merchant
        </label>
        <Input
          id="merchant"
          placeholder="e.g. Starbucks"
          disabled={hasNoAccounts}
          {...register("merchant")}
        />
        {errors.merchant && (
          <p className="text-xs text-negative">{errors.merchant.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground" htmlFor="description">
          Description
        </label>
        <Input
          id="description"
          placeholder="Optional description"
          disabled={hasNoAccounts}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-negative">{errors.description.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground" htmlFor="occurred_at">
          Date
        </label>
        <Input
          id="occurred_at"
          type="datetime-local"
          disabled={hasNoAccounts}
          {...register("occurred_at")}
        />
        {errors.occurred_at && (
          <p className="text-xs text-negative">{errors.occurred_at.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="flex items-center gap-2.5 text-sm font-medium text-foreground">
          <input
            type="checkbox"
            className="size-4 rounded border-border/60 bg-background text-primary accent-primary transition-all duration-fast focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50"
            disabled={hasNoAccounts}
            {...register("is_recurring")}
          />
          <span>Recurring transaction</span>
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting} disabled={hasNoAccounts || isSubmitting}>
          {transaction ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
