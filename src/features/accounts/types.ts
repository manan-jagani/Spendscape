import {
  Building2,
  PiggyBank,
  CreditCard,
  Wallet,
  TrendingUp,
  CircleDollarSign,
} from "lucide-react";

import type { Enums } from "@/types/database.types";

export type AccountType = Enums<"account_type">;

export interface AccountRow {
  id: string;
  name: string;
  institution: string | null;
  type: AccountType;
  currency: string;
  current_balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface CreateAccountInput {
  name: string;
  institution: string | null;
  type: AccountType;
  currency: string;
  current_balance: number;
}

export interface UpdateAccountInput {
  id: string;
  name?: string;
  institution?: string | null;
  type?: AccountType;
  currency?: string;
  current_balance?: number;
}

export interface AccountFormValues {
  name: string;
  institution: string;
  type: AccountType;
  currency: string;
  current_balance: string;
}

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  checking: "Checking",
  savings: "Savings",
  credit_card: "Credit Card",
  cash: "Cash",
  investment: "Investment",
  loan: "Loan",
};

export const ACCOUNT_TYPE_COLORS: Record<AccountType, string> = {
  checking: "oklch(0.65 0.12 165)",
  savings: "oklch(0.72 0.10 85)",
  credit_card: "oklch(0.45 0.02 0)",
  cash: "oklch(0.65 0.08 175)",
  investment: "oklch(0.55 0.14 165)",
  loan: "oklch(0.68 0.12 75)",
};

export const ACCOUNT_TYPE_ACCENT: Record<AccountType, string> = {
  checking: "emerald",
  savings: "gold",
  credit_card: "graphite",
  cash: "teal",
  investment: "deep-emerald",
  loan: "amber",
};

export const ACCOUNT_TYPE_ICONS: Record<AccountType, typeof Building2> = {
  checking: Building2,
  savings: PiggyBank,
  credit_card: CreditCard,
  cash: Wallet,
  investment: TrendingUp,
  loan: CircleDollarSign,
};

export type SortOption =
  | "newest"
  | "oldest"
  | "highest-balance"
  | "lowest-balance"
  | "alphabetical";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "highest-balance", label: "Highest Balance" },
  { value: "lowest-balance", label: "Lowest Balance" },
  { value: "alphabetical", label: "Alphabetical" },
];
