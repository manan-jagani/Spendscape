"use client";

import { TransactionRow } from "@/features/transactions/components/transaction-row";

import type { TransactionPageRow } from "@/types/api.types";

interface TransactionsListProps {
  transactions: readonly TransactionPageRow[];
  onEdit: (transaction: TransactionPageRow) => void;
  onDelete: (transaction: TransactionPageRow) => void;
}

export function TransactionsList({
  transactions,
  onEdit,
  onDelete,
}: TransactionsListProps) {
  if (transactions.length === 0) {
    return null;
  }

  return (
    <div className="divide-y divide-border/50">
      {transactions.map((transaction) => (
        <TransactionRow
          key={transaction.id}
          transaction={transaction}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
