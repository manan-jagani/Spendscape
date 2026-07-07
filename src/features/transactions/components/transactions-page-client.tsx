"use client";

import { useCallback, useMemo, useState } from "react";
import { AlertCircle, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { formatCurrency } from "@/lib/formatters";

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

function TransactionSummaryCards({ transactions }: { transactions: readonly TransactionPageRow[] }) {
  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    let transfer = 0;
    for (const t of transactions) {
      if (t.kind === "income") income += t.amount;
      else if (t.kind === "expense") expense += t.amount;
      else if (t.kind === "transfer") transfer += t.amount;
    }
    return { income, expense, transfer };
  }, [transactions]);

  const cards = [
    { label: "Income", value: summary.income, color: "text-income", bg: "bg-income/8" },
    { label: "Expenses", value: summary.expense, color: "text-expense", bg: "bg-expense/8" },
    { label: "Transfers", value: summary.transfer, color: "text-transfer", bg: "bg-transfer/8" },
    { label: "Net Flow", value: summary.income - summary.expense, color: "text-foreground", bg: "bg-muted/30" },
  ];

  if (transactions.length === 0) return null;

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className={`rounded-xl border border-border bg-background/40 px-4 py-3 backdrop-blur-[20px] ${c.bg}`}>
          <p className="text-xs text-muted-foreground">{c.label}</p>
          <p className={`mt-1 font-heading text-lg font-semibold tracking-tight ${c.color}`}>
            {formatCurrency(Math.abs(c.value))}
          </p>
        </div>
      ))}
    </div>
  );
}

export function TransactionsPageClient() {
  const [filters, setFilters] = useState<TransactionFiltersState>(DEFAULT_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionPageRow | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<TransactionPageRow | null>(null);
  const [searchInput, setSearchInput] = useState("");

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

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchInput(value);
      handleFiltersChange({ search: value, offset: 0 });
    },
    [handleFiltersChange],
  );

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearchInput("");
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
      {/* Summary cards */}
      <TransactionSummaryCards transactions={transactions} />

      {/* Floating toolbar: search + filters + add */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-background/60 px-4 py-3 shadow-[inset_0_1px_0_oklch(1_0_0/0.06)] backdrop-blur-[30px]">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            aria-hidden="true"
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label="Search transactions"
            placeholder="Search transactions..."
            value={searchInput}
            onChange={handleSearchChange}
            className="border-0 bg-transparent pl-9 shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="flex items-center gap-2">
          <FilterBar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onReset={handleResetFilters}
          />
          <Button onClick={handleOpenCreate} className="shrink-0">
            <Plus aria-hidden="true" className="size-4" />
            Add
          </Button>
        </div>
      </div>

      {/* Transaction rows */}
      {transactions.length > 0 ? (
        <div className="glass-premium overflow-hidden rounded-xl">
          <TransactionsList
            transactions={transactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
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
        </div>
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
