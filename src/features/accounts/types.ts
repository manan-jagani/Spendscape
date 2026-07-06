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
  checking: "hsl(217, 91%, 60%)",
  savings: "hsl(160, 84%, 39%)",
  credit_card: "hsl(38, 92%, 50%)",
  cash: "hsl(271, 81%, 56%)",
  investment: "hsl(190, 90%, 50%)",
  loan: "hsl(0, 84%, 60%)",
};
