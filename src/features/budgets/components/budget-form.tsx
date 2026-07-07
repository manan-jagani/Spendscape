"use client";

import { useMemo } from "react";
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
import { formatCurrency } from "@/lib/formatters";

import type { BudgetFormValues, BudgetPeriod, BudgetRow } from "@/features/budgets/types";
import { BUDGET_STATUS_CONFIG, getBudgetStatus } from "@/features/budgets/types";

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

  const activeCategories = useMemo(() => categories ?? [], [categories]);

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
  const amountValue = useWatch({ control, name: "amount" });

  const selectedCategory = useMemo(
    () => activeCategories.find((c) => c.id === selectedCategoryId),
    [activeCategories, selectedCategoryId],
  );

  const categoryColor = selectedCategory?.color ?? "oklch(0.55 0.1 250)";

  const previewProgress = useMemo(() => {
    const amt = Number(amountValue);
    if (isNaN(amt) || amt <= 0) return { suggested: 0, progress: 0 };
    const suggested = Math.round(amt * 0.75);
    return { suggested, progress: Math.round((suggested / amt) * 100) };
  }, [amountValue]);

  const previewStatus = getBudgetStatus(previewProgress.progress);
  const previewConfig = BUDGET_STATUS_CONFIG[previewStatus];

  const categoryItems = activeCategories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 pt-6">
      {/* Live Preview */}
      {selectedCategoryId && !isEditing && (
        <div
          className="rounded-xl border p-4 transition-all"
          style={{
            borderColor: `${categoryColor}25`,
            backgroundColor: `${categoryColor}08`,
          }}
        >
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Preview
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div
              className="grid size-10 place-items-center rounded-lg"
              style={{ backgroundColor: `${categoryColor}15` }}
            >
              <span className="text-lg" style={{ color: categoryColor }}>
                {selectedCategory?.icon ?? "$"}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                {selectedCategory?.name ?? "Category"}
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedPeriod === "weekly" ? "Weekly" : selectedPeriod === "yearly" ? "Yearly" : "Monthly"} budget
              </p>
            </div>
          </div>
          {!isNaN(Number(amountValue)) && Number(amountValue) > 0 && (
            <div className="mt-3 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Projected: {formatCurrency(previewProgress.suggested)}
                </span>
                <span
                  className="font-medium"
                  style={{ color: previewConfig.color }}
                >
                  {previewProgress.progress}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(previewProgress.progress, 100)}%`,
                    backgroundColor: previewConfig.color,
                  }}
                />
              </div>
              <p
                className="text-[10px]"
                style={{ color: previewConfig.color }}
              >
                {previewStatus === "healthy"
                  ? "This budget looks well-balanced."
                  : previewStatus === "near_limit"
                    ? "Consider a slightly higher amount."
                    : "This amount may be too tight."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Category */}
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
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <SelectItemText>{cat.name}</SelectItemText>
                  </div>
                </SelectItem>
              ))}
            </SelectList>
          </SelectPopup>
        </Select>
        {errors.category_id && (
          <p className="text-xs text-negative">{errors.category_id.message}</p>
        )}
      </div>

      {/* Amount */}
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

      {/* Period */}
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

      {/* Start Date */}
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

      {/* Actions */}
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
