import type { Enums } from "@/types/database.types";

export type BudgetPeriod = Enums<"budget_period">;

export interface BudgetRow {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  period: BudgetPeriod;
  start_date: string;
  created_at: string;
  updated_at: string;
  categories?: { name: string; icon?: string; color?: string } | null;
}

export type BudgetWithCategory = BudgetRow & {
  categories: { name: string; icon?: string; color?: string } | null;
};

export interface CreateBudgetInput {
  category_id: string | null;
  amount: number;
  period: BudgetPeriod;
  start_date: string;
}

export interface UpdateBudgetInput {
  id: string;
  category_id?: string | null;
  amount?: number;
  period?: BudgetPeriod;
  start_date?: string;
}

export interface BudgetFormValues {
  category_id: string;
  amount: string;
  period: BudgetPeriod;
  start_date: string;
}

export type BudgetStatus = "healthy" | "near_limit" | "critical" | "over_budget";

export type SortOption = "highest_spent" | "lowest_spent" | "alphabetical" | "recently_updated" | "health" | "budget_amount";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "highest_spent", label: "Highest spent" },
  { value: "lowest_spent", label: "Lowest spent" },
  { value: "budget_amount", label: "Budget amount" },
  { value: "health", label: "Health" },
  { value: "alphabetical", label: "Alphabetical" },
  { value: "recently_updated", label: "Recently updated" },
];

export interface BudgetHealthScore {
  score: number;
  label: string;
  tone: "emerald" | "amber" | "orange" | "red";
}

export const BUDGET_STATUS_THRESHOLDS = {
  healthy: 75,
  near_limit: 90,
  critical: 100,
} as const;

export const BUDGET_STATUS_CONFIG: Record<BudgetStatus, {
  label: string;
  color: string;
  bg: string;
  ring: string;
  text: string;
}> = {
  healthy: {
    label: "Healthy",
    color: "oklch(0.55 0.18 155)",
    bg: "oklch(0.55 0.18 155 / 0.1)",
    ring: "oklch(0.55 0.18 155 / 0.2)",
    text: "text-positive",
  },
  near_limit: {
    label: "Near limit",
    color: "oklch(0.7 0.15 80)",
    bg: "oklch(0.7 0.15 80 / 0.1)",
    ring: "oklch(0.7 0.15 80 / 0.2)",
    text: "text-warning",
  },
  critical: {
    label: "Critical",
    color: "oklch(0.65 0.18 45)",
    bg: "oklch(0.65 0.18 45 / 0.1)",
    ring: "oklch(0.65 0.18 45 / 0.2)",
    text: "text-orange-500",
  },
  over_budget: {
    label: "Over budget",
    color: "oklch(0.55 0.2 25)",
    bg: "oklch(0.55 0.2 25 / 0.1)",
    ring: "oklch(0.55 0.2 25 / 0.2)",
    text: "text-negative",
  },
};

export function getBudgetStatus(progress: number): BudgetStatus {
  if (progress >= 100) return "over_budget";
  if (progress >= BUDGET_STATUS_THRESHOLDS.critical) return "critical";
  if (progress >= BUDGET_STATUS_THRESHOLDS.near_limit) return "near_limit";
  return "healthy";
}

export function getBudgetHealthScore(
  budgets: { progress: number; amount: number }[],
): BudgetHealthScore {
  if (budgets.length === 0) return { score: 100, label: "Excellent", tone: "emerald" };
  const scores = budgets.map((b) => {
    const pct = b.progress * 100;
    if (pct >= 100) return 0;
    if (pct >= 90) return 25;
    if (pct >= 75) return 50;
    if (pct >= 50) return 75;
    return 100;
  });
  const avg = Math.round(
    scores.reduce<number>((a, b) => a + b, 0) / scores.length,
  );
  if (avg >= 80) return { score: avg, label: "Excellent", tone: "emerald" };
  if (avg >= 60) return { score: avg, label: "Good", tone: "amber" };
  if (avg >= 40) return { score: avg, label: "Fair", tone: "orange" };
  return { score: avg, label: "Needs attention", tone: "red" };
}

export function getDaysRemaining(startDate: string, period: BudgetPeriod): number {
  const end = getEndDate(startDate, period);
  const diffMs = new Date(end).getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function getEndDate(startDate: string, period: BudgetPeriod): string {
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

export function isBudgetArchived(startDate: string, period: string): boolean {
  return getEndDate(startDate, period as BudgetPeriod) < new Date().toISOString().slice(0, 10);
}

export function getDailyAllowance(amount: number, startDate: string, period: BudgetPeriod): number {
  const start = new Date(startDate);
  const end = new Date(getEndDate(startDate, period));
  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  return amount / days;
}

export function getRemainingSafeSpending(
  amount: number,
  spent: number,
  startDate: string,
  period: BudgetPeriod,
): number {
  const remaining = Math.max(amount - spent, 0);
  const daysLeft = getDaysRemaining(startDate, period);
  return daysLeft > 0 ? remaining / daysLeft : 0;
}
