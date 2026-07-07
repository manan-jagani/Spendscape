"use client";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";

import { queryKeys } from "@/lib/query-keys";
import { createClient } from "@/lib/supabase/client";
import { useToastStore } from "@/components/ui/toast";

import type { AccountRow, UpdateAccountInput } from "@/features/accounts/types";

export function useUpdateAccount() {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (input: UpdateAccountInput) => {
      const { id, ...updates } = input;
      const { error } = await supabase
        .from("accounts")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },

    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.accounts() });
      const previous = queryClient.getQueryData<AccountRow[]>(queryKeys.accounts());
      queryClient.setQueryData<AccountRow[]>(queryKeys.accounts(), (old) =>
        old?.map((a) =>
          a.id === input.id ? { ...a, ...input } : a,
        ) ?? [],
      );
      return { previous };
    },

    onError: (_err, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.accounts(), context.previous);
      }
      addToast({ type: "error", title: "Failed to update account" });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts() });
      addToast({ type: "success", title: "Account updated" });
    },
  });
}
