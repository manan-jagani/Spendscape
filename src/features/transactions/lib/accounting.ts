import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

import type { TransactionKind } from "@/features/transactions/types";

export function computeBalanceDelta(kind: TransactionKind, amount: number): number {
  switch (kind) {
    case "income":
      return amount;
    case "expense":
      return -amount;
    case "transfer":
      return -amount;
  }
}

export async function updateAccountBalance(
  supabase: SupabaseClient<Database>,
  accountId: string,
  delta: number,
): Promise<void> {
  const { error } = await supabase.rpc("increment_account_balance", {
    p_account_id: accountId,
    p_delta: delta,
  });
  if (error) throw error;
}

export async function fetchTransactionKindAndAccount(
  supabase: SupabaseClient<Database>,
  transactionId: string,
): Promise<{ kind: TransactionKind; amount: number; account_id: string } | null> {
  const { data, error } = await supabase
    .from("transactions")
    .select("kind, amount, account_id")
    .eq("id", transactionId)
    .single();
  if (error) throw error;
  return data;
}


