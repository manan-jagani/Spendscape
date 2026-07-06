import type { Enums } from "@/types/database.types";

export type TransactionKind = Enums<"transaction_kind">;

export interface CreateTransactionInput {
  account_id: string;
  category_id: string | null;
  kind: TransactionKind;
  amount: number;
  currency: string;
  merchant: string | null;
  description: string | null;
  occurred_at: string;
  is_recurring: boolean;
  notes: string | null;
}

export interface UpdateTransactionInput extends Partial<CreateTransactionInput> {
  id: string;
}

export interface DeleteTransactionInput {
  id: string;
}

export interface TransactionFormValues {
  account_id: string;
  category_id: string;
  kind: TransactionKind;
  amount: string;
  currency: string;
  merchant: string;
  description: string;
  occurred_at: string;
  is_recurring: boolean;
  notes: string;
}

export interface TransactionFiltersState {
  kind: TransactionKind | null;
  categoryId: string | null;
  accountId: string | null;
  dateFrom: string | null;
  dateTo: string | null;
  search: string;
  limit: number;
  offset: number;
}
