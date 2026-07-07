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

export function useArchiveAccount() {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("accounts")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
    },

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.accounts() });
      const previous = queryClient.getQueryData<AccountRow[]>(queryKeys.accounts());
      queryClient.setQueryData<AccountRow[]>(queryKeys.accounts(), (old) =>
        old?.map((a) => (a.id === id ? { ...a, is_active: false } : a)) ?? [],
      );
      return { previous };
    },

    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.accounts(), context.previous);
      }
      addToast({ type: "error", title: "Failed to archive account" });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts() });
      addToast({ type: "success", title: "Account archived" });
    },
  });
}
