"use client";

import { memo, useMemo } from "react";
import { MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";

import type { BudgetPeriod, BudgetRow, BudgetStatus } from "@/features/budgets/types";

interface BudgetCardProps {
  budget: BudgetRow & { categories?: { name: string } | null };
  spent: number;
  onEdit: (budget: BudgetRow) => void;
  onDelete: (budget: BudgetRow) => void;
}

function getBudgetStatus(progress: number): BudgetStatus {
  if (progress >= 100) return "over_budget";
  if (progress >= 80) return "near_limit";
  return "healthy";
}

const STATUS_BADGE: Record<BudgetStatus, { label: string; variant: "success" | "warning" | "danger" }> = {
  healthy: { label: "Healthy", variant: "success" },
  near_limit: { label: "Near limit", variant: "warning" },
  over_budget: { label: "Over budget", variant: "danger" },
};

const STATUS_ICON: Record<BudgetStatus, string> = {
  healthy: "\u{1F7E2}",
  near_limit: "\u{1F7E1}",
  over_budget: "\u{1F534}",
};

function getEndDate(startDate: string, period: BudgetPeriod): string {
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
  }
}

function getDaysRemaining(startDate: string, period: BudgetPeriod): number {
  const endDate = getEndDate(startDate, period);
  const end = new Date(endDate);
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export const BudgetCard = memo(function BudgetCard({
  budget,
  spent,
  onEdit,
  onDelete,
}: BudgetCardProps) {
  const categoryName = budget.categories?.name ?? "Uncategorized";
  const progress = budget.amount > 0
    ? Math.min(Math.round((spent / budget.amount) * 100), 100)
    : 0;
  const remaining = Math.max(budget.amount - spent, 0);
  const status = getBudgetStatus(progress);
  const daysRemaining = getDaysRemaining(budget.start_date, budget.period);
  const isOverBudget = progress >= 100;

  const statusBadge = STATUS_BADGE[status];
  const statusIcon = STATUS_ICON[status];

  const progressColor = useMemo(() => {
    switch (status) {
      case "healthy": return "bg-positive";
      case "near_limit": return "bg-warning";
      case "over_budget": return "bg-negative";
    }
  }, [status]);

  return (
    <Card size="sm" className="relative flex flex-col transition-all duration-fast hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transition-none">
      <CardContent className="flex flex-col gap-4 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-lg leading-none">{statusIcon}</span>
              <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
            </div>
            <h3 className="font-heading text-base font-medium leading-snug text-foreground">
              {categoryName}
            </h3>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 shrink-0"
                />
              }
            >
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Budget actions</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={2}>
              <DropdownMenuItem onClick={() => onEdit(budget)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(budget)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-muted-foreground">Spent</p>
            <p className={cn(
              "font-heading text-xl font-semibold tracking-tight",
              isOverBudget ? "text-negative" : "text-foreground",
            )}>
              {formatCurrency(spent)}
            </p>
          </div>
          <div className="flex flex-col gap-0.5 text-right">
            <p className="text-xs text-muted-foreground">Budget</p>
            <p className="font-heading text-xl font-semibold tracking-tight text-foreground">
              {formatCurrency(budget.amount)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{progress}% used</span>
            <span className={cn(
              isOverBudget ? "text-negative font-medium" : "text-muted-foreground",
            )}>
              {isOverBudget
                ? `${formatCurrency(Math.abs(budget.amount - spent))} over`
                : `${formatCurrency(remaining)} remaining`}
            </span>
          </div>
          <div
            aria-label={`${progress}% used`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={progress}
            className="h-2 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
          >
            <div
              aria-hidden="true"
              className={cn("h-full rounded-full transition-all duration-500 motion-reduce:transition-none", progressColor)}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {budget.period === "monthly"
              ? new Date(budget.start_date).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
              : budget.start_date}
          </span>
          {daysRemaining > 0 && !isOverBudget && (
            <span>{daysRemaining} days remaining</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
