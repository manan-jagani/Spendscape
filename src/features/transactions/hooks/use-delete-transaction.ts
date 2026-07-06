"use client";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";

import { createClient } from "@/lib/supabase/client";

import type { DeleteTransactionInput } from "@/features/transactions/types";
import {
  computeBalanceDelta,
  fetchTransactionKindAndAccount,
  updateAccountBalance,
} from "@/features/transactions/lib/accounting";

export function useDeleteTransaction() {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: DeleteTransactionInput) => {
      const old = await fetchTransactionKindAndAccount(supabase, input.id);
      if (!old) throw new Error("Transaction not found");

      const { error: deleteError } = await supabase
        .from("transactions")
        .delete()
        .eq("id", input.id);

      if (deleteError) throw deleteError;

      const delta = computeBalanceDelta(old.kind, old.amount);
      await updateAccountBalance(supabase, old.account_id, -delta);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["monthly-summary"] });
      queryClient.invalidateQueries({ queryKey: ["insights"] });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
