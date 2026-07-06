"use client";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";

import { createClient } from "@/lib/supabase/client";

import type { UpdateTransactionInput } from "@/features/transactions/types";
import {
  computeBalanceDelta,
  fetchTransactionKindAndAccount,
  updateAccountBalance,
} from "@/features/transactions/lib/accounting";

export function useUpdateTransaction() {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateTransactionInput) => {
      const { id, ...updates } = input;

      const old = await fetchTransactionKindAndAccount(supabase, id);
      if (!old) throw new Error("Transaction not found");

      const { error: updateError } = await supabase
        .from("transactions")
        .update(updates)
        .eq("id", id);

      if (updateError) throw updateError;

      const oldDelta = computeBalanceDelta(old.kind, old.amount);
      await updateAccountBalance(supabase, old.account_id, -oldDelta);

      const newKind = updates.kind ?? old.kind;
      const newAmount = updates.amount ?? old.amount;
      const newAccountId = updates.account_id ?? old.account_id;

      const newDelta = computeBalanceDelta(newKind, newAmount);
      await updateAccountBalance(supabase, newAccountId, newDelta);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["monthly-summary"] });
      queryClient.invalidateQueries({ queryKey: ["insights"] });
    },
  });
}
