"use client";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";

import { queryKeys } from "@/lib/query-keys";
import { createClient } from "@/lib/supabase/client";
import { useToastStore } from "@/components/ui/toast";

import type { AccountRow } from "@/features/accounts/types";

export function useDeleteAccount() {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (account: AccountRow) => {
      const { count } = await supabase
        .from("transactions")
        .select("*", { count: "exact", head: true })
        .eq("account_id", account.id);

      if (count && count > 0) {
        const { error } = await supabase
          .from("accounts")
          .update({ is_active: false })
          .eq("id", account.id);
        if (error) throw error;
        return { action: "archived" as const, account };
      }

      const { error } = await supabase
        .from("accounts")
        .delete()
        .eq("id", account.id);
      if (error) throw error;
      return { action: "deleted" as const, account };
    },

    onMutate: async (account) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.accounts() });
      const previous = queryClient.getQueryData<AccountRow[]>(queryKeys.accounts());
      queryClient.setQueryData<AccountRow[]>(queryKeys.accounts(), (old) =>
        old?.filter((a) => a.id !== account.id) ?? [],
      );
      return { previous };
    },

    onError: (_err, _account, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.accounts(), context.previous);
      }
      addToast({
        type: "error",
        title: "Failed to delete account",
      });
    },

    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts() });
      if (result.action === "deleted") {
        addToast({
          type: "success",
          title: "Account deleted",
          description: "The account has been permanently removed.",
        });
      } else {
        addToast({
          type: "info",
          title: "Account archived",
          description: "The account has transactions and was archived instead of deleted.",
        });
      }
    },
  });
}
