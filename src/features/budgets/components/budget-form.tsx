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
import { useCategories } from "@/features/transactions/hooks/use-categories";

import type { BudgetFormValues, BudgetPeriod, BudgetRow } from "@/features/budgets/types";

const BUDGET_PERIODS: { value: BudgetPeriod; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const budgetSchema = z.object({
  category_id: z.string().min(1, "Category is required"),
  amount: z.string().refine(
    (v) => !isNaN(Number(v)) && Number(v) > 0,
    "Amount must be positive",
  ),
  period: z.enum(["weekly", "monthly", "yearly"]),
  start_date: z.string().min(1, "Month is required"),
});

interface BudgetFormProps {
  budget?: BudgetRow | null;
  onSubmit: (values: BudgetFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function BudgetForm({
  budget,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: BudgetFormProps) {
  const { data: categories } = useCategories();

  const activeCategories = categories ?? [];

  const isEditing = !!budget;

  const defaultStartDate = budget
    ? budget.start_date.slice(0, 7)
    : new Date().toISOString().slice(0, 7);

  const defaultPeriod = budget?.period ?? "monthly";

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category_id: budget?.category_id ?? "",
      amount: budget ? String(budget.amount) : "",
      period: defaultPeriod,
      start_date: defaultStartDate,
    },
  });

  const selectedCategoryId = useWatch({ control, name: "category_id" });
  const selectedPeriod = useWatch({ control, name: "period" });

  const categoryItems = activeCategories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground" htmlFor="category_id">
          Category
        </label>
        <Select
          value={selectedCategoryId}
          onValueChange={(value) => setValue("category_id", value as string)}
          items={categoryItems}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectPopup>
            <SelectList>
              {activeCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  <SelectItemText>{cat.name}</SelectItemText>
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
          Budget Amount
        </label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="e.g. 10000"
          {...register("amount")}
        />
        {errors.amount && (
          <p className="text-xs text-negative">{errors.amount.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground" htmlFor="period">
          Period
        </label>
        <Select
          value={selectedPeriod}
          onValueChange={(value) => setValue("period", value as BudgetPeriod)}
          items={BUDGET_PERIODS}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectPopup>
            <SelectList>
              {BUDGET_PERIODS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  <SelectItemText>{p.label}</SelectItemText>
                </SelectItem>
              ))}
            </SelectList>
          </SelectPopup>
        </Select>
        {errors.period && (
          <p className="text-xs text-negative">{errors.period.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground" htmlFor="start_date">
          Month
        </label>
        <Input
          id="start_date"
          type="month"
          {...register("start_date")}
        />
        {errors.start_date && (
          <p className="text-xs text-negative">{errors.start_date.message}</p>
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
          {isEditing ? "Update" : "Create budget"}
        </Button>
      </div>
    </form>
  );
}
