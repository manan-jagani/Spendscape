"use client";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";

import { createClient } from "@/lib/supabase/client";

import type { CreateTransactionInput } from "@/features/transactions/types";
import {
  computeBalanceDelta,
  updateAccountBalance,
} from "@/features/transactions/lib/accounting";

export function useCreateTransaction() {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTransactionInput) => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Not authenticated");

      const { error: insertError } = await supabase
        .from("transactions")
        .insert({ ...input, user_id: user.id });

      if (insertError) throw insertError;

      const delta = computeBalanceDelta(input.kind, input.amount);
      await updateAccountBalance(supabase, input.account_id, delta);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["monthly-summary"] });
      queryClient.invalidateQueries({ queryKey: ["insights"] });
    },
  });
}
