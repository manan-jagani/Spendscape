"use client";

import { useCallback } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { BudgetForm } from "@/features/budgets/components/budget-form";
import { useCreateBudget } from "@/features/budgets/hooks/use-create-budget";
import { useUpdateBudget } from "@/features/budgets/hooks/use-update-budget";

import type { BudgetFormValues, BudgetRow } from "@/features/budgets/types";

interface BudgetSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget?: BudgetRow | null;
}

export function BudgetSheet({
  open,
  onOpenChange,
  budget,
}: BudgetSheetProps) {
  const createMutation = useCreateBudget();
  const updateMutation = useUpdateBudget();

  const handleSubmit = useCallback(
    async (values: BudgetFormValues) => {
      const startDate = `${values.start_date}-01`;

      if (budget) {
        await updateMutation.mutateAsync({
          id: budget.id,
          category_id: values.category_id || null,
          amount: Number(values.amount),
          period: values.period,
          start_date: startDate,
        });
      } else {
        await createMutation.mutateAsync({
          category_id: values.category_id || null,
          amount: Number(values.amount),
          period: values.period,
          start_date: startDate,
        });
      }

      onOpenChange(false);
    },
    [budget, createMutation, updateMutation, onOpenChange],
  );

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[min(24rem,92vw)]">
        <SheetHeader>
          <SheetTitle>
            {budget ? "Edit budget" : "Create budget"}
          </SheetTitle>
          <SheetDescription>
            {budget
              ? "Update the budget details below."
              : "Set a spending limit for a category."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <BudgetForm
            budget={budget}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
