"use client";

import { useMemo, useState } from "react";
import { ArrowDownUp, Archive, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useBudgets } from "@/features/budgets/hooks/use-budgets";
import { useDeleteBudget } from "@/features/budgets/hooks/use-delete-budget";
import { useMonthlySpending } from "@/features/budgets/hooks/use-monthly-spending";
import { BudgetCard } from "@/features/budgets/components/budget-card";
import { BudgetSheet } from "@/features/budgets/components/budget-sheet";
import { getCurrentMonthFirst } from "@/lib/formatters";

import type { BudgetRow, SortOption } from "@/features/budgets/types";
import type { Tables } from "@/types/database.types";

type BudgetWithCategory = Tables<"budgets"> & {
  categories: { name: string } | null;
};

type ViewFilter = "all" | "active" | "archived";

function BudgetCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/50 bg-background/60 p-4 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="size-8 shrink-0 rounded-md" />
      </div>
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="flex flex-col gap-1 text-right">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

function BudgetGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <BudgetCardSkeleton key={i} />
      ))}
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-border/50 bg-background/30 px-6 py-16 text-center backdrop-blur-sm">
      <div className="grid size-14 place-items-center rounded-full bg-positive/10 ring-1 ring-positive/20">
        <span className="text-2xl">
          <svg
            aria-hidden="true"
            className="size-6 text-positive"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M12 20V10" />
            <path d="M18 20V4" />
            <path d="M6 20v-4" />
          </svg>
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-heading text-base font-medium text-foreground">
          No budgets yet
        </h3>
        <p className="text-sm text-muted-foreground">
          Create your first budget to track your spending and stay on top of your
          financial goals.
        </p>
      </div>
      <Button onClick={onCreate}>Create budget</Button>
    </div>
  );
}

function ErrorState({
  error,
  onRetry,
}: {
  error: Error;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-border/50 bg-background/30 px-6 py-16 text-center backdrop-blur-sm">
      <div className="grid size-14 place-items-center rounded-full bg-negative/10 ring-1 ring-negative/20">
        <span className="text-lg text-negative">!</span>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-heading text-base font-medium text-foreground">
          Failed to load budgets
        </h3>
        <p className="text-sm text-muted-foreground">
          {error.message || "Something went wrong. Please try again."}
        </p>
      </div>
      <Button variant="outline" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}

function getPeriodEndDate(startDate: string, period: string): string {
  const start = new Date(startDate);
  switch (period) {
    case "weekly": {
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return end.toISOString().slice(0, 10);
    }
    case "monthly": {
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
      return end.toISOString().slice(0, 10);
    }
    case "yearly": {
      const end = new Date(start.getFullYear() + 1, 0, 0);
      return end.toISOString().slice(0, 10);
    }
    default:
      return startDate;
  }
}

function isBudgetArchived(startDate: string, period: string): boolean {
  const endDate = getPeriodEndDate(startDate, period);
  const today = new Date().toISOString().slice(0, 10);
  return endDate < today;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "highest_spent", label: "Highest spent" },
  { value: "lowest_spent", label: "Lowest spent" },
  { value: "alphabetical", label: "Alphabetical" },
  { value: "recently_updated", label: "Recently updated" },
];

export function BudgetsPageClient() {
  const { data: budgets, isLoading, error, refetch } = useBudgets();
  const currentMonth = useMemo(() => getCurrentMonthFirst(), []);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetRow | null>(null);
  const [deleteBudget, setDeleteBudget] = useState<BudgetRow | null>(null);
  const [viewFilter, setViewFilter] = useState<ViewFilter>("active");
  const [sortOption, setSortOption] = useState<SortOption>("highest_spent");
  const [sortOpen, setSortOpen] = useState(false);

  const deleteMutation = useDeleteBudget();
  const spending = useMonthlySpending(currentMonth);

  const categoryTotals = useMemo(() => {
    const spendingData = spending.data ?? [];
    const map = new Map<string, number>();
    for (const txn of spendingData) {
      const catId = txn.category_id ?? "";
      map.set(catId, (map.get(catId) ?? 0) + txn.amount);
    }
    return map;
  }, [spending.data]);

  const spentByCategoryId = useMemo(() => {
    if (!budgets) return new Map<string, number>();
    const map = new Map<string, number>();
    for (const budget of budgets) {
      const categoryId = budget.category_id ?? "";
      const spent = categoryTotals.get(categoryId) ?? 0;
      map.set(budget.id, spent);
    }
    return map;
  }, [budgets, categoryTotals]);

  const processedBudgets = useMemo(() => {
    if (!budgets) return [];

    let filtered = [...budgets] as BudgetWithCategory[];

    if (viewFilter === "active") {
      filtered = filtered.filter(
        (b) => !isBudgetArchived(b.start_date, b.period),
      );
    } else if (viewFilter === "archived") {
      filtered = filtered.filter((b) =>
        isBudgetArchived(b.start_date, b.period),
      );
    }

    filtered.sort((a, b) => {
      const spentA = spentByCategoryId.get(a.id) ?? 0;
      const spentB = spentByCategoryId.get(b.id) ?? 0;

      switch (sortOption) {
        case "highest_spent":
          return spentB - spentA;
        case "lowest_spent":
          return spentA - spentB;
        case "alphabetical": {
          const nameA = a.categories?.name ?? "Uncategorized";
          const nameB = b.categories?.name ?? "Uncategorized";
          return nameA.localeCompare(nameB);
        }
        case "recently_updated":
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [budgets, viewFilter, sortOption, spentByCategoryId]);

  const handleCreate = () => {
    setEditingBudget(null);
    setSheetOpen(true);
  };

  const handleEdit = (budget: BudgetRow) => {
    setEditingBudget(budget);
    setSheetOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteBudget) return;
    try {
      await deleteMutation.mutateAsync(deleteBudget.id);
    } catch {
      // Error handled by query invalidation
    }
    setDeleteBudget(null);
  };

  const activeCount = budgets
    ? budgets.filter((b) => !isBudgetArchived(b.start_date, b.period)).length
    : 0;
  const archivedCount = budgets
    ? budgets.filter((b) => isBudgetArchived(b.start_date, b.period)).length
    : 0;

  let content: React.ReactNode;

  if (isLoading) {
    content = <BudgetGridSkeleton />;
  } else if (error) {
    content = <ErrorState error={error} onRetry={() => refetch()} />;
  } else if (!budgets || budgets.length === 0) {
    content = <EmptyState onCreate={handleCreate} />;
  } else {
    content = (
      <>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={viewFilter === "active" ? "default" : "ghost"}
              onClick={() => setViewFilter("active")}
            >
              <Clock className="size-3.5" />
              Active
              {activeCount > 0 && (
                <span className="ml-1 text-xs opacity-70">({activeCount})</span>
              )}
            </Button>
            <Button
              size="sm"
              variant={viewFilter === "archived" ? "default" : "ghost"}
              onClick={() => setViewFilter("archived")}
            >
              <Archive className="size-3.5" />
              Archived
              {archivedCount > 0 && (
                <span className="ml-1 text-xs opacity-70">({archivedCount})</span>
              )}
            </Button>
            {viewFilter === "all" ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setViewFilter("active")}
              >
                All
              </Button>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setViewFilter("all")}
              >
                All
                <span className="ml-1 text-xs opacity-70">
                  ({(activeCount + archivedCount)})
                </span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSortOpen(!sortOpen)}
              >
                <ArrowDownUp className="size-3.5" />
                {SORT_OPTIONS.find((o) => o.value === sortOption)?.label ?? "Sort"}
              </Button>
              {sortOpen && (
                <div className="absolute right-0 top-full z-10 mt-1 min-w-40 rounded-lg border border-border bg-popover p-1 shadow-card">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      className={`flex w-full cursor-default items-center rounded-md px-2.5 py-1.5 text-sm outline-hidden select-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring ${
                        sortOption === option.value
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => {
                        setSortOption(option.value);
                        setSortOpen(false);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button onClick={handleCreate} size="sm">
              Create budget
            </Button>
          </div>
        </div>

        {processedBudgets.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {processedBudgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                spent={spentByCategoryId.get(budget.id) ?? 0}
                onEdit={() => handleEdit(budget)}
                onDelete={() => setDeleteBudget(budget)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border/50 bg-background/30 px-6 py-12 text-center backdrop-blur-sm">
            <p className="text-sm text-muted-foreground">
              {viewFilter === "archived"
                ? "No archived budgets."
                : viewFilter === "active"
                  ? "No active budgets. Create one to get started."
                  : "No budgets found."}
            </p>
            {viewFilter !== "archived" && (
              <Button size="sm" variant="outline" onClick={handleCreate}>
                Create budget
              </Button>
            )}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {content}

      <BudgetSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        budget={editingBudget}
      />

      <Dialog
        open={!!deleteBudget}
        onOpenChange={(open) => {
          if (!open) setDeleteBudget(null);
        }}
      >
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete budget</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the budget for{" "}
              <strong>{deleteBudget?.categories?.name ?? "Uncategorized"}</strong>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setDeleteBudget(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              isLoading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
