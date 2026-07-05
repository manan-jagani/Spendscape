import type { Enums } from "@/types/database.types";

export type TransactionKind = Enums<"transaction_kind">;

export interface MonthlySummaryCategory {
  category_id: string | null;
  category_name: string | null;
  color: string | null;
  total: number;
}

export interface MonthlySummary {
  total_balance: number;
  income: number;
  expense: number;
  net: number;
  savings_rate: number;
  categories: MonthlySummaryCategory[];
}

export interface TransactionPageRow {
  id: string;
  account_id: string;
  account_name: string | null;
  category_id: string | null;
  category_name: string | null;
  category_color: string | null;
  kind: TransactionKind;
  amount: number;
  currency: string;
  merchant: string | null;
  description: string | null;
  occurred_at: string;
  is_recurring: boolean;
  notes: string | null;
}

export interface TransactionsPage {
  total: number;
  rows: TransactionPageRow[];
}

export interface TransactionFilters {
  kind?: TransactionKind | null;
  categoryId?: string | null;
  accountId?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  search?: string | null;
  limit?: number;
  offset?: number;
}
