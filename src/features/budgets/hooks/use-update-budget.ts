"use client";

import { useMemo } from "react";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { createClient } from "@/lib/supabase/client";
import { useToastStore } from "@/components/ui/toast";

import type { UpdateBudgetInput } from "@/features/budgets/types";

export function useUpdateBudget() {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: async (input: UpdateBudgetInput) => {
      const { id, ...updates } = input;
      const { error } = await supabase
        .from("budgets")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.budgets() });
      const previous = queryClient.getQueryData(queryKeys.budgets());
      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.budgets(), context.previous);
      }
      addToast({
        type: "error",
        title: "Failed to update budget",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets() });
      addToast({
        type: "success",
        title: "Budget updated",
      });
    },
  });
}
