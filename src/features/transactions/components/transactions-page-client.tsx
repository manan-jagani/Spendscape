"use client";

import { useCallback, useState } from "react";
import { AlertCircle, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { FilterBar } from "@/features/transactions/components/filter-bar";
import { TransactionsList } from "@/features/transactions/components/transactions-list";
import { TransactionSheet } from "@/features/transactions/components/transaction-sheet";
import { DeleteDialog } from "@/features/transactions/components/delete-dialog";
import { EmptyState } from "@/features/transactions/components/empty-state";
import { TransactionsSkeleton } from "@/features/transactions/components/transactions-skeleton";
import { useTransactions } from "@/features/transactions/hooks/use-transactions";

import type {
  TransactionFiltersState,
} from "@/features/transactions/types";
import type { TransactionPageRow } from "@/types/api.types";

const DEFAULT_PAGE_SIZE = 50;

const DEFAULT_FILTERS: TransactionFiltersState = {
  kind: null,
  categoryId: null,
  accountId: null,
  dateFrom: null,
  dateTo: null,
  search: "",
  limit: DEFAULT_PAGE_SIZE,
  offset: 0,
};

export function TransactionsPageClient() {
  const [filters, setFilters] = useState<TransactionFiltersState>(DEFAULT_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionPageRow | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<TransactionPageRow | null>(null);

  const { data, isLoading, isError, error, refetch } = useTransactions(filters);

  const hasActiveFilters =
    filters.kind !== null ||
    filters.categoryId !== null ||
    filters.accountId !== null ||
    filters.dateFrom !== null ||
    filters.dateTo !== null ||
    filters.search !== "";

  const handleFiltersChange = useCallback(
    (partial: Partial<TransactionFiltersState>) => {
      setFilters((prev) => ({ ...prev, ...partial }));
    },
    [],
  );

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const handleOpenCreate = useCallback(() => {
    setEditingTransaction(null);
    setSheetOpen(true);
  }, []);

  const handleEdit = useCallback((transaction: TransactionPageRow) => {
    setEditingTransaction(transaction);
    setSheetOpen(true);
  }, []);

  const handleDelete = useCallback((transaction: TransactionPageRow) => {
    setDeletingTransaction(transaction);
  }, []);

  const handleSheetOpenChange = useCallback(
    (open: boolean) => {
      setSheetOpen(open);
      if (!open) setEditingTransaction(null);
    },
    [],
  );

  const handleDeleteDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open) setDeletingTransaction(null);
    },
    [],
  );

  const handlePageChange = useCallback(
    (newOffset: number) => {
      setFilters((prev) => ({ ...prev, offset: newOffset }));
    },
    [],
  );

  if (isLoading) {
    return <TransactionsSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <div className="grid size-12 place-items-center rounded-full bg-negative/10">
          <AlertCircle aria-hidden="true" className="size-5 text-negative" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            Failed to load transactions
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "An unexpected error occurred."}
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const transactions = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / filters.limit);
  const currentPage = Math.floor(filters.offset / filters.limit) + 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex-1" />
        <Button onClick={handleOpenCreate}>
          <Plus aria-hidden="true" className="size-4" />
          Add transaction
        </Button>
      </div>

      <FilterBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
      />

      {transactions.length > 0 ? (
        <>
          <TransactionsList
            transactions={transactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <p>
                Showing {(filters.offset + 1)}–{Math.min(filters.offset + transactions.length, total)} of{" "}
                {total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() =>
                    handlePageChange((currentPage - 2) * filters.limit)
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    handlePageChange(currentPage * filters.limit)
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              hasActiveFilters={hasActiveFilters}
              onAddTransaction={handleOpenCreate}
              onResetFilters={handleResetFilters}
            />
          </CardContent>
        </Card>
      )}

      <TransactionSheet
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        transaction={editingTransaction}
      />

      <DeleteDialog
        transaction={deletingTransaction}
        open={deletingTransaction !== null}
        onOpenChange={handleDeleteDialogOpenChange}
      />
    </div>
  );
}
