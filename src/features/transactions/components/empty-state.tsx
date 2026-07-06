"use client";

import { Filter, Inbox, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  hasActiveFilters: boolean;
  onAddTransaction: () => void;
  onResetFilters: () => void;
}

export function EmptyState({
  hasActiveFilters,
  onAddTransaction,
  onResetFilters,
}: EmptyStateProps) {
  const iconClasses = "grid size-14 place-items-center rounded-full bg-background/80 ring-1 ring-border/50";

  if (hasActiveFilters) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border/50 bg-background/30 px-6 py-16 backdrop-blur-sm">
        <div className={iconClasses}>
          <Filter aria-hidden="true" className="size-5 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            No matching transactions
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search or filters.
          </p>
        </div>
        <Button variant="outline" onClick={onResetFilters}>
          Clear filters
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border/50 bg-background/30 px-6 py-16 backdrop-blur-sm">
      <div className={iconClasses}>
        <Inbox aria-hidden="true" className="size-5 text-muted-foreground" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">
          No transactions yet
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Add your first transaction to start tracking.
        </p>
      </div>
      <Button onClick={onAddTransaction}>
        <Plus aria-hidden="true" className="size-4" />
        Add transaction
      </Button>
    </div>
  );
}
