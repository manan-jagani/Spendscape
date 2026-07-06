"use client";

import { useCallback } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCreateTransaction } from "@/features/transactions/hooks/use-create-transaction";
import { useUpdateTransaction } from "@/features/transactions/hooks/use-update-transaction";
import { TransactionForm } from "@/features/transactions/components/transaction-form";

import type { TransactionFormValues } from "@/features/transactions/types";
import type { TransactionPageRow } from "@/types/api.types";

interface TransactionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: TransactionPageRow | null;
}

export function TransactionSheet({
  open,
  onOpenChange,
  transaction,
}: TransactionSheetProps) {
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  const handleSubmit = useCallback(
    async (values: TransactionFormValues) => {
      if (transaction) {
        await updateMutation.mutateAsync({
          id: transaction.id,
          account_id: values.account_id,
          category_id: values.category_id || null,
          kind: values.kind,
          amount: Number(values.amount),
          currency: values.currency,
          merchant: values.merchant || null,
          description: values.description || null,
          occurred_at: new Date(values.occurred_at).toISOString(),
          is_recurring: values.is_recurring,
          notes: values.notes || null,
        });
      } else {
        await createMutation.mutateAsync({
          account_id: values.account_id,
          category_id: values.category_id || null,
          kind: values.kind,
          amount: Number(values.amount),
          currency: values.currency,
          merchant: values.merchant || null,
          description: values.description || null,
          occurred_at: new Date(values.occurred_at).toISOString(),
          is_recurring: values.is_recurring,
          notes: values.notes || null,
        });
      }

      onOpenChange(false);
    },
    [transaction, createMutation, updateMutation, onOpenChange],
  );

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[min(24rem,92vw)]">
        <SheetHeader>
          <SheetTitle>
            {transaction ? "Edit transaction" : "Add transaction"}
          </SheetTitle>
          <SheetDescription>
            {transaction
              ? "Update the transaction details below."
              : "Enter the details of your new transaction."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <TransactionForm
            transaction={transaction}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
