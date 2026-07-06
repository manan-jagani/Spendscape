"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionHeading } from "@/features/dashboard/components/section-heading";
import { MOTION_TRANSITION } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { TransactionPageRow, MonthlySummary } from "@/types/api.types";

/* ─── Types ──────────────────────────────────────────────────── */

interface Highlight {
  icon: string;
  key: string;
  label: string;
  description: string;
  priority: "high" | "medium" | "low";
}

interface BudgetItem {
  id: string;
  name: string;
  progress: number;
}

/* ─── Highlight detection ─────────────────────────────────────── */

function detectHighlights(
  summary: MonthlySummary,
  budgets: readonly BudgetItem[],
  transactions: readonly TransactionPageRow[],
): Highlight[] {
  const items: Highlight[] = [];

  const recentIncome = transactions.find((t) => t.kind === "income");
  if (recentIncome && recentIncome.amount > 0) {
    const isSalary = Math.abs(recentIncome.amount) >= 10000;
    if (isSalary) {
      items.push({
        icon: "▲",
        key: "income",
        label: `${recentIncome.merchant ?? "Income"} received today`,
        description: `${recentIncome.amount.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}`,
        priority: "high",
      });
    }
  }

  const recentRecurring = transactions.find((t) => t.is_recurring);
  if (recentRecurring) {
    items.push({
      icon: "↻",
      key: "recurring",
      label: `${recentRecurring.merchant ?? "Subscription"} renewed`,
      description: `${recentRecurring.amount.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}`,
      priority: "medium",
    });
  }

  if (summary.savings_rate > 0) {
    items.push({
      icon: "✓",
      key: "savings",
      label: `Saving ${summary.savings_rate}% of income this month`,
      description: summary.savings_rate >= 20 ? "Great discipline!" : "Keep building your savings",
      priority: summary.savings_rate >= 20 ? "high" : "medium",
    });
  }

  const atRisk = budgets.filter((b) => b.progress >= 80 && b.progress < 100);
  const overBudget = budgets.filter((b) => b.progress >= 100);
  if (overBudget.length > 0) {
    items.push({
      icon: "!",
      key: "over-budget",
      label: `${overBudget.length} budget${overBudget.length > 1 ? "s" : ""} exceeded`,
      description: overBudget.map((b) => b.name).join(", "),
      priority: "high",
    });
  } else if (atRisk.length > 0) {
    items.push({
      icon: "△",
      key: "at-risk",
      label: `${atRisk.length} budget${atRisk.length > 1 ? "s" : ""} nearing limit`,
      description: atRisk.map((b) => b.name).join(", "),
      priority: "medium",
    });
  }

  if (summary.net > 0 && budgets.length > 0) {
    const allOnTrack = budgets.filter((b) => b.progress < 100).length === budgets.length;
    if (allOnTrack) {
      items.push({
        icon: "★",
        key: "on-track",
        label: "Within budget across all categories",
        description: "Positive cash flow this month",
        priority: "low",
      });
    }
  }

  return items;
}

/* ─── Priority styles ─────────────────────────────────────────── */

const PRIORITY_STYLES = {
  high: { badge: "bg-expense/10 text-expense", ring: "ring-expense/20" },
  medium: { badge: "bg-warning/10 text-warning", ring: "ring-warning/20" },
  low: { badge: "bg-income/10 text-income", ring: "ring-income/20" },
} as const;

const PRIORITY_BADGE = {
  high: "Important",
  medium: "Notice",
  low: "Update",
} as const;

/* ─── Component ───────────────────────────────────────────────── */

export function TodaysHighlights({
  budgets,
  summary,
  transactions,
}: {
  budgets: readonly BudgetItem[];
  summary: MonthlySummary;
  transactions: readonly TransactionPageRow[];
}) {
  const reduce = !!useReducedMotion();
  const highlights = useMemo(
    () => detectHighlights(summary, budgets, transactions),
    [summary, budgets, transactions],
  );

  if (highlights.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <SectionHeading
          description="Notable events from your finances"
          title="Today's Highlights"
        />
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {highlights.map((h, i) => (
            <motion.li
              key={h.key}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3 transition-colors duration-fast ease-standard motion-reduce:transition-none",
                "border-border hover:border-border-strong",
              )}
              initial={reduce ? { opacity: 1 } : { opacity: 0, x: -8 }}
              transition={{ ...MOTION_TRANSITION.normal, delay: i * 0.06 }}
            >
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-md text-xs",
                  PRIORITY_STYLES[h.priority].badge,
                )}
              >
                {h.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{h.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {h.description}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1",
                  PRIORITY_STYLES[h.priority].badge,
                  PRIORITY_STYLES[h.priority].ring,
                )}
              >
                {PRIORITY_BADGE[h.priority]}
              </span>
            </motion.li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
