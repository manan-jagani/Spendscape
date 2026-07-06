"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteTransaction } from "@/features/transactions/hooks/use-delete-transaction";

import type { TransactionPageRow } from "@/types/api.types";

interface DeleteDialogProps {
  transaction: TransactionPageRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteDialog({
  transaction,
  open,
  onOpenChange,
}: DeleteDialogProps) {
  const deleteMutation = useDeleteTransaction();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!transaction) return;
    setError(null);

    try {
      await deleteMutation.mutateAsync({ id: transaction.id });
      onOpenChange(false);
    } catch {
      setError("Failed to delete transaction. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete transaction</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this transaction? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>

        {transaction && (
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
            <p className="font-medium text-foreground">
              {transaction.merchant ?? "Untitled"}
            </p>
            <p className="mt-1 text-muted-foreground">
              {transaction.category_name ?? "Uncategorized"} ·{" "}
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: transaction.currency,
                maximumFractionDigits: 0,
              }).format(transaction.amount)}
            </p>
          </div>
        )}

        {error && (
          <p className="text-sm text-negative">{error}</p>
        )}

        <div className="flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={deleteMutation.isPending}
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
