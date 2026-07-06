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
  categories?: { name: string } | null;
}

export type BudgetWithCategory = BudgetRow & {
  categories: { name: string } | null;
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

export type BudgetStatus = "healthy" | "near_limit" | "over_budget";

export type SortOption = "highest_spent" | "lowest_spent" | "alphabetical" | "recently_updated";
